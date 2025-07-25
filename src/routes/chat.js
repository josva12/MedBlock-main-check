// File Location: src/routes/chat.js

const express = require('express');
const { authenticate } = require('../middleware/authMiddleware'); // <--- IMPORTANT: Use the correct middleware
const { createOrGetConversation } = require('../controllers/chatController');

const router = express.Router();

// Define the route for creating or getting a one-on-one chat.
// We are now using 'authenticate', which correctly attaches the full user object to req.user.
router.post(
  '/conversation',
  authenticate, // <--- THIS IS THE KEY FIX
  createOrGetConversation
);


// Your other chat routes (like getting messages, sending them, etc.) will also be refactored
// to use their own controller functions, but for now, we have fixed the immediate problem.

// Example: router.get('/', authenticate, getChats);
// Example: router.get('/:chatId/messages', authenticate, getMessages);

module.exports = router; 