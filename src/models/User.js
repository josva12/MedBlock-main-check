const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  // Professional Information
  title: {
    type: String,
    enum: ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.', 'Nurse', 'Pharm.', 'Tech.', 'Facility'], // Added 'Facility' for facility accounts
    required: true
  },
  
  role: {
    type: String,
    enum: ['doctor', 'nurse', 'admin', 'front-desk', 'pharmacy', 'clinic', 'hospital'], // Added facility roles
    required: true
  },
  
  specialization: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  department: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  // License and Certification
  licenseNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  
  licenseExpiry: Date,
  
  // --- NEW PROFESSIONAL VERIFICATION FIELDS ---
  isGovernmentVerified: { // High-level flag for quick checks
    type: Boolean,
    default: false
  },
  professionalVerification: {
    status: {
      type: String,
      enum: ['unsubmitted', 'pending', 'verified', 'rejected'],
      default: 'unsubmitted'
    },
    licensingBody: {
      type: String,
      enum: ['KMPDC', 'NCK', 'PPB', 'other'], // KMPDC: doctors, NCK: nurses, PPB: pharmacies/chemists
      default: 'other'
    },
    submittedLicenseNumber: {
      type: String,
      trim: true,
      sparse: true
    },
    submissionDate: Date,
    verificationDate: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  // --- END NEW PROFESSIONAL VERIFICATION FIELDS ---
  
  // Contact Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(\+254|0)[17]\d{8}$/.test(v);
      },
      message: 'Please provide a valid Kenyan phone number'
    }
  },
  
  // Address Information
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    county: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta', 'Garissa', 'Wajir', 'Mandera',
        'Marsabit', 'Isiolo', 'Meru', 'Tharaka Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua',
        'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia',
        'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado',
        'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay',
        'Migori', 'Kisii', 'Nyamira', 'Nairobi'
      ]
    },
    subCounty: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: 'Kenya'
    }
  },
  
  // Authentication
  password: {
    type: String,
    required: true,
    select: false,
    minlength: 8,
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  
  // Security
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  phoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Session Management
  lastLogin: Date,
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: Date,
  
  // Password Reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Profile
  profilePicture: {
    filename: String,
    path: String,
    mimeType: String,
    size: Number
  },
  
  bio: {
    type: String,
    maxlength: 500
  },
  
  // Work Schedule
  workSchedule: {
    monday: { start: String, end: String, available: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, available: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
    thursday: { start: String, end: String, available: { type: Boolean, default: true } },
    friday: { start: String, end: String, available: { type: Boolean, default: true } },
    saturday: { start: String, end: String, available: { type: Boolean, default: false } },
    sunday: { start: String, end: String, available: { type: Boolean, default: false } }
  },
  
  // Permissions and Access Control
  permissions: [{
    resource: {
      type: String,
      enum: [
        'patients',
        'medical_records',
        'users',
        'reports',
        'settings',
        'audit_logs'
      ]
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'export']
    }]
  }],
  
  // Facility Assignment
  assignedFacilities: [{
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    },
    role: String,
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name with title
userSchema.virtual('fullNameWithTitle').get(function() {
  return `${this.title} ${this.fullName}`;
});

// Virtual for isLocked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes for efficient querying
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Add index for the new licenseNumber if it's the primary professional identifier
userSchema.index({ 'professionalVerification.submittedLicenseNumber': 1, 'professionalVerification.licensingBody': 1 }, { unique: true, sparse: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    userId: this._id,
    email: this.email,
    role: this.role,
    // Include isGovernmentVerified in the token payload for quick checks
    isGovernmentVerified: this.isGovernmentVerified
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const payload = {
    userId: this._id,
    type: 'refresh'
  };
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Instance method to check permission
userSchema.methods.hasPermission = function(resource, action) {
  const permission = this.permissions.find(p => p.resource === resource);
  return permission && permission.actions.includes(action);
};

// Instance method to get user summary (for general display)
userSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    title: this.title,
    specialization: this.specialization,
    department: this.department,
    phone: this.phone,
    isActive: this.isActive,
    isVerified: this.isVerified, // General verification (email/phone)
    isGovernmentVerified: this.isGovernmentVerified, // New government verification status
    professionalVerificationStatus: this.professionalVerification ? this.professionalVerification.status : 'unsubmitted',
    lastLogin: this.lastLogin
  };
};

// Instance method to get user profile (for self-view or admin view of sensitive info)
userSchema.methods.getProfile = function() {
  const userObject = this.toObject({ virtuals: true });
  delete userObject.password; // Ensure password is not returned
  delete userObject.passwordResetToken; // Ensure reset token is not returned

  // Exclude internal verification notes for non-admin view
  if (userObject.professionalVerification && userObject.professionalVerification.notes) {
      // If it's not being accessed by an admin, remove the sensitive 'notes'
      // This logic will be in the route handler based on req.user.role
      // For the getProfile method itself, we return everything, and the route trims for specific roles.
  }
  return userObject;
};

// Static method to find users by role
userSchema.statics.findByRole = function(role, options = {}) {
  const query = { role };
  
  if (options.isActive !== undefined) {
    query.isActive = options.isActive;
  }
  
  if (options.department) {
    query.department = options.department;
  }

  if (options.isGovernmentVerified !== undefined) { // New filter option
      query.isGovernmentVerified = options.isGovernmentVerified;
  }
  
  return this.find(query)
    .sort({ fullName: 1 })
    .select('-password -passwordResetToken');
};

// Static method to find users by facility
userSchema.statics.findByFacility = function(facilityId, options = {}) {
  const query = { 'assignedFacilities.facilityId': facilityId };
  
  if (options.role) {
    query.role = options.role;
  }
  
  if (options.isActive !== undefined) {
    query.isActive = options.isActive;
  }
  
  return this.find(query)
    .sort({ fullName: 1 })
    .select('-password -passwordResetToken');
};

// Static method to get user statistics
userSchema.statics.getStatistics = async function() {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          // Updated to include government verified users
          verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } }, // Keep for general verification
          governmentVerifiedUsers: { $sum: { $cond: ['$isGovernmentVerified', 1, 0] } }, // New stat
          roleDistribution: {
            $push: {
              role: '$role',
              count: 1
            }
          },
          professionalVerificationDistribution: { // New stat for professional verification status
              $push: {
                  status: '$professionalVerification.status',
                  count: 1
              }
          }
        }
      }
    ]);
    
    const result = stats[0] || { 
      totalUsers: 0, 
      activeUsers: 0, 
      verifiedUsers: 0, 
      governmentVerifiedUsers: 0,
      roleDistribution: [],
      professionalVerificationDistribution: []
    };

    // Aggregate professional verification distribution correctly if needed
    // The $push above captures per-document status. We might want to group them here.
    const professionalVerificationSummary = result.professionalVerificationDistribution.reduce((acc, curr) => {
        if (curr.status) { // Only count if status is actually set
            acc[curr.status] = (acc[curr.status] || 0) + 1;
        }
        return acc;
    }, {});
    
    // Convert back to array of objects if needed, or keep as object
    result.professionalVerificationDistribution = Object.keys(professionalVerificationSummary).map(status => ({
        status,
        count: professionalVerificationSummary[status]
    }));


    return result;
  } catch (error) {
    logger.error('Failed to get user statistics:', error);
    throw error;
  }
};

// Static method to authenticate user
userSchema.statics.authenticate = async function(email, password) {
  try {
    const user = await this.findOne({ email, isActive: true }).select('+password');
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    if (user.isLocked) {
      throw new Error('Account is locked due to too many failed login attempts');
    }
    
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      await user.incLoginAttempts();
      throw new Error('Invalid email or password');
    }
    
    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    
    return user;
  } catch (error) {
    logger.error('Authentication failed:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema); 