const mongoose = require('mongoose');
const InsuranceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  plan: { type: String, required: true },
  status: { type: String, enum: ['active', 'expired', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Insurance', InsuranceSchema); 