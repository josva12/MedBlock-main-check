const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['hospital', 'clinic', 'pharmacy', 'laboratory', 'imaging_center'],
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  licensingBody: {
    type: String,
    enum: ['KMPDC', 'PPB', 'other'], // KMPDC: hospitals/clinics, PPB: pharmacies
    required: true
  },
  status: {
    type: String,
    enum: ['unsubmitted', 'pending', 'verified', 'rejected'],
    default: 'unsubmitted'
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
  },
  address: {
    street: String,
    city: String,
    county: String,
    subCounty: String,
    postalCode: String,
    country: { type: String, default: 'Kenya' }
  },
  contact: {
    phone: String,
    email: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Facility', facilitySchema); 