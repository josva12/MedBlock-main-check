const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order identification
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Customer information
  customer: {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: String,
    email: String,
    address: String
  },
  
  // Prescription information
  prescription: {
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    prescriptionDate: Date,
    isRequired: {
      type: Boolean,
      default: false
    }
  },
  
  // Order items
  items: [{
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    strength: {
      value: Number,
      unit: String
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    instructions: String,
    dispensedQuantity: {
      type: Number,
      default: 0
    }
  }],
  
  // Pricing and payment
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment information
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'online', 'pending'],
      default: 'pending'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAmount: {
      type: Number,
      default: 0
    },
    paidAt: Date
  },
  
  // Insurance information
  insurance: {
    policyNumber: String,
    provider: String,
    coverage: {
      type: Number,
      min: 0,
      max: 100
    },
    claimStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'approved', 'rejected', 'paid'],
      default: 'not_applicable'
    },
    claimAmount: {
      type: Number,
      default: 0
    }
  },
  
  // Order status and workflow
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'ready_for_pickup', 'dispensed', 'delivered', 'cancelled', 'completed'],
    default: 'pending',
    index: true
  },
  
  // Fulfillment
  fulfillment: {
    method: {
      type: String,
      enum: ['pickup', 'delivery', 'mail'],
      default: 'pickup'
    },
    pickupTime: Date,
    deliveryAddress: String,
    deliveryInstructions: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  
  // Pharmacy association
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true,
    index: true
  },
  
  // Staff assignments
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notes and special instructions
  notes: String,
  specialInstructions: String,
  
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

// Virtual for order progress
orderSchema.virtual('progress').get(function() {
  const statusOrder = ['pending', 'confirmed', 'processing', 'ready_for_pickup', 'dispensed', 'delivered', 'completed'];
  const currentIndex = statusOrder.indexOf(this.status);
  return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
});

// Virtual for remaining amount
orderSchema.virtual('remainingAmount').get(function() {
  return this.totalAmount - this.payment.paidAmount;
});

// Virtual for is fully paid
orderSchema.virtual('isFullyPaid').get(function() {
  return this.payment.paidAmount >= this.totalAmount;
});

// Virtual for can be dispensed
orderSchema.virtual('canBeDispensed').get(function() {
  return this.status === 'ready_for_pickup' && this.isFullyPaid;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  
  // Calculate totals
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    this.totalAmount = this.subtotal + this.tax - this.discount;
  }
  
  next();
});

// Static method to find orders by status
orderSchema.statics.findByStatus = function(pharmacyId, status) {
  return this.find({ pharmacyId, status });
};

// Static method to find pending orders
orderSchema.statics.findPending = function(pharmacyId) {
  return this.find({ 
    pharmacyId, 
    status: { $in: ['pending', 'confirmed', 'processing'] } 
  });
};

// Static method to find orders ready for pickup
orderSchema.statics.findReadyForPickup = function(pharmacyId) {
  return this.find({ 
    pharmacyId, 
    status: 'ready_for_pickup' 
  });
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, updatedBy) {
  this.status = newStatus;
  this.updatedBy = updatedBy;
  
  // Update timestamps for specific statuses
  if (newStatus === 'ready_for_pickup') {
    this.fulfillment.pickupTime = new Date();
  } else if (newStatus === 'delivered') {
    this.fulfillment.actualDelivery = new Date();
  }
  
  return this.save();
};

// Instance method to process payment
orderSchema.methods.processPayment = function(paymentMethod, amount, transactionId) {
  this.payment.method = paymentMethod;
  this.payment.paidAmount = amount;
  this.payment.transactionId = transactionId;
  this.payment.paidAt = new Date();
  
  if (amount >= this.totalAmount) {
    this.payment.status = 'paid';
  } else if (amount > 0) {
    this.payment.status = 'partially_refunded';
  }
  
  return this.save();
};

// Instance method to dispense items
orderSchema.methods.dispenseItems = function(dispensedItems, dispensedBy) {
  for (const item of dispensedItems) {
    const orderItem = this.items.id(item.itemId);
    if (orderItem) {
      orderItem.dispensedQuantity = item.quantity;
    }
  }
  
  this.status = 'dispensed';
  this.updatedBy = dispensedBy;
  
  return this.save();
};

// Indexes for performance
orderSchema.index({ customer: 1, pharmacyId: 1 });
orderSchema.index({ status: 1, pharmacyId: 1 });
orderSchema.index({ createdAt: -1, pharmacyId: 1 });
orderSchema.index({ prescription: 1, pharmacyId: 1 });
orderSchema.index({ payment: 1, pharmacyId: 1 });

module.exports = mongoose.model('Order', orderSchema);
