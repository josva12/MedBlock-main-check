const mongoose = require('mongoose');
const PredictionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  risk: { type: String },
  probability: { type: Number },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Prediction', PredictionSchema); 