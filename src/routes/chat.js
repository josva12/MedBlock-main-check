// File Location: src/routes/chat.js

const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { 
  getChats, 
  getMessages,
  createOrGetConversation,
  touchConversation,
  sendMessage,
  sendMediaMessage,
  markMessagesAsDelivered,
  markMessagesAsRead,
  addReaction,
  removeReaction,
  archiveChat,
  unarchiveChat,
  deleteChat
} = require('../controllers/chatController');

const mediaUpload = require('../config/mediaUploadConfig');

const router = express.Router();

// Apply the authenticate middleware to ALL chat routes
router.use(authenticate);

// Define all chat-related routes
router.get('/', getChats); // Handles GET /api/v1/chat
router.post('/conversation', createOrGetConversation); // Handles POST /api/v1/chat/conversation
router.post('/touch-conversation', touchConversation); // Handles POST /api/v1/chat/touch-conversation
router.get('/:chatId/messages', getMessages); // Handles GET /api/v1/chat/:chatId/messages
router.post('/:chatId/messages', sendMessage); // Handles POST /api/v1/chat/:chatId/messages
router.post('/:chatId/media', mediaUpload.single('media'), sendMediaMessage); // Handles POST /api/v1/chat/:chatId/media
router.put('/:chatId/messages/delivered', markMessagesAsDelivered); // Handles PUT /api/v1/chat/:chatId/messages/delivered
router.put('/:chatId/messages/read', markMessagesAsRead); // Handles PUT /api/v1/chat/:chatId/messages/read
router.patch('/:chatId/archive', archiveChat); // Handles PATCH /api/v1/chat/:chatId/archive
router.patch('/:chatId/unarchive', unarchiveChat); // Handles PATCH /api/v1/chat/:chatId/unarchive
router.post('/messages/:messageId/react', addReaction); // Handles POST /api/v1/chat/messages/:messageId/react
router.delete('/messages/:messageId/react', removeReaction); // Handles DELETE /api/v1/chat/messages/:messageId/react
router.delete('/:chatId', deleteChat); // Handles DELETE /api/v1/chat/:chatId

module.exports = router; 