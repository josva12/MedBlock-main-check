const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsurancePolicy', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  claimAmount: { type: Number, required: true },
  servicesRendered: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'flagged_for_review'], default: 'pending' },
  rejectionReason: { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactionHash: { type: String },
  blockNumber: { type: Number },
  isVerified: { type: Boolean, default: false },
  blockchainTimestamp: { type: Date },
  verificationAttempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Claim', ClaimSchema); 