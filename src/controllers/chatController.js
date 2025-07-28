// File Location: src/controllers/chatController.js

const Chat = require('../models/Chat');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// Get Socket.IO instance
let io;
const setIO = (socketIO) => {
  io = socketIO;
};

/**
 * @desc    Get all chats for the logged-in user
 * @route   GET /api/v1/chat
 * @access  Private
 */
exports.getChats = async (req, res) => {
  try {
    const { showArchived = false } = req.query;
    
    let query = { participants: req.user._id };
    
    if (!showArchived) {
      // Filter out chats archived by the current user
      query['archivedBy.userId'] = { $ne: req.user._id };
    }
    
    const chats = await Chat.find(query)
      .populate('participants', 'fullName email role profilePicture showLastSeen showOnlineStatus lastSeen isOnline')
      .populate({
        path: 'messages',
        populate: {
            path: 'senderId',
            select: 'fullName profilePicture'
        }
       })
      .sort({ lastMessage: -1, updatedAt: -1 }); // Sort by last message time, then by update time

    // Ensure all chats have at least an empty messages array and lastMessage
    const processedChats = chats.map(chat => {
      if (!chat.messages) chat.messages = [];
      if (!chat.lastMessage) chat.lastMessage = chat.updatedAt || chat.createdAt;
      return chat;
    });

    res.status(200).json({ success: true, data: processedChats });
  } catch (error) {
    logger.error('Failed to fetch user chats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chats' });
  }
};

/**
 * @desc    Get messages for a specific chat
 * @route   GET /api/v1/chat/:chatId/messages
 * @access  Private
 */
exports.getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findOne({ _id: chatId, participants: req.user._id })
            .populate({
                path: 'messages.senderId',
                select: 'fullName profilePicture'
            });

        if (!chat) {
            return res.status(404).json({ success: false, error: 'Chat not found or you are not a participant.' });
        }

        res.status(200).json({ success: true, data: chat.messages });
    } catch (error) {
        logger.error(`Failed to fetch messages for chat ${req.params.chatId}:`, error);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
};

/**
 * @desc    Get or create a one-on-one conversation
 * @route   POST /api/v1/chat/conversation
 * @access  Private (Requires user to be logged in)
 */
exports.createOrGetConversation = async (req, res) => {
  const currentUserId = req.user._id; 
  const { participantId } = req.body;

  if (!participantId) return res.status(400).json({ success: false, error: 'Participant ID is required.' });
  if (currentUserId.toString() === participantId) return res.status(400).json({ success: false, error: 'You cannot start a conversation with yourself.' });
  
  const query = {
    isGroupChat: false,
    participants: { $all: [new mongoose.Types.ObjectId(currentUserId), new mongoose.Types.ObjectId(participantId)] }
  };

  try {
    const existingChat = await Chat.findOne(query).populate('participants', 'fullName email role profilePicture showLastSeen showOnlineStatus lastSeen isOnline');
    if (existingChat) {
      // Update the lastMessage timestamp to keep conversation active
      existingChat.lastMessage = new Date();
      existingChat.updatedAt = new Date();
      await existingChat.save();
      return res.status(200).json({ success: true, data: existingChat });
    }

    const newChat = new Chat({ 
      participants: [currentUserId, participantId],
      lastMessage: new Date(), // Set initial lastMessage to ensure conversation appears in recent chats
      updatedAt: new Date()
    });
    let savedChat = await newChat.save();
    savedChat = await savedChat.populate('participants', 'fullName email role profilePicture showLastSeen showOnlineStatus lastSeen isOnline');

    logger.audit('CONVERSATION_CREATED', currentUserId, `chat:${savedChat._id}`);
    res.status(201).json({ success: true, data: savedChat });

  } catch (error) {
    logger.error('FATAL: Failed to create or get conversation:', error);
    return res.status(500).json({ success: false, error: 'An unexpected server error occurred.' });
  }
};

