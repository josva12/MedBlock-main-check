// File Location: src/routes/chat.js

const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { 
  getChats, 
  getMessages,
  createOrGetConversation,
  sendMessage,
  markMessagesAsDelivered,
  markMessagesAsRead,
  archiveChat,
  unarchiveChat,
  deleteChat
} = require('../controllers/chatController');

const router = express.Router();

// Apply the authenticate middleware to ALL chat routes
router.use(authenticate);

// Define all chat-related routes
router.get('/', getChats); // Handles GET /api/v1/chat
router.post('/conversation', createOrGetConversation); // Handles POST /api/v1/chat/conversation
router.get('/:chatId/messages', getMessages); // Handles GET /api/v1/chat/:chatId/messages
router.post('/:chatId/messages', sendMessage); // Handles POST /api/v1/chat/:chatId/messages
router.put('/:chatId/messages/delivered', markMessagesAsDelivered); // Handles PUT /api/v1/chat/:chatId/messages/delivered
router.put('/:chatId/messages/read', markMessagesAsRead); // Handles PUT /api/v1/chat/:chatId/messages/read
router.patch('/:chatId/archive', archiveChat); // Handles PATCH /api/v1/chat/:chatId/archive
router.patch('/:chatId/unarchive', unarchiveChat); // Handles PATCH /api/v1/chat/:chatId/unarchive
router.delete('/:chatId', deleteChat); // Handles DELETE /api/v1/chat/:chatId

module.exports = router; 