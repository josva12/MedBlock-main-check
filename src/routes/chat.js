const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const Chat = require('../models/Chat');
const User = require('../models/User');
const upload = require('../config/multerConfig');
const logger = require('../utils/logger');
const router = express.Router();

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

// Get messages for a specific chat
router.get('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const skip = (page - 1) * limit;
    const messages = chat.messages
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + parseInt(limit))
      .reverse();

    res.json({ 
      success: true, 
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: chat.messages.length,
        hasMore: skip + parseInt(limit) < chat.messages.length
      }
    });
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

    // Check if user is participant
    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messageData = {
      senderId: req.user.userId,
      content: content || '',
      type,
      isEncrypted: true,
      createdAt: new Date()
    };

    // Handle file upload
    if (req.file) {
      // Check file size (10MB limit)
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size must be less than 10MB' });
      }

      messageData.fileUrl = req.file.path;
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
    }

    chat.messages.push(messageData);
    chat.lastMessage = new Date();
    await chat.save();

    // Populate sender info
    const populatedMessage = chat.messages[chat.messages.length - 1];
    await populatedMessage.populate('senderId', 'fullName');

    res.json({ success: true, data: populatedMessage });
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

    // Check if user is participant
    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mark unread messages as read
    chat.messages.forEach(message => {
      if (message.senderId.toString() !== req.user.userId && 
          !message.readBy.some(read => read.userId.toString() === req.user.userId)) {
        message.readBy.push({
          userId: req.user.userId,
          readAt: new Date()
        });
      }
    });

    await chat.save();
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    logger.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read', details: error.message });
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

module.exports = router; 