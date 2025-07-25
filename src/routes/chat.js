const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const Chat = require('../models/Chat');
const User = require('../models/User');
const upload = require('../config/multerConfig');
const logger = require('../utils/logger');
const router = express.Router();
const EncryptionService = require('../utils/encryption');
const encryptionService = new EncryptionService();
const fs = require('fs');
const path = require('path');
const { io } = require('../server');

// Helper: Consent check for patient-provider chat
async function checkConsent(user, chat) {
  // If user is a patient, check their consent
  if (user.role === 'patient') {
    if (!user.hasConsentedToChat) {
      return false;
    }
  }
  // If chat is between patient and provider, check patient consent
  const participantUsers = await User.find({ _id: { $in: chat.participants } });
  const patient = participantUsers.find(u => u.role === 'patient');
  if (patient && !patient.hasConsentedToChat) {
    return false;
  }
  return true;
}

// Get all chats for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.userId
    })
    .populate('participants', 'fullName email role')
    .populate('messages.senderId', 'fullName')
    .sort({ lastMessage: -1 });

    res.json({ success: true, data: chats });
  } catch (error) {
    logger.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats', details: error.message });
  }
});

// Get or create a chat between two users
router.post('/conversation', authenticateToken, async (req, res) => {
  try {
    const { participantId } = req.body;
    
    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.userId, participantId] },
      isGroupChat: false
    }).populate('participants', 'fullName email role');

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [req.user.userId, participantId],
        messages: []
      });
      await chat.save();
      chat = await chat.populate('participants', 'fullName email role');
    }

    res.json({ success: true, data: chat });
  } catch (error) {
    logger.error('Error creating/fetching conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation', details: error.message });
  }
});

