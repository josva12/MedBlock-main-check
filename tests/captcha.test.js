const request = require('supertest');
const express = require('express');
const { 
  generateCaptcha, 
  validateCaptcha, 
  isCaptchaRequired, 
  recordFailedAttempt, 
  resetFailedAttempts 
} = require('../src/middleware/captchaMiddleware');

// Mock the canvas module for testing
jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      fillStyle: '',
      fillRect: jest.fn(),
      strokeStyle: '',
      lineWidth: 0,
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      font: '',
      textAlign: '',
      textBaseline: '',
      save: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn()
    })),
    toBuffer: jest.fn(() => Buffer.from('fake-image-data'))
  }))
}));

// Mock logger
jest.mock('../src/utils/logger', () => ({
  audit: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

describe('CAPTCHA Middleware', () => {
  let app;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    app = express();
    mockReq = {
      ip: '192.168.1.1',
      headers: {
        'user-agent': 'test-agent'
      }
    };
    mockRes = {
      set: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCaptcha', () => {
    it('should generate a CAPTCHA image and session', () => {
      generateCaptcha(mockReq, mockRes);

      expect(mockRes.set).toHaveBeenCalledWith({
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Captcha-Session': expect.any(String)
      });
      expect(mockRes.send).toHaveBeenCalledWith(expect.any(Buffer));
    });

    it('should handle generation errors gracefully', () => {
      // Mock canvas to throw an error
      const { createCanvas } = require('canvas');
      createCanvas.mockImplementationOnce(() => {
        throw new Error('Canvas error');
      });

      generateCaptcha(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to generate CAPTCHA',
        code: 'CAPTCHA_GENERATION_ERROR'
      });
    });
  });

  describe('validateCaptcha', () => {
    it('should validate correct CAPTCHA input', () => {
      // First generate a CAPTCHA to get a session
      generateCaptcha(mockReq, mockRes);
      const sessionId = mockRes.set.mock.calls[0][0]['X-Captcha-Session'];
      
      // Mock the session data
      const captchaSessions = require('../src/middleware/captchaMiddleware').captchaSessions;
      captchaSessions.set(sessionId, {
        text: 'ABC123',
        timestamp: Date.now(),
        attempts: 0,
        maxAttempts: 3
      });

      const result = validateCaptcha(sessionId, 'ABC123', '192.168.1.1');
      expect(result.valid).toBe(true);
    });

    it('should reject incorrect CAPTCHA input', () => {
      // First generate a CAPTCHA to get a session
      generateCaptcha(mockReq, mockRes);
      const sessionId = mockRes.set.mock.calls[0][0]['X-Captcha-Session'];
      
      // Mock the session data
      const captchaSessions = require('../src/middleware/captchaMiddleware').captchaSessions;
      captchaSessions.set(sessionId, {
        text: 'ABC123',
        timestamp: Date.now(),
        attempts: 0,
        maxAttempts: 3
      });

      const result = validateCaptcha(sessionId, 'XYZ789', '192.168.1.1');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INCORRECT_INPUT');
    });

    it('should reject invalid session ID', () => {
      const result = validateCaptcha('invalid-session', 'ABC123', '192.168.1.1');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INVALID_SESSION');
    });

    it('should reject expired sessions', () => {
      // First generate a CAPTCHA to get a session
      generateCaptcha(mockReq, mockRes);
      const sessionId = mockRes.set.mock.calls[0][0]['X-Captcha-Session'];
      
      // Mock expired session data
      const captchaSessions = require('../src/middleware/captchaMiddleware').captchaSessions;
      captchaSessions.set(sessionId, {
        text: 'ABC123',
        timestamp: Date.now() - (11 * 60 * 1000), // 11 minutes ago (expired)
        attempts: 0,
        maxAttempts: 3
      });

      const result = validateCaptcha(sessionId, 'ABC123', '192.168.1.1');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('SESSION_EXPIRED');
    });

    it('should reject after max attempts', () => {
      // First generate a CAPTCHA to get a session
      generateCaptcha(mockReq, mockRes);
      const sessionId = mockRes.set.mock.calls[0][0]['X-Captcha-Session'];
      
      // Mock session with max attempts reached
      const captchaSessions = require('../src/middleware/captchaMiddleware').captchaSessions;
      captchaSessions.set(sessionId, {
        text: 'ABC123',
        timestamp: Date.now(),
        attempts: 3, // Max attempts reached
        maxAttempts: 3
      });

      const result = validateCaptcha(sessionId, 'ABC123', '192.168.1.1');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('MAX_ATTEMPTS_EXCEEDED');
    });

    it('should sanitize user input', () => {
      // First generate a CAPTCHA to get a session
      generateCaptcha(mockReq, mockRes);
      const sessionId = mockRes.set.mock.calls[0][0]['X-Captcha-Session'];
      
      // Mock the session data
      const captchaSessions = require('../src/middleware/captchaMiddleware').captchaSessions;
      captchaSessions.set(sessionId, {
        text: 'ABC123',
        timestamp: Date.now(),
        attempts: 0,
        maxAttempts: 3
      });

      // Test with malicious input
      const result = validateCaptcha(sessionId, 'ABC123<script>alert("xss")</script>', '192.168.1.1');
      expect(result.valid).toBe(true); // Should be sanitized to "ABC123"
    });

    it('should reject empty or invalid input', () => {
      const result = validateCaptcha('session-id', '', '192.168.1.1');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INVALID_INPUT');
    });
  });

  describe('IP-based rate limiting', () => {
    it('should limit CAPTCHA validation attempts per IP', () => {
      // First generate a CAPTCHA to get a session
      generateCaptcha(mockReq, mockRes);
      const sessionId = mockRes.set.mock.calls[0][0]['X-Captcha-Session'];
      
      // Mock the session data
      const captchaSessions = require('../src/middleware/captchaMiddleware').captchaSessions;
      captchaSessions.set(sessionId, {
        text: 'ABC123',
        timestamp: Date.now(),
        attempts: 0,
        maxAttempts: 3
      });

      // Make 20 attempts (rate limit)
      for (let i = 0; i < 20; i++) {
        validateCaptcha(sessionId, 'WRONG', '192.168.1.1');
      }

      // 21st attempt should be rate limited
      const result = validateCaptcha(sessionId, 'ABC123', '192.168.1.1');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Failed attempt tracking', () => {
    it('should track failed authentication attempts', () => {
      recordFailedAttempt(mockReq);
      
      // Check if the IP is tracked
      const failedAttempts = require('../src/middleware/captchaMiddleware').failedAttempts;
      const clientData = failedAttempts.get('192.168.1.1');
      
      expect(clientData).toBeDefined();
      expect(clientData.attempts).toBe(1);
    });

    it('should require CAPTCHA after multiple failed attempts', () => {
      // Record 3 failed attempts
      for (let i = 0; i < 3; i++) {
        recordFailedAttempt(mockReq);
      }

      const result = isCaptchaRequired(mockReq);
      expect(result).toBe(true);
    });

    it('should reset failed attempts on successful authentication', () => {
      // Record some failed attempts
      recordFailedAttempt(mockReq);
      recordFailedAttempt(mockReq);

      // Reset attempts
      resetFailedAttempts(mockReq);

      const failedAttempts = require('../src/middleware/captchaMiddleware').failedAttempts;
      const clientData = failedAttempts.get('192.168.1.1');
      
      expect(clientData).toBeUndefined();
    });

    it('should not require CAPTCHA for new IPs', () => {
      const newReq = { ip: '192.168.1.2' };
      const result = isCaptchaRequired(newReq);
      expect(result).toBe(false);
    });
  });
});

// Integration tests
describe('CAPTCHA API Integration', () => {
  let app;

  beforeAll(() => {
    // Create a test Express app
    app = express();
    app.use(express.json());
    
    // Mount CAPTCHA routes
    const captchaRoutes = require('../src/routes/captcha');
    app.use('/api/v1/captcha', captchaRoutes);
  });

  describe('GET /api/v1/captcha/generate', () => {
    it('should generate a CAPTCHA image', async () => {
      const response = await request(app)
        .get('/api/v1/captcha/generate')
        .expect(200);

      expect(response.headers['content-type']).toBe('image/png');
      expect(response.headers['x-captcha-session']).toBeDefined();
      expect(response.body).toBeInstanceOf(Buffer);
    });
  });

  describe('POST /api/v1/captcha/validate', () => {
    it('should validate correct CAPTCHA input', async () => {
      // First generate a CAPTCHA
      const generateResponse = await request(app)
        .get('/api/v1/captcha/generate');
      
      const sessionId = generateResponse.headers['x-captcha-session'];
      
      // Mock the session data for validation
      const captchaSessions = require('../src/middleware/captchaMiddleware').captchaSessions;
      captchaSessions.set(sessionId, {
        text: 'ABC123',
        timestamp: Date.now(),
        attempts: 0,
        maxAttempts: 3
      });

      const response = await request(app)
        .post('/api/v1/captcha/validate')
        .send({
          sessionId: sessionId,
          captchaInput: 'ABC123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject incorrect CAPTCHA input', async () => {
      // First generate a CAPTCHA
      const generateResponse = await request(app)
        .get('/api/v1/captcha/generate');
      
      const sessionId = generateResponse.headers['x-captcha-session'];
      
      // Mock the session data for validation
      const captchaSessions = require('../src/middleware/captchaMiddleware').captchaSessions;
      captchaSessions.set(sessionId, {
        text: 'ABC123',
        timestamp: Date.now(),
        attempts: 0,
        maxAttempts: 3
      });

      const response = await request(app)
        .post('/api/v1/captcha/validate')
        .send({
          sessionId: sessionId,
          captchaInput: 'WRONG'
        })
        .expect(400);

      expect(response.body.error).toBe('CAPTCHA validation failed');
      expect(response.body.code).toBe('INCORRECT_INPUT');
    });

    it('should reject missing parameters', async () => {
      const response = await request(app)
        .post('/api/v1/captcha/validate')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Session ID and CAPTCHA input are required');
    });
  });
});

// Security tests
describe('CAPTCHA Security', () => {
  it('should not log sensitive CAPTCHA data', () => {
    const logger = require('../src/utils/logger');
    
    // Generate and validate CAPTCHA
    const mockReq = { ip: '192.168.1.1' };
    const mockRes = {
      set: jest.fn(),
      send: jest.fn()
    };

    generateCaptcha(mockReq, mockRes);
    const sessionId = mockRes.set.mock.calls[0][0]['X-Captcha-Session'];
    
    // Mock session data
    const captchaSessions = require('../src/middleware/captchaMiddleware').captchaSessions;
    captchaSessions.set(sessionId, {
      text: 'ABC123',
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: 3
    });

    validateCaptcha(sessionId, 'WRONG', '192.168.1.1');

    // Check that sensitive data is not logged
    const warnCalls = logger.warn.mock.calls;
    const lastWarnCall = warnCalls[warnCalls.length - 1];
    
    expect(lastWarnCall[1]).not.toHaveProperty('userInput');
    expect(lastWarnCall[1]).not.toHaveProperty('expected');
    expect(lastWarnCall[1]).toHaveProperty('inputLength');
  });

  it('should handle session replay attacks', () => {
    // Generate a CAPTCHA
    const mockReq = { ip: '192.168.1.1' };
    const mockRes = {
      set: jest.fn(),
      send: jest.fn()
    };

    generateCaptcha(mockReq, mockRes);
    const sessionId = mockRes.set.mock.calls[0][0]['X-Captcha-Session'];
    
    // Mock session data
    const captchaSessions = require('../src/middleware/captchaMiddleware').captchaSessions;
    captchaSessions.set(sessionId, {
      text: 'ABC123',
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: 3
    });

    // First validation should succeed
    const result1 = validateCaptcha(sessionId, 'ABC123', '192.168.1.1');
    expect(result1.valid).toBe(true);

    // Session should be deleted after successful validation
    // Second validation with same session should fail
    const result2 = validateCaptcha(sessionId, 'ABC123', '192.168.1.1');
    expect(result2.valid).toBe(false);
    expect(result2.reason).toBe('INVALID_SESSION');
  });
}); 