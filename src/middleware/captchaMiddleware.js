const crypto = require('crypto');
const logger = require('../utils/logger');
const captchaMetrics = require('../services/captchaMetrics');

// CAPTCHA configuration
const CAPTCHA_CONFIG = {
  length: 6, // Length of CAPTCHA string
  width: 200, // Image width
  height: 80, // Image height
  noise: 20, // Number of noise lines
  fontSize: 32, // Font size
  sessionTimeout: 10 * 60 * 1000, // 10 minutes
  maxAttempts: 3, // Max attempts before requiring CAPTCHA
  lockoutDuration: 15 * 60 * 1000, // 15 minutes lockout
};

// In-memory storage for CAPTCHA sessions (in production, use Redis)
const captchaSessions = new Map();
const failedAttempts = new Map();
const captchaValidationAttempts = new Map(); // Track CAPTCHA validation attempts per IP

/**
 * Generate a random CAPTCHA string
 */
const generateCaptchaText = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < CAPTCHA_CONFIG.length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate CAPTCHA image using Canvas API
 */
const generateCaptchaImage = (text) => {
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(CAPTCHA_CONFIG.width, CAPTCHA_CONFIG.height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, CAPTCHA_CONFIG.width, CAPTCHA_CONFIG.height);

  // Add noise lines
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  for (let i = 0; i < CAPTCHA_CONFIG.noise; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * CAPTCHA_CONFIG.width, Math.random() * CAPTCHA_CONFIG.height);
    ctx.lineTo(Math.random() * CAPTCHA_CONFIG.width, Math.random() * CAPTCHA_CONFIG.height);
    ctx.stroke();
  }

  // Add noise dots
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(
      Math.random() * CAPTCHA_CONFIG.width,
      Math.random() * CAPTCHA_CONFIG.height,
      1,
      1
    );
  }

  // Add text
  ctx.font = `${CAPTCHA_CONFIG.fontSize}px Arial`;
  ctx.fillStyle = '#333333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Add slight rotation and positioning for each character
  for (let i = 0; i < text.length; i++) {
    const x = (CAPTCHA_CONFIG.width / text.length) * i + (CAPTCHA_CONFIG.width / text.length / 2);
    const y = CAPTCHA_CONFIG.height / 2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.3);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }

  return canvas.toBuffer('image/png');
};

/**
 * Generate a new CAPTCHA challenge
 */
exports.generateCaptcha = (req, res) => {
  try {
    const captchaText = generateCaptchaText();
    const sessionId = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();

    // Store CAPTCHA session
    captchaSessions.set(sessionId, {
      text: captchaText,
      timestamp,
      attempts: 0,
      maxAttempts: 3
    });

    // Generate image
    const imageBuffer = generateCaptchaImage(captchaText);

    // Set response headers
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Captcha-Session': sessionId
    });

    logger.audit('captcha_generated', null, 'auth', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId
    });

    // Record metrics
    captchaMetrics.recordCaptchaGenerated(req.ip, req.get('User-Agent'), req.originalUrl);

    res.send(imageBuffer);
  } catch (error) {
    logger.error('CAPTCHA generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate CAPTCHA',
      code: 'CAPTCHA_GENERATION_ERROR'
    });
  }
};

/**
 * Validate CAPTCHA response
 */
exports.validateCaptcha = (sessionId, userInput, clientIP = null) => {
  try {
    // Sanitize user input to prevent injection attacks
    const originalInput = String(userInput || '').trim();
    const sanitizedInput = originalInput.replace(/[^A-Za-z0-9]/g, '');
    
    if (!sanitizedInput) {
      logger.warn('CAPTCHA validation failed: Empty or invalid input', { sessionId });
      return { valid: false, reason: 'INVALID_INPUT' };
    }

    // Record input sanitization metrics if input was modified
    if (originalInput !== sanitizedInput) {
      captchaMetrics.recordInputSanitization(clientIP, originalInput.length, sanitizedInput.length);
    }

    // Check IP-based CAPTCHA validation attempt limits
    if (clientIP) {
      const ipAttempts = captchaValidationAttempts.get(clientIP) || { count: 0, resetTime: Date.now() + (5 * 60 * 1000) }; // 5 minutes
      
      // Reset counter if time window has passed
      if (Date.now() > ipAttempts.resetTime) {
        ipAttempts.count = 0;
        ipAttempts.resetTime = Date.now() + (5 * 60 * 1000);
      }
      
      // Limit to 20 CAPTCHA validation attempts per IP per 5 minutes
      if (ipAttempts.count >= 20) {
              logger.warn('CAPTCHA validation rate limit exceeded', { 
        clientIP, 
        attempts: ipAttempts.count 
      });
      
      // Record metrics
      captchaMetrics.recordRateLimitExceeded(clientIP, ipAttempts.count);
      
      return { valid: false, reason: 'RATE_LIMIT_EXCEEDED' };
      }
      
      ipAttempts.count++;
      captchaValidationAttempts.set(clientIP, ipAttempts);
    }

    const session = captchaSessions.get(sessionId);
    
    if (!session) {
      logger.warn('CAPTCHA validation failed: Invalid session', { sessionId });
      return { valid: false, reason: 'INVALID_SESSION' };
    }

    // Check if session has expired
    if (Date.now() - session.timestamp > CAPTCHA_CONFIG.sessionTimeout) {
      captchaSessions.delete(sessionId);
      logger.warn('CAPTCHA validation failed: Session expired', { sessionId });
      
      // Record session expiration metrics
      captchaMetrics.recordSessionExpiration(clientIP, sessionId);
      
      return { valid: false, reason: 'SESSION_EXPIRED' };
    }

    // Check attempts
    if (session.attempts >= session.maxAttempts) {
      captchaSessions.delete(sessionId);
      logger.warn('CAPTCHA validation failed: Max attempts exceeded', { sessionId });
      return { valid: false, reason: 'MAX_ATTEMPTS_EXCEEDED' };
    }

    session.attempts++;

    // Validate input (case-insensitive)
    const isValid = sanitizedInput.toUpperCase() === session.text.toUpperCase();
    
    if (isValid) {
      captchaSessions.delete(sessionId);
      logger.audit('captcha_validated', null, 'auth', { sessionId });
      
      // Record metrics
      captchaMetrics.recordCaptchaValidated(clientIP, sessionId);
      
      return { valid: true };
    } else {
      logger.warn('CAPTCHA validation failed: Incorrect input', { 
        sessionId, 
        attempts: session.attempts,
        // Don't log the actual input for security
        inputLength: sanitizedInput.length
      });
      
      // Record metrics
      captchaMetrics.recordCaptchaFailed(clientIP, sessionId, 'INCORRECT_INPUT');
      
      return { valid: false, reason: 'INCORRECT_INPUT' };
    }
  } catch (error) {
    logger.error('CAPTCHA validation error:', error);
    return { valid: false, reason: 'VALIDATION_ERROR' };
  }
};

