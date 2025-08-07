const mongoose = require('mongoose');
const crypto = require('crypto');
const logger = require('../utils/logger');

const mfaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  code: {
    type: String,
    required: true,
    length: 6,
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v);
      },
      message: 'MFA code must be exactly 6 digits'
    }
  },
  
  type: {
    type: String,
    enum: ['email', 'sms', 'totp'],
    default: 'email'
  },
  
  purpose: {
    type: String,
    enum: ['login', 'password_reset', 'account_verification', 'settings_change'],
    required: true
  },
  
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  
  isUsed: {
    type: Boolean,
    default: false
  },
  
  isExpired: {
    type: Boolean,
    default: false
  },
  
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // 10 minutes TTL
  },
  
  usedAt: {
    type: Date
  },
  
  ipAddress: {
    type: String,
    required: true
  },
  
  userAgent: {
    type: String,
    required: true
  },
  
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for performance
mfaSchema.index({ userId: 1, createdAt: -1 });
mfaSchema.index({ sessionId: 1 });
mfaSchema.index({ email: 1, createdAt: -1 });

// Static method to generate a new MFA code
mfaSchema.statics.generateCode = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to generate session ID
mfaSchema.statics.generateSessionId = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Static method to create MFA record
mfaSchema.statics.createMFA = async function(userId, email, purpose, ipAddress, userAgent, type = 'email') {
  const code = this.generateCode();
  const sessionId = this.generateSessionId();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  const mfaRecord = new this({
    userId,
    email,
    code,
    type,
    purpose,
    sessionId,
    expiresAt,
    ipAddress,
    userAgent
  });
  
  await mfaRecord.save();
  logger.info('MFA_CODE_GENERATED', { userId, email, purpose, sessionId });
  
  return mfaRecord;
};

// Instance method to validate code
mfaSchema.methods.validateCode = function(inputCode) {
  // Check if already used
  if (this.isUsed) {
    return { valid: false, reason: 'CODE_ALREADY_USED' };
  }
  
  // Check if expired
  if (this.isExpired || new Date() > this.expiresAt) {
    this.isExpired = true;
    this.save();
    return { valid: false, reason: 'CODE_EXPIRED' };
  }
  
  // Check attempts
  if (this.attempts >= 5) {
    this.isExpired = true;
    this.save();
    return { valid: false, reason: 'TOO_MANY_ATTEMPTS' };
  }
  
  // Validate code
  if (this.code !== inputCode) {
    this.attempts += 1;
    this.save();
    return { valid: false, reason: 'INVALID_CODE' };
  }
  
  // Mark as used
  this.isUsed = true;
  this.usedAt = new Date();
  this.save();
  
  logger.info('MFA_CODE_VALIDATED', { userId: this.userId, sessionId: this.sessionId });
  return { valid: true };
};

// Static method to get active MFA for user
mfaSchema.statics.getActiveMFA = async function(userId, purpose) {
  return await this.findOne({
    userId,
    purpose,
    isUsed: false,
    isExpired: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to invalidate all active MFA for user
mfaSchema.statics.invalidateUserMFA = async function(userId) {
  return await this.updateMany(
    {
      userId,
      isUsed: false,
      isExpired: false
    },
    {
      $set: { isExpired: true }
    }
  );
};

// Static method to clean expired MFA records
mfaSchema.statics.cleanExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  
  logger.info('MFA_CLEANUP', { deletedCount: result.deletedCount });
  return result;
};

// Pre-save middleware to hash code (optional security measure)
mfaSchema.pre('save', function(next) {
  // For now, we'll keep codes in plain text for email delivery
  // In production, you might want to hash them and store the hash
  next();
});

module.exports = mongoose.model('MFA', mfaSchema); 