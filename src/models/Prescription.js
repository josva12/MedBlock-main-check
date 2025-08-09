const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  prescriptionNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  patient: {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: Date,
    allergies: [String]
  },
  
  prescriber: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    licenseNumber: String,
    specialty: String
  },
  
  medications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    genericName: String,
    strength: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['mg', 'mcg', 'g', 'ml', 'units'],
        required: true
      }
    },
    dosageForm: {
      type: String,
      enum: ['tablet', 'capsule', 'liquid', 'injection', 'cream', 'other'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    instructions: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      enum: ['once_daily', 'twice_daily', 'three_times_daily', 'as_needed'],
      required: true
    },
    duration: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        required: true
      }
    }
  }],
  
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'completed'],
    default: 'active',
    index: true
  },
  
  prescribedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  refills: {
    authorized: {
      type: Number,
      default: 0,
      min: 0
    },
    remaining: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  pharmacy: {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    },
    name: String
  },
  
  diagnosis: String,
  clinicalNotes: String,
  
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
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

prescriptionSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
});

prescriptionSchema.virtual('canBeRefilled').get(function() {
  return this.isValid && this.refills.remaining > 0;
});

prescriptionSchema.pre('save', function(next) {
  if (this.isNew && !this.prescriptionNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.prescriptionNumber = `RX-${timestamp}-${random}`;
  }
  next();
});

prescriptionSchema.index({ 'patient.patientId': 1, status: 1 });
prescriptionSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
