const mongoose = require('mongoose');

const DependentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true }
}, { _id: false });

const InsurancePolicySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policyTier: { type: String, enum: ['msingi', 'kati', 'juu', 'familia'], required: true },
  status: { type: String, enum: ['active', 'lapsed', 'cancelled', 'pending'], default: 'pending' },
  premiumAmount: { type: Number, required: true },
  coverageLimit: { type: Number, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  dependents: [DependentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InsurancePolicy', InsurancePolicySchema); 