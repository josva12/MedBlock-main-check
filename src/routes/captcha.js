const express = require('express');
const { generateCaptcha } = require('../middleware/captchaMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/v1/captcha/generate
// @desc    Generate a new CAPTCHA challenge
// @access  Public
router.get('/generate', (req, res) => {
  generateCaptcha(req, res);
});

// @route   POST /api/v1/captcha/validate
// @desc    Validate CAPTCHA response
// @access  Public
router.post('/validate', (req, res) => {
  try {
    const { sessionId, captchaInput } = req.body;

    if (!sessionId || !captchaInput) {
      return res.status(400).json({
        error: 'Session ID and CAPTCHA input are required',
        code: 'MISSING_PARAMETERS'
      });
    }

    const { validateCaptcha } = require('../middleware/captchaMiddleware');
    const validation = validateCaptcha(sessionId, captchaInput);

    if (validation.valid) {
      res.json({
        success: true,
        message: 'CAPTCHA validated successfully'
      });
    } else {
      res.status(400).json({
        error: 'CAPTCHA validation failed',
        code: validation.reason
      });
    }
  } catch (error) {
    logger.error('CAPTCHA validation error:', error);
    res.status(500).json({
      error: 'CAPTCHA validation failed',
      code: 'VALIDATION_ERROR'
    });
  }
});

module.exports = router; 