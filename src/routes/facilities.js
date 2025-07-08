const express = require('express');
const { body, validationResult } = require('express-validator');
const Facility = require('../models/Facility');
const { requireRole, authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Validation middleware for facility registration
const validateFacility = [
  body('name').isString().trim().isLength({ min: 2, max: 200 }),
  body('type').isIn(['hospital', 'clinic', 'pharmacy', 'laboratory', 'imaging_center']),
  body('registrationNumber').isString().trim().isLength({ min: 3, max: 50 }),
  body('licensingBody').isIn(['KMPDC', 'PPB', 'other']),
  body('address').optional().isObject(),
  body('contact').optional().isObject()
];

// @route   POST /api/v1/facilities
// @desc    Register a new facility (admin only)
// @access  Private (admin)
router.post('/', authenticateToken, requireRole(['admin']), validateFacility, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { name, type, registrationNumber, licensingBody, address, contact } = req.body;
    const existing = await Facility.findOne({ registrationNumber });
    if (existing) {
      return res.status(400).json({ error: 'Facility with this registration number already exists' });
    }
    const facility = new Facility({
      name,
      type,
      registrationNumber,
      licensingBody,
      address,
      contact,
      status: 'pending',
      submissionDate: new Date(),
      createdBy: req.user._id
    });
    await facility.save();
    logger.audit('facility_registered', req.user._id, 'facility', { facilityId: facility._id, name });
    res.status(201).json({ success: true, message: 'Facility registered', data: { facility } });
  } catch (error) {
    logger.error('Facility registration failed:', error);
    res.status(500).json({ error: 'Failed to register facility', details: error.message });
  }
});

// @route   PATCH /api/v1/facilities/:id/verify
// @desc    Admin verifies or rejects a facility
// @access  Private (admin)
router.patch('/:id/verify', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, notes } = req.body;
    if (!['verified', 'rejected', 'pending', 'unsubmitted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const facility = await Facility.findById(id);
    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    facility.status = status;
    facility.verificationDate = status === 'verified' ? new Date() : undefined;
    facility.verifiedBy = req.user._id;
    facility.rejectionReason = status === 'rejected' ? rejectionReason : undefined;
    facility.notes = notes;
    await facility.save();
    logger.audit('facility_verification', req.user._id, 'facility', { facilityId: id, status });
    res.json({ success: true, message: 'Facility verification updated', data: { facility } });
  } catch (error) {
    logger.error('Facility verification failed:', error);
    res.status(500).json({ error: 'Failed to verify facility', details: error.message });
  }
});

module.exports = router; 