// Get messages for a specific chat (add message expiry)
router.get('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    // Consent check
    if (!(await checkConsent(req.user, chat))) {
      logger.audit('chat_consent_denied', req.user.userId, chatId, { action: 'fetch_messages', timestamp: new Date().toISOString() });
      return res.status(403).json({ error: 'Consent required for chat' });
    }
    // Message expiry: filter out messages older than 30 days (unless admin)
    const now = new Date();
    const isAdmin = req.user.role === 'admin';
    let messages = chat.messages
      .filter(msg => isAdmin || (now - msg.createdAt <= 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice((page - 1) * limit, (page - 1) * limit + parseInt(limit))
      .reverse();

    // Mark as delivered for all messages not sent by this user and not already delivered
    let updated = false;
    messages.forEach(msg => {
      if (msg.senderId.toString() !== req.user.userId &&
          !msg.deliveredTo.some(d => d.userId.toString() === req.user.userId)) {
        msg.deliveredTo.push({ userId: req.user.userId, deliveredAt: new Date() });
        updated = true;
      }
    });
    if (updated) await chat.save();

    // Decrypt text messages before sending to client
    const decryptedMessages = messages.map(msg => {
      const msgObj = msg.toObject ? msg.toObject() : msg;
      if (msgObj.type === 'text' && msgObj.isEncrypted && msgObj.content) {
        try {
          msgObj.content = encryptionService.decrypt(msgObj.content);
        } catch (e) {
          msgObj.content = '[decryption error]';
        }
      }
      return msgObj;
    });

    res.json({ 
      success: true, 
      data: decryptedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: chat.messages.length,
        hasMore: skip + parseInt(limit) < chat.messages.length
      }
    });
    logger.audit('chat_messages_fetched', req.user.userId, chatId, { action: 'fetch_messages', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

// Send a message
router.post('/:chatId/messages', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text' } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    // Consent check
    if (!(await checkConsent(req.user, chat))) {
      logger.audit('chat_consent_denied', req.user.userId, chatId, { action: 'send_message', timestamp: new Date().toISOString() });
      return res.status(403).json({ error: 'Consent required for chat' });
    }

    let encryptedContent = content;
    let isEncrypted = true;
    if (type === 'text' && content) {
      encryptedContent = encryptionService.encrypt(content);
      isEncrypted = true;
    }

    const messageData = {
      senderId: req.user.userId,
      content: encryptedContent || '',
      type,
      isEncrypted,
      createdAt: new Date()
    };

    // Handle file upload
    if (req.file) {
      // Check file size (10MB limit)
      if (req.file.size > 10 * 1024 * 1024) {
        fs.unlinkSync(req.file.path); // Remove the uploaded file
        return res.status(400).json({ error: 'File size must be less than 10MB' });
      }

      // Encrypt the file
      const fileBuffer = fs.readFileSync(req.file.path);
      const encryptedBuffer = encryptionService.encryptFile(fileBuffer);
      // Save encrypted file to secure directory
      const secureDir = path.join(__dirname, '..', 'uploads', 'secure');
      if (!fs.existsSync(secureDir)) fs.mkdirSync(secureDir, { recursive: true });
      const encryptedFileName = `${Date.now()}-${req.file.originalname}.enc`;
      const encryptedFilePath = path.join(secureDir, encryptedFileName);
      fs.writeFileSync(encryptedFilePath, encryptedBuffer);
      // Remove the original unencrypted file
      fs.unlinkSync(req.file.path);

      messageData.fileUrl = encryptedFilePath;
      messageData.fileName = req.file.originalname;
      messageData.fileSize = req.file.size;
      messageData.mimeType = req.file.mimetype;
      // Determine type based on mime type
      if (req.file.mimetype.startsWith('image/')) {
        messageData.type = 'image';
      } else if (req.file.mimetype.startsWith('video/')) {
        messageData.type = 'video';
      } else if (req.file.mimetype.startsWith('audio/')) {
        messageData.type = 'audio';
      } else {
        messageData.type = 'file';
      }
      messageData.isEncrypted = true; // Media is now encrypted
    }

    chat.messages.push(messageData);
    chat.lastMessage = new Date();
    await chat.save();

    // Populate sender info
    const populatedMessage = chat.messages[chat.messages.length - 1];
    await populatedMessage.populate('senderId', 'fullName');

    // Decrypt content before sending to client (for sender's confirmation)
    let responseMessage = populatedMessage.toObject();
    if (responseMessage.type === 'text' && responseMessage.isEncrypted && responseMessage.content) {
      responseMessage.content = encryptionService.decrypt(responseMessage.content);
    }

    // Emit newMessage event to all participants except sender
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.userId) {
        io.to(participantId.toString()).emit('newMessage', {
          chatId: chat._id,
          message: responseMessage
        });
      }
    });

    res.json({ success: true, data: responseMessage });
    logger.audit('chat_message_sent', req.user.userId, chatId, { messageId: messageData._id, action: 'send_message', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

// Mark messages as read
router.patch('/:chatId/read', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    // Consent check
    if (!(await checkConsent(req.user, chat))) {
      logger.audit('chat_consent_denied', req.user.userId, chatId, { action: 'mark_read', timestamp: new Date().toISOString() });
      return res.status(403).json({ error: 'Consent required for chat' });
    }

    // Mark unread messages as read
    let updatedMessages = [];
    chat.messages.forEach(message => {
      if (message.senderId.toString() !== req.user.userId && 
          !message.readBy.some(read => read.userId.toString() === req.user.userId)) {
        message.readBy.push({
          userId: req.user.userId,
          readAt: new Date()
        });
        updatedMessages.push(message);
      }
    });

    await chat.save();
    // Emit messageRead event to sender for each updated message
    updatedMessages.forEach(message => {
      io.to(message.senderId.toString()).emit('messageRead', {
        chatId: chat._id,
        messageId: message._id,
        readBy: req.user.userId
      });
    });
    res.json({ success: true, message: 'Messages marked as read' });
    logger.audit('chat_message_read', req.user.userId, chatId, { action: 'mark_read', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read', details: error.message });
  }
});

// Mark a message as delivered for a user
router.patch('/:chatId/messages/:messageId/delivered', authenticateToken, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    // Consent check
    if (!(await checkConsent(req.user, chat))) {
      logger.audit('chat_consent_denied', req.user.userId, chatId, { action: 'mark_delivered', timestamp: new Date().toISOString() });
      return res.status(403).json({ error: 'Consent required for chat' });
    }
    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    // Only mark as delivered if not sender and not already delivered
    if (message.senderId.toString() !== req.user.userId &&
        !message.deliveredTo.some(d => d.userId.toString() === req.user.userId)) {
      message.deliveredTo.push({ userId: req.user.userId, deliveredAt: new Date() });
      await chat.save();
      // Emit messageDelivered event to sender
      io.to(message.senderId.toString()).emit('messageDelivered', {
        chatId: chat._id,
        messageId: message._id,
        deliveredBy: req.user.userId
      });
    }
    res.json({ success: true, message: 'Message marked as delivered' });
    logger.audit('chat_message_delivered', req.user.userId, chatId, { messageId, action: 'mark_delivered', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Error marking message as delivered:', error);
    res.status(500).json({ error: 'Failed to mark as delivered', details: error.message });
  }
});

// Get unread message count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.userId
    });

    let totalUnread = 0;
    const unreadByChat = {};

    chats.forEach(chat => {
      const unreadCount = chat.messages.filter(message => 
        message.senderId.toString() !== req.user.userId && 
        !message.readBy.some(read => read.userId.toString() === req.user.userId)
      ).length;
      
      totalUnread += unreadCount;
      unreadByChat[chat._id] = unreadCount;
    });

    res.json({ 
      success: true, 
      data: {
        totalUnread,
        unreadByChat
      }
    });
  } catch (error) {
    logger.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count', details: error.message });
  }
});

// Delete a message (only sender can delete)
router.delete('/:chatId/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Can only delete your own messages' });
    }

    message.remove();
    await chat.save();

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message', details: error.message });
  }
});

