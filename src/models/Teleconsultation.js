const mongoose = require('mongoose');
const TeleconsultationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['mpesa', 'card'], default: 'mpesa' },
  mpesaReceipt: { type: String }
});
module.exports = mongoose.model('Teleconsultation', TeleconsultationSchema); 