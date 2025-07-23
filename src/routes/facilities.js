const express = require('express');
const { body, validationResult } = require('express-validator');
const Facility = require('../models/Facility');
const { requireRole, authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const { BlockchainService } = require('../services/blockchainService');
const BlockchainLog = require('../models/BlockchainLog');

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
    // --- Blockchain Integration ---
    try {
      const blockchainService = new BlockchainService();
      const blockchainResult = await blockchainService.recordEvent({
        eventType: 'FacilityRegistration',
        entityId: facility._id.toString(),
        dataHash: facility._id.toString()
      });
      facility.transactionHash = blockchainResult.transactionHash;
      facility.blockNumber = blockchainResult.blockNumber;
      facility.blockchainTimestamp = new Date();
      facility.isVerified = false;
      facility.verificationAttempts = 0;
      await facility.save();
      // Log to BlockchainLog
      await BlockchainLog.create({
        type: 'facility_registration',
        entityId: facility._id.toString(),
        description: `Facility ${facility.name} registered and recorded on blockchain`,
        transactionHash: blockchainResult.transactionHash,
        status: 'recorded',
        recordedBy: req.user.fullName || req.user.email,
        additionalInfo: { type: facility.type, registrationNumber: facility.registrationNumber }
      });
    } catch (blockchainError) {
      // Optionally: log or return warning
    }
    // --- End Blockchain Integration ---
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
    // --- Blockchain Integration ---
    try {
      const blockchainService = new BlockchainService();
      const blockchainResult = await blockchainService.recordEvent({
        eventType: 'FacilityVerification',
        entityId: facility._id.toString(),
        dataHash: facility._id.toString() + ':' + status
      });
      facility.transactionHash = blockchainResult.transactionHash;
      facility.blockNumber = blockchainResult.blockNumber;
      facility.blockchainTimestamp = new Date();
      facility.isVerified = false;
      facility.verificationAttempts = 0;
      await facility.save();
      // Log to BlockchainLog
      await BlockchainLog.create({
        type: 'facility_verification',
        entityId: facility._id.toString(),
        description: `Facility ${facility.name} verification status updated to ${status} and recorded on blockchain`,
        transactionHash: blockchainResult.transactionHash,
        status: 'recorded',
        recordedBy: req.user.fullName || req.user.email,
        additionalInfo: { status }
      });
    } catch (blockchainError) {
      // Optionally: log or return warning
    }
    // --- End Blockchain Integration ---
    await facility.save();
    logger.audit('facility_verification', req.user._id, 'facility', { facilityId: id, status });
    res.json({ success: true, message: 'Facility verification updated', data: { facility } });
  } catch (error) {
    logger.error('Facility verification failed:', error);
    res.status(500).json({ error: 'Failed to verify facility', details: error.message });
  }
});

// PATCH /api/v1/facilities/:id/verify-blockchain - Verify facility's blockchain status (admin)
router.patch('/:id/verify-blockchain', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await Facility.findById(id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    if (!facility.transactionHash) return res.status(400).json({ error: 'No transaction hash found for this facility.' });
    const blockchainService = new BlockchainService();
    const verification = await blockchainService.verifyEvent(facility.transactionHash);
    facility.isVerified = verification.isVerified;
    facility.verificationAttempts = (facility.verificationAttempts || 0) + 1;
    facility.blockNumber = verification.blockNumber;
    facility.blockchainTimestamp = new Date();
    await facility.save();
    // Log to BlockchainLog
    await BlockchainLog.create({
      type: 'verification',
      entityId: facility._id.toString(),
      description: `Verification for facility ${facility._id} on blockchain`,
      transactionHash: facility.transactionHash,
      status: verification.isVerified ? 'verified' : 'failed',
      recordedBy: req.user.fullName || req.user.email,
      additionalInfo: { type: facility.type, registrationNumber: facility.registrationNumber }
    });
    res.json({ success: true, data: facility });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify facility on blockchain', details: error.message });
  }
});

// GET /api/v1/facilities
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { isActive: { $ne: false } };
    const facilities = await Facility.find(query).skip(skip).limit(parseInt(limit));
    const total = await Facility.countDocuments(query);
    res.json({
      success: true,
      data: facilities,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get facilities', details: error.message });
  }
});

// GET /api/v1/facilities/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    res.json({ success: true, data: facility });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get facility', details: error.message });
  }
});

// PUT /api/v1/facilities/:id
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    res.json({ success: true, data: facility });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update facility', details: error.message });
  }
});

// DELETE /api/v1/facilities/:id (soft delete)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    facility.isActive = false;
    await facility.save();
    res.json({ success: true, message: 'Facility soft deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete facility', details: error.message });
  }
});

module.exports = router; 