// Secure media download endpoint
router.get('/:chatId/messages/:messageId/media', authenticateToken, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    // Consent check
    if (!(await checkConsent(req.user, chat))) {
      logger.audit('chat_consent_denied', req.user.userId, chatId, { action: 'download_media', timestamp: new Date().toISOString() });
      return res.status(403).json({ error: 'Consent required for chat' });
    }
    const message = chat.messages.id(messageId);
    if (!message || !message.fileUrl) {
      return res.status(404).json({ error: 'Media not found' });
    }
    // Read and decrypt the file
    if (!fs.existsSync(message.fileUrl)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    const encryptedBuffer = fs.readFileSync(message.fileUrl);
    let decryptedBuffer;
    try {
      decryptedBuffer = encryptionService.decryptFile(encryptedBuffer);
    } catch (e) {
      logger.error('Error decrypting media file:', e);
      return res.status(500).json({ error: 'Failed to decrypt file' });
    }
    res.setHeader('Content-Type', message.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${message.fileName || 'file'}"`);
    res.send(decryptedBuffer);
    logger.audit('chat_media_downloaded', req.user.userId, chatId, { messageId, action: 'download_media', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Error serving media file:', error);
    res.status(500).json({ error: 'Failed to serve media', details: error.message });
  }
});

// Archive/exit chat (user-specific, does not delete chat)
router.patch('/:chatId/archive', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    // Add user to archivedBy if not already present
    if (!chat.archivedBy.some(a => a.userId.toString() === req.user.userId)) {
      chat.archivedBy.push({ userId: req.user.userId, archivedAt: new Date() });
      await chat.save();
    }
    logger.audit('chat_archived', req.user.userId, chatId, { action: 'archive', timestamp: new Date().toISOString() });
    res.json({ success: true, message: 'Chat archived (exited)' });
  } catch (error) {
    logger.error('Error archiving chat:', error);
    res.status(500).json({ error: 'Failed to archive chat', details: error.message });
  }
});

// Delete entire conversation (with confirmation)
router.delete('/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { confirm } = req.body;
    if (!confirm) return res.status(400).json({ error: 'Confirmation required to delete conversation' });
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    // Only allow if user is participant or admin
    if (!chat.participants.includes(req.user.userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this conversation' });
    }
    await chat.deleteOne();
    logger.audit('chat_deleted', req.user.userId, chatId, { action: 'delete_conversation', timestamp: new Date().toISOString() });
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    logger.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation', details: error.message });
  }
});

// Delete selected messages (with confirmation and option to delete own/all)
router.delete('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageIds, deleteAll, confirm } = req.body;
    if (!confirm) return res.status(400).json({ error: 'Confirmation required to delete messages' });
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    // Only allow if user is participant or admin
    if (!chat.participants.includes(req.user.userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete messages' });
    }
    let deletedCount = 0;
    if (deleteAll && (req.user.role === 'admin' || chat.participants.some(p => p.toString() === req.user.userId))) {
      // Delete all messages in chat
      deletedCount = chat.messages.length;
      chat.messages = [];
    } else if (Array.isArray(messageIds) && messageIds.length > 0) {
      // Delete only selected messages
      chat.messages = chat.messages.filter(msg => {
        // Only allow deleting own messages unless admin
        if (req.user.role === 'admin' || msg.senderId.toString() === req.user.userId) {
          if (messageIds.includes(msg._id.toString())) {
            deletedCount++;
            return false;
          }
        }
        return true;
      });
    } else {
      return res.status(400).json({ error: 'No messages selected for deletion' });
    }
    await chat.save();
    logger.audit('chat_messages_deleted', req.user.userId, chatId, { action: 'delete_messages', deletedCount, timestamp: new Date().toISOString() });
    res.json({ success: true, message: `Deleted ${deletedCount} message(s)` });
  } catch (error) {
    logger.error('Error deleting messages:', error);
    res.status(500).json({ error: 'Failed to delete messages', details: error.message });
  }
});

// Delivery status API for ticks
router.get('/:chatId/messages/:messageId/status', authenticateToken, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    const message = chat.messages.id(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    // Status: sent (exists), delivered (deliveredTo includes all except sender), read (readBy includes all except sender)
    const participantIds = chat.participants.map(p => p.toString()).filter(id => id !== message.senderId.toString());
    const deliveredIds = message.deliveredTo.map(d => d.userId.toString());
    const readIds = message.readBy.map(r => r.userId.toString());
    const delivered = participantIds.every(id => deliveredIds.includes(id));
    const read = participantIds.every(id => readIds.includes(id));
    let status = 'sent';
    if (delivered) status = 'delivered';
    if (read) status = 'read';
    res.json({ success: true, status });
  } catch (error) {
    logger.error('Error getting message status:', error);
    res.status(500).json({ error: 'Failed to get message status', details: error.message });
  }
});

module.exports = router; 