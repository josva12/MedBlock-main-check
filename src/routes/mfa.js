const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/authMiddleware');
const { 
  isCaptchaRequired, 
  recordFailedAttempt, 
  resetFailedAttempts, 
  requireCaptcha,
  captchaCheck 
} = require('../middleware/captchaMiddleware');
const MFA = require('../models/MFA');
const User = require('../models/User');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting for MFA endpoints
const mfaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many MFA requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const mfaValidationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 validation attempts per windowMs
  message: 'Too many MFA validation attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateGenerateMFA = [
  body('email').isEmail().normalizeEmail(),
  body('purpose').isIn(['login', 'password_reset', 'account_verification', 'settings_change'])
];

const validateVerifyMFA = [
  body('sessionId').isString().isLength({ min: 32, max: 64 }),
  body('code').isString().isLength({ min: 6, max: 6 }).matches(/^\d{6}$/)
];

// @route   POST /api/v1/mfa/generate
// @desc    Generate and send MFA code
// @access  Public
router.post('/generate', mfaLimiter, captchaCheck, validateGenerateMFA, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, purpose } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Invalidate any existing MFA codes for this user and purpose
    await MFA.invalidateUserMFA(user._id);

    // Create new MFA record
    const mfaRecord = await MFA.createMFA(
      user._id,
      email,
      purpose,
      ipAddress,
      userAgent,
      'email'
    );

    // Send email with MFA code
    await emailService.sendMFAEmail(
      email,
      mfaRecord.code,
      user.fullName,
      purpose
    );

    logger.info('MFA_CODE_GENERATED_SUCCESS', {
      userId: user._id,
      email,
      purpose,
      sessionId: mfaRecord.sessionId
    });

    res.json({
      success: true,
      message: 'MFA code sent successfully',
      data: {
        sessionId: mfaRecord.sessionId,
        expiresAt: mfaRecord.expiresAt,
        purpose
      }
    });

  } catch (error) {
    logger.error('MFA_GENERATE_ERROR', {
      error: error.message,
      email: req.body.email,
      purpose: req.body.purpose
    });

    res.status(500).json({
      success: false,
      message: 'Failed to generate MFA code'
    });
  }
});

// @route   POST /api/v1/mfa/verify
// @desc    Verify MFA code
// @access  Public
router.post('/verify', mfaValidationLimiter, validateVerifyMFA, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId, code } = req.body;

    // Find MFA record by session ID
    const mfaRecord = await MFA.findOne({ sessionId });
    if (!mfaRecord) {
      return res.status(404).json({
        success: false,
        message: 'Invalid session or code expired'
      });
    }

    // Validate the code
    const validation = mfaRecord.validateCode(code);
    
    if (!validation.valid) {
      logger.warn('MFA_VALIDATION_FAILED', {
        sessionId,
        reason: validation.reason,
        attempts: mfaRecord.attempts
      });

      return res.status(400).json({
        success: false,
        message: this.getValidationErrorMessage(validation.reason),
        data: {
          attempts: mfaRecord.attempts,
          maxAttempts: 5
        }
      });
    }

    // Get user information
    const user = await User.findById(mfaRecord.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role,
        mfaVerified: true,
        sessionId: mfaRecord.sessionId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { 
        userId: user._id,
        type: 'refresh',
        mfaVerified: true
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update user's last login
    user.lastLogin = new Date();
    await user.save();

    logger.info('MFA_VERIFICATION_SUCCESS', {
      userId: user._id,
      sessionId: mfaRecord.sessionId,
      purpose: mfaRecord.purpose
    });

    res.json({
      success: true,
      message: 'MFA verification successful',
      data: {
        token,
        refreshToken,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          title: user.title,
          isGovernmentVerified: user.isGovernmentVerified,
          professionalVerification: user.professionalVerification
        }
      }
    });

  } catch (error) {
    logger.error('MFA_VERIFY_ERROR', {
      error: error.message,
      sessionId: req.body.sessionId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to verify MFA code'
    });
  }
});

// @route   POST /api/v1/mfa/resend
// @desc    Resend MFA code
// @access  Public
router.post('/resend', mfaLimiter, validateGenerateMFA, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, purpose } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Invalidate any existing MFA codes for this user and purpose
    await MFA.invalidateUserMFA(user._id);

    // Create new MFA record
    const mfaRecord = await MFA.createMFA(
      user._id,
      email,
      purpose,
      ipAddress,
      userAgent,
      'email'
    );

    // Send email with MFA code
    await emailService.sendMFAEmail(
      email,
      mfaRecord.code,
      user.fullName,
      purpose
    );

    logger.info('MFA_CODE_RESENT_SUCCESS', {
      userId: user._id,
      email,
      purpose,
      sessionId: mfaRecord.sessionId
    });

    res.json({
      success: true,
      message: 'MFA code resent successfully',
      data: {
        sessionId: mfaRecord.sessionId,
        expiresAt: mfaRecord.expiresAt,
        purpose
      }
    });

  } catch (error) {
    logger.error('MFA_RESEND_ERROR', {
      error: error.message,
      email: req.body.email,
      purpose: req.body.purpose
    });

    res.status(500).json({
      success: false,
      message: 'Failed to resend MFA code'
    });
  }
});

// @route   GET /api/v1/mfa/status
// @desc    Check MFA status for a session
// @access  Public
router.get('/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const mfaRecord = await MFA.findOne({ sessionId });
    if (!mfaRecord) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const isExpired = new Date() > mfaRecord.expiresAt;
    const isUsed = mfaRecord.isUsed;
    const attempts = mfaRecord.attempts;

    res.json({
      success: true,
      data: {
        sessionId: mfaRecord.sessionId,
        isExpired,
        isUsed,
        attempts,
        maxAttempts: 5,
        expiresAt: mfaRecord.expiresAt,
        purpose: mfaRecord.purpose
      }
    });

  } catch (error) {
    logger.error('MFA_STATUS_ERROR', {
      error: error.message,
      sessionId: req.params.sessionId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get MFA status'
    });
  }
});

// @route   DELETE /api/v1/mfa/invalidate
// @desc    Invalidate MFA session (for logout or security)
// @access  Private
router.delete('/invalidate', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Find and invalidate the MFA record
    const mfaRecord = await MFA.findOne({ sessionId });
    if (mfaRecord) {
      mfaRecord.isExpired = true;
      await mfaRecord.save();
    }

    logger.info('MFA_SESSION_INVALIDATED', {
      userId: req.user._id,
      sessionId
    });

    res.json({
      success: true,
      message: 'MFA session invalidated successfully'
    });

  } catch (error) {
    logger.error('MFA_INVALIDATE_ERROR', {
      error: error.message,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to invalidate MFA session'
    });
  }
});

// Helper method to get validation error messages
function getValidationErrorMessage(reason) {
  const messages = {
    'CODE_ALREADY_USED': 'This code has already been used',
    'CODE_EXPIRED': 'This code has expired. Please request a new one',
    'TOO_MANY_ATTEMPTS': 'Too many failed attempts. Please request a new code',
    'INVALID_CODE': 'Invalid code. Please try again'
  };
  return messages[reason] || 'Invalid code';
}

module.exports = router; 