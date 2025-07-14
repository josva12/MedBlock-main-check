const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true }
});

auditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema); 