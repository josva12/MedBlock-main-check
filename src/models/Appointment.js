const mongoose = require('mongoose');
const logger = require('../utils/logger');

const appointmentSchema = new mongoose.Schema({
  // Unique identifier for the appointment
  appointmentId: {
    type: String,
    unique: true,
    trim: true
  },
  // Reference to the Patient
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  // Reference to the Doctor (User with role 'doctor')
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming doctors are users
    required: true
  },
  // Date and time of the appointment
  appointmentDate: {
    type: Date,
    required: true
  },
  // Reason for the appointment
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  // Current status of the appointment
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'],
    default: 'scheduled'
  },
  // Type of appointment (e.g., 'physical', 'teleconsultation')
  appointmentType: {
    type: String,
    enum: ['physical', 'teleconsultation', 'emergency', 'follow_up'],
    default: 'physical'
  },
  // Location of the physical appointment or platform for teleconsultation
  location: {
    type: String,
    trim: true,
    maxlength: 200,
    default: 'Clinic A' // Default for physical, or 'Zoom', 'Google Meet' for teleconsultation
  },
  // Any additional notes
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for appointment summary
appointmentSchema.virtual('summary').get(function() {
  // Safely access populated patient and doctor fields
  const patientSummary = this.patient ? {
    _id: this.patient._id,
    firstName: this.patient.firstName,
    lastName: this.patient.lastName,
    patientId: this.patient.patientId // Custom patient ID
  } : this.patient; // If not populated, it will be the ObjectId

  const doctorSummary = this.doctor ? {
    _id: this.doctor._id,
    firstName: this.doctor.firstName,
    lastName: this.doctor.lastName,
    title: this.doctor.title
  } : this.doctor; // If not populated, it will be the ObjectId

  return {
    _id: this._id,
    appointmentId: this.appointmentId,
    patient: patientSummary, // Now contains specific populated fields or ObjectId
    doctor: doctorSummary,   // Now contains specific populated fields or ObjectId
    appointmentDate: this.appointmentDate,
    reason: this.reason,
    status: this.status,
    appointmentType: this.appointmentType
  };
});

// Pre-save hook to generate appointmentId
appointmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.appointmentId) {
    try {
      const count = await this.constructor.countDocuments();
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      this.appointmentId = `APT${timestamp}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      logger.error('Failed to generate appointment ID:', error);
      return next(error);
    }
  }
  next();
});

// Indexes for efficient querying
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
