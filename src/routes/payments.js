const express = require('express');
const router = express.Router();
const { handleMpesaCallback } = require('../services/paymentService');

// POST /api/v1/payments/mpesa-callback - M-Pesa payment confirmation
router.post('/mpesa-callback', handleMpesaCallback);

module.exports = router; 