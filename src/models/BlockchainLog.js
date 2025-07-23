const mongoose = require('mongoose');

const blockchainLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'medical_record', 'claim', 'verification', 'patient_consent',
      'supply_chain', 'clinical_trial', 'data_exchange', 'system'
    ],
    required: true
  },
  entityId: { type: String, required: true },
  description: String,
  transactionHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['recorded', 'verified', 'failed', 'active', 'completed', 'granted', 'revoked'],
    default: 'recorded'
  },
  recordedBy: String,
  patientId: String,
  providerId: String,
  consentStatus: { type: String, enum: ['granted', 'revoked'] },
  drugBatchId: String,
  clinicalTrialId: String,
  dataHash: String,
  additionalInfo: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('BlockchainLog', blockchainLogSchema); 