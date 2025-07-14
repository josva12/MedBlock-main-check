const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User'); // Assuming doctors are Users
const logger = require('../utils/logger');

// @desc    Create a new appointment
// @route   POST /api/v1/appointments
// @access  Private (Admin, Doctor, Nurse)
exports.createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { patient, doctor, appointmentDate, reason, status, appointmentType, location, notes } = req.body;

    // Verify patient exists
    const existingPatient = await Patient.findById(patient);
    if (!existingPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Verify doctor exists and has 'doctor' role
    const existingDoctor = await User.findById(doctor);
    if (!existingDoctor || existingDoctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found or invalid role' });
    }

    const newAppointment = new Appointment({
      patient,
      doctor,
      appointmentDate,
      reason,
      status,
      appointmentType,
      location,
      notes,
      createdBy: req.user._id // The user creating the appointment (admin, doctor, or nurse)
    });

    await newAppointment.save();

    logger.audit('appointment_created', req.user.userId, `appointment:${newAppointment.appointmentId}`, {
      patientId: newAppointment.patient,
      doctorId: newAppointment.doctor,
      appointmentDate: newAppointment.appointmentDate,
      reason: newAppointment.reason
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment: newAppointment.summary // Use the virtual summary
      }
    });
  } catch (error) {
    logger.error('Create appointment failed:', error);
    res.status(500).json({
      error: 'Failed to create appointment',
      details: error.message
    });
  }
};

// @desc    Get all appointments with filtering and pagination
// @route   GET /api/v1/appointments
// @access  Private (Admin, Doctor, Nurse)
exports.getAppointments = async (req, res) => {
  try {
    logger.debug('Starting getAppointments request.');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.patientId) query.patient = req.query.patientId;
    if (req.query.doctorId) query.doctor = req.query.doctorId;
    if (req.query.status) query.status = req.query.status;
    if (req.query.appointmentType) query.appointmentType = req.query.appointmentType;
    if (req.query.dateFrom && req.query.dateTo) {
      query.appointmentDate = {
        $gte: new Date(req.query.dateFrom),
        $lte: new Date(req.query.dateTo)
      };
    } else if (req.query.dateFrom) {
      query.appointmentDate = { $gte: new Date(req.query.dateFrom) };
    } else if (req.query.dateTo) {
      query.appointmentDate = { $lte: new Date(req.query.dateTo) };
    }
    logger.debug('Query built:', query);

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName title');
    logger.debug('Appointments fetched and populated. Count:', appointments.length);

    const total = await Appointment.countDocuments(query);
    logger.debug('Total appointments count:', total);

    logger.audit('appointments_listed', req.user.userId, 'appointments', {
      count: appointments.length,
      page,
      limit
    });
    logger.debug('Audit log recorded.');

    const mappedAppointments = appointments.map(app => app.summary);
    logger.debug('Appointments mapped to summary format.');

    res.json({
      success: true,
      data: {
        appointments: mappedAppointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    logger.debug('Response sent.');
  } catch (error) {
    logger.error('Get appointments failed:', error);
    res.status(500).json({
      error: 'Failed to get appointments',
      details: error.message
    });
  }
};

// @desc    Get a single appointment by ID
// @route   GET /api/v1/appointments/:id
// @access  Private (Admin, Doctor, Nurse, Patient - if their appointment)
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName title');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Authorization check: Only admin, the associated doctor, or the associated patient can view
    if (req.user.role !== 'admin' &&
        req.user._id.toString() !== appointment.doctor._id.toString() &&
        req.user._id.toString() !== appointment.patient._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this appointment.' });
    }

    logger.audit('appointment_viewed', req.user.userId, `appointment:${appointment.appointmentId}`, {
      appointmentId: appointment.appointmentId,
      patientId: appointment.patient._id,
      doctorId: appointment.doctor._id
    });

    res.json({
      success: true,
      data: {
        appointment: appointment.toObject() // Return full object for single view
      }
    });
  } catch (error) {
    logger.error('Get appointment by ID failed:', error);
    res.status(500).json({
      error: 'Failed to get appointment',
      details: error.message
    });
  }
};

// @desc    Update an appointment
// @route   PUT /api/v1/appointments/:id
// @access  Private (Admin, Doctor who created it)
exports.updateAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { appointmentDate, reason, status, appointmentType, location, notes } = req.body;

    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Authorization check: Only admin or the doctor who created it can update
    if (req.user.role !== 'admin' && appointment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to update this appointment.' });
    }

    // Update fields
    appointment.appointmentDate = appointmentDate || appointment.appointmentDate;
    appointment.reason = reason || appointment.reason;
    appointment.status = status || appointment.status;
    appointment.appointmentType = appointmentType || appointment.appointmentType;
    appointment.location = location || appointment.location;
    appointment.notes = notes || appointment.notes;
    appointment.updatedBy = req.user._id;

    await appointment.save();

    logger.audit('appointment_updated', req.user.userId, `appointment:${appointment.appointmentId}`, {
      appointmentId: appointment.appointmentId,
      status: appointment.status
    });

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment: appointment.summary
      }
    });
  } catch (error) {
    logger.error('Update appointment failed:', error);
    res.status(500).json({
      error: 'Failed to update appointment',
      details: error.message
    });
  }
};

// @desc    Delete an appointment (soft delete)
// @route   DELETE /api/v1/appointments/:id
// @access  Private (Admin only)
exports.deleteAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Soft delete: Change status to 'cancelled' or 'archived'
    appointment.status = 'cancelled'; // Or 'archived' based on your preference
    appointment.updatedBy = req.user._id;
    await appointment.save();

    logger.audit('appointment_deleted', req.user.userId, `appointment:${appointment.appointmentId}`, {
      appointmentId: appointment.appointmentId
    });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully (soft deleted)'
    });
  } catch (error) {
    logger.error('Delete appointment failed:', error);
    res.status(500).json({
      error: 'Failed to cancel appointment',
      details: error.message
    });
  }
};

// @desc    Get appointment statistics overview
// @route   GET /api/v1/appointments/statistics/overview
// @access  Private (Admin, Doctor, Nurse)
exports.getAppointmentStatisticsOverview = async (req, res) => {
  try {
    // Aggregate counts by status
    const statusCounts = await Appointment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    // Aggregate counts by type
    const typeCounts = await Appointment.aggregate([
      { $group: { _id: "$appointmentType", count: { $sum: 1 } } }
    ]);
    // Total appointments
    const total = await Appointment.countDocuments();
    // Upcoming appointments (future date)
    const now = new Date();
    const upcoming = await Appointment.countDocuments({ appointmentDate: { $gte: now } });

    // Format results
    const statusStats = {};
    statusCounts.forEach(s => { statusStats[s._id] = s.count; });
    const typeStats = {};
    typeCounts.forEach(t => { typeStats[t._id] = t.count; });

    res.json({
      success: true,
      data: {
        totalAppointments: total,
        status: statusStats,
        type: typeStats,
        upcomingAppointments: upcoming
      }
    });
  } catch (error) {
    logger.error('Get appointment statistics overview failed:', error);
    res.status(500).json({
      error: 'Failed to get appointment statistics overview',
      details: error.message
    });
  }
};
