// File Location: src/controllers/chatController.js

const Chat = require('../models/Chat');
const User = require('../models/User');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * @desc    Get or create a one-on-one conversation
 * @route   POST /api/v1/chat/conversation
 * @access  Private (Requires user to be logged in)
 */
exports.createOrGetConversation = async (req, res) => {
  // From the correct auth middleware, req.user will contain the logged-in user's details, including _id
  const currentUserId = req.user._id; 
  const { participantId } = req.body;

  // 1. Validate that the participantId was actually sent
  if (!participantId) {
    logger.warn('CREATE_CONVERSATION_FAILED: Participant ID was not provided.', { user: currentUserId });
    return res.status(400).json({ success: false, error: 'Participant ID is required.' });
  }

  // 2. Prevent a user from creating a chat with themselves
  if (currentUserId.toString() === participantId) {
    logger.warn('CREATE_CONVERSATION_FAILED: User attempted to chat with themselves.', { user: currentUserId });
    return res.status(400).json({ success: false, error: 'You cannot start a conversation with yourself.' });
  }
  
  // 3. Define the query to find a pre-existing 1-on-1 chat
  const query = {
    isGroupChat: false,
    participants: {
      // Use $all to find a chat containing BOTH users, in any order.
      $all: [
        new mongoose.Types.ObjectId(currentUserId),
        new mongoose.Types.ObjectId(participantId),
      ]
    }
  };

  try {
    // 4. Look for the chat and populate participant details
    const existingChat = await Chat.findOne(query).populate('participants', 'fullName email role profilePicture');

    if (existingChat) {
      // If the chat already exists, return it immediately.
      return res.status(200).json({
        success: true,
        data: existingChat,
        message: 'Existing conversation found.'
      });
    }

    // 5. If no chat is found, create a new one.
    const newChat = new Chat({
      participants: [currentUserId, participantId],
    });

    let savedChat = await newChat.save();
    
    // We must populate the details after saving to get the correct user info.
    savedChat = await savedChat.populate('participants', 'fullName email role profilePicture');

    logger.audit('CONVERSATION_CREATED', currentUserId, `chat:${savedChat._id}`);

    res.status(201).json({
      success: true,
      data: savedChat,
      message: 'New conversation started successfully.'
    });

  } catch (error) {
    // 6. If any part of this process fails, catch the error and prevent a server crash.
    logger.error('FATAL: Failed to create or get conversation:', error);
    return res.status(500).json({ success: false, error: 'An unexpected server error occurred.' });
  }
};


// You can move all the other functions from chat.js (getMessages, sendMessage, etc.)
// into this file as well to keep your code organized.
// exports.getChats = async (req, res) => { ... };
// exports.getMessages = async (req, res) => { ... }; 