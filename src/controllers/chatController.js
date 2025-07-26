// File Location: src/controllers/chatController.js

const Chat = require('../models/Chat');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

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
      .populate('participants', 'fullName email role profilePicture')
      .populate({
        path: 'messages',
        populate: {
            path: 'senderId',
            select: 'fullName'
        }
       })
      .sort({ updatedAt: -1 }); // Sort by most recently updated

    res.status(200).json({ success: true, data: chats });
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
    const existingChat = await Chat.findOne(query).populate('participants', 'fullName email role profilePicture');
    if (existingChat) return res.status(200).json({ success: true, data: existingChat });

    const newChat = new Chat({ participants: [currentUserId, participantId] });
    let savedChat = await newChat.save();
    savedChat = await savedChat.populate('participants', 'fullName email role profilePicture');

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

    } catch (error) {
        logger.error(`Failed to send message to chat ${req.params.chatId}:`, error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
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