/**
 * @desc    Send a message to a chat
 * @route   POST /api/v1/chat/:chatId/messages
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content, messageType = 'text' } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, error: 'Message content is required.' });
        }

        const chat = await Chat.findOne({ _id: chatId, participants: req.user._id });
        if (!chat) {
            return res.status(404).json({ success: false, error: 'Chat not found or you are not a participant.' });
        }

        const newMessage = {
            senderId: req.user._id,
            content: content.trim(),
            messageType: messageType,
            status: 'sent',
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = new Date();
        chat.updatedAt = new Date();
        await chat.save();

        // Populate the sender information for the response
        const populatedChat = await Chat.findById(chatId)
            .populate('messages.senderId', 'fullName profilePicture');

        const sentMessage = populatedChat.messages[populatedChat.messages.length - 1];

        res.status(201).json({ 
            success: true, 
            data: sentMessage,
            message: 'Message sent successfully'
        });

        // Emit real-time update to all participants
        if (io) {
            chat.participants.forEach(participantId => {
                if (participantId.toString() !== req.user._id.toString()) {
                    io.to(`user:${participantId}`).emit('newMessage', {
                        chatId: chat._id,
                        message: sentMessage
                    });
                }
            });
        }

    } catch (error) {
        logger.error(`Failed to send message to chat ${req.params.chatId}:`, error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
};

/**
 * @desc    Send a media message to a chat
 * @route   POST /api/v1/chat/:chatId/media
 * @access  Private
 */
exports.sendMediaMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content = '' } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Media file is required.' });
        }

        const chat = await Chat.findOne({ _id: chatId, participants: req.user._id });
        if (!chat) {
            return res.status(404).json({ success: false, error: 'Chat not found or you are not a participant.' });
        }

        // Determine message type based on file mimetype
        let messageType = 'file';
        if (req.file.mimetype.startsWith('image/')) {
            messageType = 'image';
        } else if (req.file.mimetype.startsWith('video/')) {
            messageType = 'video';
        } else if (req.file.mimetype.startsWith('audio/')) {
            messageType = 'audio';
        }

        const newMessage = {
            senderId: req.user._id,
            content: content.trim(),
            messageType: messageType,
            status: 'sent',
            timestamp: new Date(),
            fileUrl: `/uploads/chat-media/${req.file.filename}`,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
        };

        chat.messages.push(newMessage);
        chat.lastMessage = new Date();
        await chat.save();

        // Populate the sender information for the response
        const populatedChat = await Chat.findById(chatId)
            .populate('messages.senderId', 'fullName profilePicture');

        const sentMessage = populatedChat.messages[populatedChat.messages.length - 1];

        res.status(201).json({ 
            success: true, 
            data: sentMessage,
            message: 'Media message sent successfully'
        });

        // Emit real-time update to all participants
        if (io) {
            chat.participants.forEach(participantId => {
                if (participantId.toString() !== req.user._id.toString()) {
                    io.to(`user:${participantId}`).emit('newMessage', {
                        chatId: chat._id,
                        message: sentMessage
                    });
                }
            });
        }

    } catch (error) {
        logger.error(`Failed to send media message to chat ${req.params.chatId}:`, error);
        res.status(500).json({ success: false, error: 'Failed to send media message' });
    }
};

/**
 * @desc    Mark messages as delivered
 * @route   PUT /api/v1/chat/:chatId/messages/delivered
 * @access  Private
 */
exports.markMessagesAsDelivered = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { messageIds } = req.body;

        const chat = await Chat.findOne({ _id: chatId, participants: req.user._id });
        if (!chat) {
            return res.status(404).json({ success: false, error: 'Chat not found or you are not a participant.' });
        }

        // Mark messages as delivered
        for (const messageId of messageIds) {
            const message = chat.messages.id(messageId);
            if (message && message.senderId.toString() !== req.user._id.toString()) {
                // Check if already delivered to this user
                const alreadyDelivered = message.deliveredTo.some(
                    delivery => delivery.userId.toString() === req.user._id.toString()
                );
                
                if (!alreadyDelivered) {
                    message.deliveredTo.push({
                        userId: req.user._id,
                        deliveredAt: new Date()
                    });
                    message.status = 'delivered';
                }
            }
        }

        await chat.save();

        res.status(200).json({ success: true, message: 'Messages marked as delivered' });
    } catch (error) {
        logger.error(`Failed to mark messages as delivered in chat ${req.params.chatId}:`, error);
        res.status(500).json({ success: false, error: 'Failed to mark messages as delivered' });
    }
};