/**
 * Check if CAPTCHA is required for the request
 */
exports.isCaptchaRequired = (req) => {
  const clientIP = req.ip;
  const clientData = failedAttempts.get(clientIP);
  
  if (!clientData) {
    return false;
  }

  // Check if client is in lockout period
  if (clientData.lockoutUntil && Date.now() < clientData.lockoutUntil) {
    return true;
  }

  // Check if client has exceeded max attempts
  if (clientData.attempts >= CAPTCHA_CONFIG.maxAttempts) {
    return true;
  }

  return false;
};

/**
 * Record failed authentication attempt
 */
exports.recordFailedAttempt = (req) => {
  const clientIP = req.ip;
  const now = Date.now();
  
  let clientData = failedAttempts.get(clientIP);
  
  if (!clientData) {
    clientData = {
      attempts: 0,
      firstAttempt: now,
      lastAttempt: now,
      lockoutUntil: null
    };
  }

  clientData.attempts++;
  clientData.lastAttempt = now;

  // If max attempts exceeded, set lockout
  if (clientData.attempts >= CAPTCHA_CONFIG.maxAttempts) {
    clientData.lockoutUntil = now + CAPTCHA_CONFIG.lockoutDuration;
    
    // Record lockout metrics
    captchaMetrics.recordLockout(clientIP, CAPTCHA_CONFIG.lockoutDuration);
  }

  failedAttempts.set(clientIP, clientData);

      logger.warn('Failed authentication attempt recorded', {
      ip: clientIP,
      attempts: clientData.attempts,
      lockoutUntil: clientData.lockoutUntil
    });

    // Record metrics
    captchaMetrics.recordFailedAttempt(clientIP);
};

/**
 * Reset failed attempts for successful authentication
 */
exports.resetFailedAttempts = (req) => {
  const clientIP = req.ip;
  failedAttempts.delete(clientIP);
  
  logger.audit('failed_attempts_reset', null, 'auth', {
    ip: clientIP
  });
};

/**
 * Clean up expired sessions and failed attempts
 */
const cleanupExpiredData = () => {
  const now = Date.now();

  // Clean up expired CAPTCHA sessions
  for (const [sessionId, session] of captchaSessions.entries()) {
    if (now - session.timestamp > CAPTCHA_CONFIG.sessionTimeout) {
      captchaSessions.delete(sessionId);
    }
  }

  // Clean up expired failed attempts
  for (const [ip, data] of failedAttempts.entries()) {
    if (data.lockoutUntil && now > data.lockoutUntil) {
      failedAttempts.delete(ip);
    }
  }

  // Clean up expired CAPTCHA validation attempts
  for (const [ip, data] of captchaValidationAttempts.entries()) {
    if (now > data.resetTime) {
      captchaValidationAttempts.delete(ip);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredData, 5 * 60 * 1000);

/**
 * Middleware to require CAPTCHA for authentication endpoints
 */
exports.requireCaptcha = (req, res, next) => {
  const { sessionId, captchaInput } = req.body;

  if (!sessionId || !captchaInput) {
    return res.status(400).json({
      error: 'CAPTCHA session ID and input are required',
      code: 'CAPTCHA_REQUIRED'
    });
  }

  const validation = exports.validateCaptcha(sessionId, captchaInput);
  
  if (!validation.valid) {
    return res.status(400).json({
      error: 'CAPTCHA validation failed',
      code: validation.reason
    });
  }

  next();
};

/**
 * Middleware to check if CAPTCHA is required and handle accordingly
 */
exports.captchaCheck = (req, res, next) => {
  if (exports.isCaptchaRequired(req)) {
    return res.status(429).json({
      error: 'Too many failed attempts. CAPTCHA required.',
      code: 'CAPTCHA_REQUIRED',
      captchaRequired: true
    });
  }
  next();
};

module.exports = exports; 