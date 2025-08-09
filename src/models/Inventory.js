const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  // Basic medication information
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  genericName: {
    type: String,
    trim: true
  },
  brandName: {
    type: String,
    trim: true
  },
  medicationType: {
    type: String,
    enum: ['tablet', 'capsule', 'liquid', 'injection', 'cream', 'ointment', 'inhaler', 'suppository', 'other'],
    required: true
  },
  
  // Classification
  category: {
    type: String,
    enum: ['antibiotic', 'analgesic', 'antihypertensive', 'diabetic', 'cardiac', 'respiratory', 'gastrointestinal', 'neurological', 'psychiatric', 'other'],
    required: true
  },
  
  // Dosage and strength
  strength: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['mg', 'mcg', 'g', 'ml', 'units', 'puffs'],
      required: true
    }
  },
  
  // Stock management
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  maximumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 1000
  },
  
  // Pricing
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  markup: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Batch and expiration
  batchNumber: {
    type: String,
    required: true,
    trim: true
  },
  expirationDate: {
    type: Date,
    required: true,
    index: true
  },
  manufacturingDate: {
    type: Date,
    required: true
  },
  
  // Supplier information
  supplier: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: String,
    phone: String,
    email: String,
    address: String
  },
  
  // Prescription requirements
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  controlledSubstance: {
    type: Boolean,
    default: false
  },
  
  // Location and storage
  location: {
    shelf: String,
    row: String,
    bin: String
  },
  
  // Status and availability
  status: {
    type: String,
    enum: ['active', 'discontinued', 'recalled', 'out_of_stock'],
    default: 'active'
  },
  
  // Pharmacy association
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true,
    index: true
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock === 0) return 'out_of_stock';
  if (this.currentStock <= this.minimumStock) return 'low_stock';
  if (this.currentStock >= this.maximumStock) return 'overstocked';
  return 'normal';
});

// Virtual for days until expiration
inventorySchema.virtual('daysUntilExpiration').get(function() {
  const today = new Date();
  const expiration = new Date(this.expirationDate);
  const diffTime = expiration - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for expiration status
inventorySchema.virtual('expirationStatus').get(function() {
  const daysUntilExpiration = this.daysUntilExpiration;
  if (daysUntilExpiration < 0) return 'expired';
  if (daysUntilExpiration <= 30) return 'expiring_soon';
  if (daysUntilExpiration <= 90) return 'expiring_soon_warning';
  return 'valid';
});

// Virtual for profit margin
inventorySchema.virtual('profitMargin').get(function() {
  if (this.costPrice === 0) return 0;
  return ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
});

// Indexes for performance
inventorySchema.index({ name: 1, pharmacyId: 1 });
inventorySchema.index({ category: 1, pharmacyId: 1 });
inventorySchema.index({ status: 1, pharmacyId: 1 });
inventorySchema.index({ expirationDate: 1, pharmacyId: 1 });
inventorySchema.index({ currentStock: 1, pharmacyId: 1 });
inventorySchema.index({ supplier: 1, pharmacyId: 1 });

// Pre-save middleware to calculate markup
inventorySchema.pre('save', function(next) {
  if (this.costPrice > 0) {
    this.markup = ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
  }
  next();
});

// Static method to find low stock items
inventorySchema.statics.findLowStock = function(pharmacyId) {
  return this.find({
    pharmacyId,
    currentStock: { $lte: '$minimumStock' },
    status: 'active'
  });
};

// Static method to find expiring items
inventorySchema.statics.findExpiringSoon = function(pharmacyId, days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    pharmacyId,
    expirationDate: { $lte: futureDate },
    status: 'active'
  });
};

// Instance method to update stock
inventorySchema.methods.updateStock = function(quantity, type = 'add') {
  if (type === 'add') {
    this.currentStock += quantity;
  } else if (type === 'subtract') {
    if (this.currentStock < quantity) {
      throw new Error('Insufficient stock');
    }
    this.currentStock -= quantity;
  }
  
  // Update status based on stock level
  if (this.currentStock === 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock') {
    this.status = 'active';
  }
  
  return this.save();
};

// Instance method to check if item can be dispensed
inventorySchema.methods.canDispense = function(quantity) {
  return this.status === 'active' && 
         this.currentStock >= quantity && 
         this.expirationStatus !== 'expired';
};

module.exports = mongoose.model('Inventory', inventorySchema);