/**
 * @desc    Add reaction to a message
 * @route   POST /api/v1/chat/messages/:messageId/react
 * @access  Private
 */
exports.addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;

        if (!emoji) {
            return res.status(400).json({ success: false, error: 'Emoji is required.' });
        }

        // Find the chat that contains this message
        const chat = await Chat.findOne({
            'messages._id': messageId,
            participants: req.user._id
        });

        if (!chat) {
            return res.status(404).json({ success: false, error: 'Message not found or you are not a participant.' });
        }

        // Find the specific message
        const message = chat.messages.id(messageId);
        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found.' });
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
            reaction => reaction.userId.toString() === req.user._id.toString() && reaction.emoji === emoji
        );

        if (existingReaction) {
            return res.status(400).json({ success: false, error: 'You have already reacted with this emoji.' });
        }

        // Add the reaction
        message.reactions.push({
            userId: req.user._id,
            userName: req.user.fullName,
            emoji: emoji,
            reactedAt: new Date()
        });

        await chat.save();

        // Populate the message for response
        const populatedChat = await Chat.findById(chat._id)
            .populate('messages.senderId', 'fullName profilePicture')
            .populate('messages.reactions.userId', 'fullName');

        const updatedMessage = populatedChat.messages.id(messageId);

        res.status(200).json({ 
            success: true, 
            data: updatedMessage,
            message: 'Reaction added successfully'
        });

        // Emit real-time reaction update to all participants
        if (io) {
            chat.participants.forEach(participantId => {
                if (participantId.toString() !== req.user._id.toString()) {
                    io.to(`user:${participantId}`).emit('reactionUpdate', {
                        chatId: chat._id,
                        messageId: messageId,
                        message: updatedMessage
                    });
                }
            });
        }

    } catch (error) {
        logger.error(`Failed to add reaction to message ${req.params.messageId}:`, error);
        res.status(500).json({ success: false, error: 'Failed to add reaction' });
    }
};

/**
 * @desc    Touch or create conversation (for when user opens chat or starts typing)
 * @route   POST /api/v1/chat/touch-conversation
 * @access  Private
 */
exports.touchConversation = async (req, res) => {
  const currentUserId = req.user._id; 
  const { participantId } = req.body;

  if (!participantId) return res.status(400).json({ success: false, error: 'Participant ID is required.' });
  if (currentUserId.toString() === participantId) return res.status(400).json({ success: false, error: 'You cannot start a conversation with yourself.' });
  
  const query = {
    isGroupChat: false,
    participants: { $all: [new mongoose.Types.ObjectId(currentUserId), new mongoose.Types.ObjectId(participantId)] }
  };

  try {
    const existingChat = await Chat.findOne(query).populate('participants', 'fullName email role profilePicture showLastSeen showOnlineStatus lastSeen isOnline');
    
    if (existingChat) {
      // Update the lastMessage timestamp to keep conversation active
      existingChat.lastMessage = new Date();
      existingChat.updatedAt = new Date();
      await existingChat.save();
      return res.status(200).json({ success: true, data: existingChat });
    }

    // Create new conversation if it doesn't exist
    const newChat = new Chat({ 
      participants: [currentUserId, participantId],
      lastMessage: new Date(), // Set initial lastMessage to ensure conversation appears in recent chats
      updatedAt: new Date()
    });
    let savedChat = await newChat.save();
    savedChat = await savedChat.populate('participants', 'fullName email role profilePicture showLastSeen showOnlineStatus lastSeen isOnline');

    logger.audit('CONVERSATION_TOUCHED', currentUserId, `chat:${savedChat._id}`);
    res.status(201).json({ success: true, data: savedChat });

  } catch (error) {
    logger.error('Failed to touch conversation:', error);
    return res.status(500).json({ success: false, error: 'An unexpected server error occurred.' });
  }
};

/**
 * @desc    Remove reaction from a message
 * @route   DELETE /api/v1/chat/messages/:messageId/react
 * @access  Private
 */
