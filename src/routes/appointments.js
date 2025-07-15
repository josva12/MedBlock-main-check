const express = require('express');
const { body } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Encounter = require('../models/Encounter');
const logger = require('../utils/logger');

const router = express.Router();

const validateAppointment = [
  body('patient').notEmpty().withMessage('Patient ID is required.'),
  body('doctor').notEmpty().withMessage('Doctor ID is required.'),
  body('appointmentDate').isISO8601().toDate().withMessage('Valid appointment date is required.'),
  body('reason').trim().isLength({ min: 5, max: 500 }).withMessage('Reason must be between 5 and 500 characters.'),
  body('status').optional().isIn(['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show']).withMessage('Invalid appointment status.'),
  body('appointmentType').optional().isIn(['physical', 'teleconsultation', 'emergency', 'follow_up']).withMessage('Invalid appointment type.'),
  body('location').optional().trim().isLength({ max: 200 }).withMessage('Location cannot exceed 200 characters.'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters.')
];

router.use(authenticateToken);

router.post('/', requireRole(['admin', 'doctor', 'nurse']), validateAppointment, appointmentController.createAppointment);
router.get('/', requireRole(['admin', 'doctor', 'nurse']), appointmentController.getAppointments);
// @route   GET /api/v1/appointments/statistics/overview
// @desc    Get appointment statistics overview
// @access  Private (admin, doctor, nurse)
router.get('/statistics/overview', requireRole(['admin', 'doctor', 'nurse']), async (req, res) => {
  try {
    const stats = await Encounter.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get appointment statistics failed:', error);
    res.status(500).json({ error: 'Failed to get appointment statistics' });
  }
});
router.get('/:id', requireRole(['admin', 'doctor', 'nurse', 'patient']), appointmentController.getAppointmentById);
router.put('/:id', requireRole(['admin', 'doctor']), validateAppointment, appointmentController.updateAppointment);
router.delete('/:id', requireRole(['admin']), appointmentController.deleteAppointment);

module.exports = router; 