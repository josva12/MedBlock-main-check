const mongoose = require('mongoose');
const ClaimSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  insurerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  blockchainHash: { type: String },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Claim', ClaimSchema); 