exports.removeReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;

        if (!emoji) {
            return res.status(400).json({ success: false, error: 'Emoji is required.' });
        }

        // Find the chat that contains this message
        const chat = await Chat.findOne({
            'messages._id': messageId,
            participants: req.user._id
        });

        if (!chat) {
            return res.status(404).json({ success: false, error: 'Message not found or you are not a participant.' });
        }

        // Find the specific message
        const message = chat.messages.id(messageId);
        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found.' });
        }

        // Remove the reaction
        message.reactions = message.reactions.filter(
            reaction => !(reaction.userId.toString() === req.user._id.toString() && reaction.emoji === emoji)
        );

        await chat.save();

        res.status(200).json({ 
            success: true, 
            message: 'Reaction removed successfully'
        });

    } catch (error) {
        logger.error(`Failed to remove reaction from message ${req.params.messageId}:`, error);
        res.status(500).json({ success: false, error: 'Failed to remove reaction' });
    }
};

/**
 * @desc    Mark messages as read
 * @route   PUT /api/v1/chat/:chatId/messages/read
 * @access  Private
 */
exports.markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { messageIds } = req.body;

        const chat = await Chat.findOne({ _id: chatId, participants: req.user._id });
        if (!chat) {
            return res.status(404).json({ success: false, error: 'Chat not found or you are not a participant.' });
        }

        // Mark messages as read
        for (const messageId of messageIds) {
            const message = chat.messages.id(messageId);
            if (message && message.senderId.toString() !== req.user._id.toString()) {
                // Check if already read by this user
                const alreadyRead = message.readBy.some(
                    read => read.userId.toString() === req.user._id.toString()
                );
                
                if (!alreadyRead) {
                    message.readBy.push({
                        userId: req.user._id,
                        readAt: new Date()
                    });
                    message.status = 'read';
                }
            }
        }

        await chat.save();

        res.status(200).json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        logger.error(`Failed to mark messages as read in chat ${req.params.chatId}:`, error);
        res.status(500).json({ success: false, error: 'Failed to mark messages as read' });
    }
};

/**
 * @desc    Archive a chat
 * @route   PATCH /api/v1/chat/:chatId/archive
 * @access  Private
 */
exports.archiveChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findOne({ _id: chatId, participants: req.user._id });

        if (!chat) {
            return res.status(404).json({ success: false, error: 'Chat not found or you are not a participant.' });
        }

        // Add user to archivedBy array if not already there
        const alreadyArchived = chat.archivedBy.some(archive => 
            archive.userId.toString() === req.user._id.toString()
        );

        if (!alreadyArchived) {
            chat.archivedBy.push({
                userId: req.user._id,
                archivedAt: new Date()
            });
            await chat.save();
        }

        res.status(200).json({ success: true, message: 'Chat archived successfully' });

    } catch (error) {
        logger.error(`Failed to archive chat ${req.params.chatId}:`, error);
        res.status(500).json({ success: false, error: 'Failed to archive chat' });
    }
};

/**
 * @desc    Unarchive a chat
 * @route   PATCH /api/v1/chat/:chatId/unarchive
 * @access  Private
 */
exports.unarchiveChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findOne({ _id: chatId, participants: req.user._id });

        if (!chat) {
            return res.status(404).json({ success: false, error: 'Chat not found or you are not a participant.' });
        }

        // Remove user from archivedBy array
        chat.archivedBy = chat.archivedBy.filter(archive => 
            archive.userId.toString() !== req.user._id.toString()
        );
        
        await chat.save();

        res.status(200).json({ success: true, message: 'Chat unarchived successfully' });

    } catch (error) {
        logger.error(`Failed to unarchive chat ${req.params.chatId}:`, error);
        res.status(500).json({ success: false, error: 'Failed to unarchive chat' });
    }
};

/**
 * @desc    Delete a chat
 * @route   DELETE /api/v1/chat/:chatId
 * @access  Private
 */
exports.deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findOne({ _id: chatId, participants: req.user._id });

        if (!chat) {
            return res.status(404).json({ success: false, error: 'Chat not found or you are not a participant.' });
        }

        await Chat.findByIdAndDelete(chatId);

        res.status(200).json({ success: true, message: 'Chat deleted successfully' });

    } catch (error) {
        logger.error(`Failed to delete chat ${req.params.chatId}:`, error);
        res.status(500).json({ success: false, error: 'Failed to delete chat' });
    }
};

// Export setIO function
exports.setIO = setIO; 