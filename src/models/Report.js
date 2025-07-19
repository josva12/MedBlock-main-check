const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  reportType: { type: String, enum: ['lab', 'imaging', 'pathology', 'consultation', 'discharge'], required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  findings: { type: String },
  recommendations: { type: String },
  attachments: [{ type: String }],
  status: { type: String, enum: ['draft', 'completed', 'reviewed', 'approved'], default: 'draft' },
  generatedBy: { type: String, required: true },
  generatedAt: { type: Date, required: true },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema); 