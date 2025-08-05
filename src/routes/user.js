const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { 
  isCaptchaRequired, 
  recordFailedAttempt, 
  resetFailedAttempts, 
  requireCaptcha,
  captchaCheck 
} = require('../middleware/captchaMiddleware');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting for sensitive operations
const sensitiveOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many sensitive operations from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateForgotPassword = [
  body('email').isEmail().normalizeEmail()
];

const validateContactForm = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('message').trim().isLength({ min: 10, max: 1000 }),
  body('subject').optional().trim().isLength({ min: 2, max: 100 })
];

const validateAccountDeactivation = [
  body('reason').optional().trim().isLength({ min: 5, max: 500 }),
  body('confirmPassword').notEmpty().withMessage('Password confirmation is required')
];

// @route   POST /api/v1/user/forgot-password
// @desc    Request password reset with CAPTCHA protection
// @access  Public
router.post('/forgot-password', sensitiveOperationLimiter, captchaCheck, validateForgotPassword, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, sessionId, captchaInput } = req.body;

    // Check if CAPTCHA is required and validate it
    if (isCaptchaRequired(req)) {
      if (!sessionId || !captchaInput) {
        return res.status(400).json({
          error: 'CAPTCHA is required due to multiple failed attempts',
          code: 'CAPTCHA_REQUIRED',
          captchaRequired: true
        });
      }

      const { validateCaptcha } = require('../middleware/captchaMiddleware');
      const validation = validateCaptcha(sessionId, captchaInput, req.ip);
      
      if (!validation.valid) {
        return res.status(400).json({
          error: 'CAPTCHA validation failed',
          code: validation.reason,
          captchaRequired: true
        });
      }
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // TODO: Send email with reset link
    // For now, just log it
    logger.info('Password reset requested', {
      userId: user._id,
      email: user.email,
      resetToken
    });

    logger.audit('password_reset_requested', user._id, 'user', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Reset failed attempts on successful request
    resetFailedAttempts(req);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    // Record failed attempt
    recordFailedAttempt(req);
    
    logger.error('Password reset request failed:', error);
    res.status(500).json({
      error: 'Password reset request failed'
    });
  }
});

// @route   POST /api/v1/user/contact
// @desc    Submit contact form with CAPTCHA protection
// @access  Public
router.post('/contact', sensitiveOperationLimiter, captchaCheck, validateContactForm, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, message, subject, sessionId, captchaInput } = req.body;

    // Check if CAPTCHA is required and validate it
    if (isCaptchaRequired(req)) {
      if (!sessionId || !captchaInput) {
        return res.status(400).json({
          error: 'CAPTCHA is required due to multiple failed attempts',
          code: 'CAPTCHA_REQUIRED',
          captchaRequired: true
        });
      }

      const { validateCaptcha } = require('../middleware/captchaMiddleware');
      const validation = validateCaptcha(sessionId, captchaInput, req.ip);
      
      if (!validation.valid) {
        return res.status(400).json({
          error: 'CAPTCHA validation failed',
          code: validation.reason,
          captchaRequired: true
        });
      }
    }

    // TODO: Send email to support team
    // For now, just log it
    logger.info('Contact form submitted', {
      name,
      email,
      subject,
      message: message.substring(0, 100) + '...'
    });

    logger.audit('contact_form_submitted', null, 'user', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email
    });

    // Reset failed attempts on successful submission
    resetFailedAttempts(req);

    res.json({
      success: true,
      message: 'Your message has been sent successfully. We will respond within 24 hours.'
    });
  } catch (error) {
    // Record failed attempt
    recordFailedAttempt(req);
    
    logger.error('Contact form submission failed:', error);
    res.status(500).json({
      error: 'Failed to submit contact form'
    });
  }
});

// @route   POST /api/v1/user/feedback
// @desc    Submit public feedback with CAPTCHA protection
// @access  Public
router.post('/feedback', sensitiveOperationLimiter, captchaCheck, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ min: 5, max: 1000 }),
  body('category').isIn(['general', 'bug', 'feature', 'security', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { rating, comment, category, sessionId, captchaInput } = req.body;

    // CAPTCHA is always required for public feedback
    if (!sessionId || !captchaInput) {
      return res.status(400).json({
        error: 'CAPTCHA verification is required',
        code: 'CAPTCHA_REQUIRED',
        captchaRequired: true
      });
    }

    const { validateCaptcha } = require('../middleware/captchaMiddleware');
    const validation = validateCaptcha(sessionId, captchaInput, req.ip);
    
    if (!validation.valid) {
      return res.status(400).json({
        error: 'CAPTCHA validation failed',
        code: validation.reason,
        captchaRequired: true
      });
    }

    // TODO: Store feedback in database
    // For now, just log it
    logger.info('Feedback submitted', {
      rating,
      category,
      comment: comment?.substring(0, 100) + '...'
    });

    logger.audit('feedback_submitted', null, 'user', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      rating,
      category
    });

    res.json({
      success: true,
      message: 'Thank you for your feedback!'
    });
  } catch (error) {
    logger.error('Feedback submission failed:', error);
    res.status(500).json({
      error: 'Failed to submit feedback'
    });
  }
});

// @route   POST /api/v1/user/deactivate-account
// @desc    Deactivate user account with CAPTCHA protection
// @access  Private
router.post('/deactivate-account', authenticateToken, sensitiveOperationLimiter, captchaCheck, validateAccountDeactivation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { reason, confirmPassword, sessionId, captchaInput } = req.body;

    // Check if CAPTCHA is required and validate it
    if (isCaptchaRequired(req)) {
      if (!sessionId || !captchaInput) {
        return res.status(400).json({
          error: 'CAPTCHA is required due to multiple failed attempts',
          code: 'CAPTCHA_REQUIRED',
          captchaRequired: true
        });
      }

      const { validateCaptcha } = require('../middleware/captchaMiddleware');
      const validation = validateCaptcha(sessionId, captchaInput, req.ip);
      
      if (!validation.valid) {
        return res.status(400).json({
          error: 'CAPTCHA validation failed',
          code: validation.reason,
          captchaRequired: true
        });
      }
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify password
    const isMatch = await user.matchPassword(confirmPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: 'Password confirmation is incorrect'
      });
    }

    // Deactivate account
    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivationReason = reason;
    await user.save();

    logger.audit('account_deactivated', user._id, 'user', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      reason
    });

    // Reset failed attempts on successful deactivation
    resetFailedAttempts(req);

    res.json({
      success: true,
      message: 'Your account has been deactivated successfully'
    });
  } catch (error) {
    // Record failed attempt
    recordFailedAttempt(req);
    
    logger.error('Account deactivation failed:', error);
    res.status(500).json({
      error: 'Failed to deactivate account'
    });
  }
});

module.exports = router; 