const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole, canAccessMedicalRecord } = require('../middleware/auth');
const { isGovernmentVerifiedProfessional } = require('../middleware/authMiddleware'); // Unused, but kept as existing
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const encryptionService = require('../utils/encryption');
const logger = require('../utils/logger');
const upload = require('../config/multerConfig');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateMedicalRecord = [
  body('patientId').notEmpty().withMessage('Patient ID is required.'),
  body('recordType').isIn([
    'lab_report', 'prescription', 'diagnosis', 'treatment_plan', 'surgery_report',
    'imaging_report', 'vaccination_record', 'allergy_test', 'vital_signs',
    'consultation_note', 'discharge_summary', 'emergency_report', 'pharmacy_dispense',
    'pathology_report', 'radiology_report'
  ]).withMessage('Invalid record type.'),
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters.'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent', 'emergency']).withMessage('Invalid priority.'),
  body('accessLevel').optional().isIn(['public', 'restricted', 'confidential', 'highly_confidential']).withMessage('Invalid access level.'),
  
  // Provider validation (optional since it's set automatically from req.user)
  body('provider.id').optional(),
  body('provider.name').optional(),
  body('provider.role').optional().isIn(['doctor', 'nurse', 'specialist', 'pharmacist', 'lab_technician', 'radiologist']).withMessage('Invalid provider role.'),
  body('provider.department').optional().trim(),
  body('provider.licenseNumber').optional().trim(),

  // Facility validation
  body('facility.name').trim().notEmpty().withMessage('Facility name is required.'),
  body('facility.type').optional().isIn(['hospital', 'clinic', 'pharmacy', 'laboratory', 'imaging_center']).withMessage('Invalid facility type.'),
  body('facility.address').optional().isObject()

  // Note: encryptedData and dataHash are generated automatically by the backend
];

// Define canAccessPatient middleware (placeholder)
const canAccessPatient = (paramName) => {
  return (req, res, next) => {
    // TODO: Implement actual permission logic
    console.log(`Middleware 'canAccessPatient' for param '${paramName}' would run here.`);
    next();
  };
};

// @route   GET /api/v1/medical-records
// @desc    Get all medical records with filtering
// @access  Private
router.get('/', requireRole(['admin', 'doctor', 'nurse']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (req.query.patientId) {
      query.patientId = req.query.patientId;
    }

    if (req.query.recordType) {
      query.recordType = req.query.recordType;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    if (req.query.providerId) {
      query['provider.id'] = req.query.providerId;
    }

    if (req.query.facilityId) {
      query['facility.id'] = req.query.facilityId;
    }

    if (req.query.dateRange) {
      const [start, end] = req.query.dateRange.split(',');
      query.recordDate = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    // Execute query
    const records = await MedicalRecord.find(query)
      .sort({ recordDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('provider.id', 'firstName lastName')
      .populate('facility.id', 'name');

    const total = await MedicalRecord.countDocuments(query);

    logger.audit('medical_records_listed', req.user.userId, 'medical_records', {
      count: records.length,
      page,
      limit
    });

    res.json({
      success: true,
      data: {
        records: records.map(r => r.getSummary()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get medical records failed:', error);
    res.status(500).json({
      error: 'Failed to get medical records'
    });
  }
});

// @route   GET /api/v1/medical-records/:id
// @desc    Get medical record by ID
// @access  Private
router.get('/:id', canAccessMedicalRecord('id'), async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ 
      $or: [
        { recordId: req.params.id },
        { _id: req.params.id }
      ]
    })
    .populate('provider.id', 'firstName lastName')
    .populate('facility.id', 'name')
    .populate('patientId', 'firstName lastName patientId');

    if (!record) {
      return res.status(404).json({
        error: 'Medical record not found'
      });
    }

    // Decrypt sensitive data
    let decryptedData = {};
    try {
      decryptedData = JSON.parse(encryptionService.decrypt(record.encryptedData, record.recordId));
    } catch (error) {
      logger.error('Failed to decrypt medical record data:', error);
      return res.status(400).json({
        error: 'Tampered or corrupted encrypted data',
        details: error.message
      });
    }

    logger.audit('medical_record_viewed', req.user.userId, `record:${record.recordId}`, {
      recordId: record.recordId,
      patientId: record.patientId
    });

    res.json({
      success: true,
      data: {
        record: {
          ...record.toObject(),
          decryptedData
        }
      }
    });
  } catch (error) {
    logger.error('Get medical record failed:', error);
    res.status(500).json({
      error: 'Failed to get medical record'
    });
  }
});

// @route   POST /api/v1/medical-records
// @desc    Create a new medical record
// @access  Private
router.post('/', requireRole(['admin', 'doctor', 'nurse']), validateMedicalRecord, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Verify patient exists
    const patient = await Patient.findOne({ 
      $or: [
        { patientId: req.body.patientId },
        { nationalId: req.body.patientId },
        { _id: req.body.patientId }
      ]
    });

    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found'
      });
    }

    // Prepare record data
    const recordData = {
      ...req.body,
      patientId: patient._id, // <--- FIXED: Use the correct ObjectId
      provider: {
        id: req.user._id,
        name: req.user.fullNameWithTitle,
        role: req.user.role,
        department: req.user.department,
        licenseNumber: req.user.licenseNumber
      },
      createdBy: req.user._id
    };

    // Encrypt sensitive data
    const sensitiveData = {
      labReport: req.body.labReport,
      prescription: req.body.prescription,
      diagnosis: req.body.diagnosis,
      treatmentPlan: req.body.treatmentPlan,
      surgeryReport: req.body.surgeryReport,
      imagingReport: req.body.imagingReport,
      physicalExamination: req.body.physicalExamination,
      notes: req.body.notes
    };

    const encryptedData = encryptionService.encrypt(JSON.stringify(sensitiveData), null);
    const dataHash = encryptionService.generateHash(JSON.stringify(sensitiveData));

    recordData.encryptedData = encryptedData;
    recordData.dataHash = dataHash;

    // Create record
    const record = new MedicalRecord(recordData);
    await record.save();

    logger.audit('medical_record_created', req.user.userId, `record:${record.recordId}`, {
      recordId: record.recordId,
      patientId: record.patientId,
      recordType: record.recordType
    });

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: {
        record: record.getSummary()
      }
    });
  } catch (error) {
    logger.error('Create medical record failed:', error);
    res.status(500).json({
      error: 'Failed to create medical record',
      details: error.message
    });
  }
});

// @route   PUT /api/v1/medical-records/:id
// @desc    Update medical record
// @access  Private
router.put('/:id', canAccessMedicalRecord('id'), validateMedicalRecord, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const record = await MedicalRecord.findOne({ 
      $or: [
        { recordId: req.params.id },
        { _id: req.params.id }
      ]
    });

    if (!record) {
      return res.status(404).json({
        error: 'Medical record not found'
      });
    }

    // Check if user has permission to update
    if (record.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'You do not have permission to update this record'
      });
    }

    // Update basic fields
    const updateFields = ['title', 'description', 'status', 'priority', 'accessLevel', 'tags'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        record[field] = req.body[field];
      }
    });

    // Update encrypted data if sensitive fields are provided
    if (req.body.labReport || req.body.prescription || req.body.diagnosis || 
        req.body.treatmentPlan || req.body.surgeryReport || req.body.imagingReport ||
        req.body.physicalExamination || req.body.notes) {
      
      // Get existing decrypted data
      let existingData = {};
      try {
        existingData = JSON.parse(encryptionService.decrypt(record.encryptedData, record.recordId));
      } catch (error) {
        logger.error('Failed to decrypt existing data:', error);
      }

      // Merge with new data
      const sensitiveData = {
        ...existingData,
        labReport: req.body.labReport || existingData.labReport,
        prescription: req.body.prescription || existingData.prescription,
        diagnosis: req.body.diagnosis || existingData.diagnosis,
        treatmentPlan: req.body.treatmentPlan || existingData.treatmentPlan,
        surgeryReport: req.body.surgeryReport || existingData.surgeryReport,
        imagingReport: req.body.imagingReport || existingData.imagingReport,
        physicalExamination: req.body.physicalExamination || existingData.physicalExamination,
        notes: req.body.notes || existingData.notes
      };

      // Re-encrypt
      record.encryptedData = encryptionService.encrypt(JSON.stringify(sensitiveData), record.recordId);
      record.dataHash = encryptionService.generateHash(JSON.stringify(sensitiveData));
    }

    record.updatedBy = req.user._id;
    await record.save();

    logger.audit('medical_record_updated', req.user.userId, `record:${record.recordId}`, {
      recordId: record.recordId,
      patientId: record.patientId
    });

    res.json({
      success: true,
      message: 'Medical record updated successfully',
      data: {
        record: record.getSummary()
      }
    });
  } catch (error) {
    logger.error('Update medical record failed:', error);
    res.status(500).json({
      error: 'Failed to update medical record'
    });
  }
});

// @route   PATCH /api/v1/medical-records/:id
// @desc    Partially update a medical record
// @access  Private
router.patch('/:id', canAccessMedicalRecord('id'), async (req, res) => {
  const { id } = req.params;
  try {
    const record = await MedicalRecord.findOne({
      $or: [
        { recordId: id },
        { _id: id }
      ]
    });
    if (!record) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    // Only allow updating certain fields
    const allowedFields = ['status', 'description', 'title', 'priority', 'accessLevel', 'tags'];
    let updated = false;
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        record[key] = req.body[key];
        updated = true;
      }
    }
    if (!updated) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }
    record.updatedBy = req.user._id;
    await record.save();
    res.json({ success: true, message: 'Medical record updated successfully', data: { record: record.getSummary() } });
  } catch (error) {
    logger.error('Patch medical record failed:', error);
    res.status(500).json({ error: 'Failed to update medical record' });
  }
});

// @route   DELETE /api/v1/medical-records/:id
// @desc    Delete medical record (soft delete)
// @access  Private
router.delete('/:id', requireRole(['admin']), canAccessMedicalRecord('id'), async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ 
      $or: [
        { recordId: req.params.id },
        { _id: req.params.id }
      ]
    });

    if (!record) {
      return res.status(404).json({
        error: 'Medical record not found'
      });
    }

    // Soft delete
    record.status = 'archived';
    record.updatedBy = req.user._id;
    await record.save();

    logger.audit('medical_record_deleted', req.user.userId, `record:${record.recordId}`, {
      recordId: record.recordId,
      patientId: record.patientId
    });

    res.json({
      success: true,
      message: 'Medical record deleted successfully'
    });
  } catch (error) {
    logger.error('Delete medical record failed:', error);
    res.status(500).json({
      error: 'Failed to delete medical record'
    });
  }
});

// POST /api/v1/medical-records/:id/attachments
router.post('/:id/attachments', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Medical record not found' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedAt: new Date(),
      uploadedBy: req.user._id
    };
    record.attachments.push(attachment);
    await record.save();
    res.status(201).json({ success: true, message: 'Attachment added', data: attachment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add attachment', details: error.message });
  }
});

// DELETE /api/v1/medical-records/:id/attachments/:attachmentId
router.delete('/:id/attachments/:attachmentId', authenticateToken, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Medical record not found' });
    const attachment = record.attachments.find(att => att._id.toString() === req.params.attachmentId);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });
    // Remove file from disk
    if (attachment.path && fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }
    // Remove from array
    record.attachments = record.attachments.filter(att => att._id.toString() !== req.params.attachmentId);
    await record.save();
    res.json({ success: true, message: 'Attachment removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove attachment', details: error.message });
  }
});

// @route   GET /api/v1/medical-records/patient/:patientId
// @desc    Get medical records for a specific patient
// @access  Private
router.get('/patient/:patientId', canAccessPatient('patientId'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const options = {};
    if (req.query.recordType) options.recordType = req.query.recordType;
    if (req.query.status) options.status = req.query.status;
    if (req.query.dateRange) {
      const [start, end] = req.query.dateRange.split(',');
      options.dateRange = {
        start: new Date(start),
        end: new Date(end)
      };
    }

    const records = await MedicalRecord.findByPatient(req.params.patientId, {
      ...options,
      limit
    });

    const total = await MedicalRecord.countDocuments({ patientId: req.params.patientId });

    logger.audit('patient_records_viewed', req.user.userId, `patient:${req.params.patientId}`, {
      patientId: req.params.patientId,
      count: records.length
    });

    res.json({
      success: true,
      data: {
        records: records.map(r => r.getSummary()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get patient records failed:', error);
    res.status(500).json({
      error: 'Failed to get patient records'
    });
  }
});

// @route   GET /api/v1/medical-records/patient/:patientId/medication-history
// @desc    Get medication history for a patient (pharmacy access)
// @access  Private (pharmacy, must be government verified)
router.get('/patient/:patientId/medication-history', authenticateToken, requireRole(['pharmacy']), isGovernmentVerifiedProfessional, async (req, res) => {
  try {
    const { patientId } = req.params;
    // Find all prescription and pharmacy dispense records for this patient
    const records = await MedicalRecord.find({
      patientId,
      recordType: { $in: ['prescription', 'pharmacy_dispense'] }
    }).sort({ recordDate: -1 });
    res.json({ success: true, data: { medicationHistory: records } });
  } catch (error) {
    logger.error('Get medication history failed:', error);
    res.status(500).json({ error: 'Failed to get medication history', details: error.message });
  }
});

// @route   GET /api/v1/medical-records/statistics
// @desc    Get medical record statistics
// @access  Private
router.get('/statistics/overview', requireRole(['admin', 'doctor']), async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.patientId) {
      filters.patientId = req.query.patientId;
    }

    if (req.query.dateRange) {
      const [start, end] = req.query.dateRange.split(',');
      filters.dateRange = {
        start: new Date(start),
        end: new Date(end)
      };
    }

    const stats = await MedicalRecord.getStatistics(filters);

    res.json({
      success: true,
      data: {
        statistics: stats
      }
    });
  } catch (error) {
    logger.error('Get medical record statistics failed:', error);
    res.status(500).json({
      error: 'Failed to get medical record statistics'
    });
  }
});

// @route   GET /api/v1/medical-records/blockchain/status
// @desc    Get blockchain service status
// @access  Private (admin, service_account)
router.get('/blockchain/status', requireRole(['admin', 'service_account']), async (req, res) => {
  try {
    const blockchainService = require('../services/blockchainService');
    const status = await blockchainService.getNetworkStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Get blockchain status failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blockchain status',
      details: error.message
    });
  }
});

// @route   PATCH /api/v1/medical-records/:id/blockchain-status
// @desc    Update medical record blockchain status
// @access  Private (admin, service_account)
router.patch('/:id/blockchain-status', requireRole(['admin', 'service_account']), canAccessMedicalRecord('id'), async (req, res) => {
  try {
    const { id } = req.params;
    const { action, transactionHash, blockNumber, isVerified } = req.body;

    // Find the medical record
    const record = await MedicalRecord.findOne({
      $or: [
        { recordId: id },
        { _id: id }
      ]
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    // Import blockchain service
    const blockchainService = require('../services/blockchainService');

    let result = {};

    // Process different actions
    switch (action) {
      case 'record':
        // Record the medical record on blockchain
        try {
          const blockchainResult = await blockchainService.recordOnBlockchain({
            recordId: record.recordId,
            dataHash: record.dataHash,
            encryptedData: record.encryptedData
          });

          // Update the record with blockchain information
          await record.updateBlockchainStatus(
            blockchainResult.transactionHash,
            blockchainResult.blockNumber,
            false // Initially not verified
          );

          result = {
            success: true,
            message: 'Medical record recorded on blockchain successfully',
            data: {
              recordId: record.recordId,
              transactionHash: blockchainResult.transactionHash,
              blockNumber: blockchainResult.blockNumber,
              timestamp: blockchainResult.timestamp,
              isVerified: false
            }
          };
        } catch (blockchainError) {
          logger.error('Blockchain recording failed', {
            recordId: record.recordId,
            error: blockchainError.message
          });
          return res.status(500).json({
            success: false,
            error: 'Failed to record on blockchain',
            details: blockchainError.message
          });
        }
        break;

      case 'verify':
        // Verify the medical record on blockchain
        try {
          if (!record.blockchain.transactionHash) {
            return res.status(400).json({
              success: false,
              error: 'No transaction hash found. Record must be recorded on blockchain first.'
            });
          }

          const verificationResult = await blockchainService.verifyOnBlockchain(
            record.blockchain.transactionHash
          );

          // Update verification status
          record.blockchain.isVerified = verificationResult.isVerified;
          record.blockchain.verificationAttempts += 1;
          await record.save();

          result = {
            success: true,
            message: 'Blockchain verification completed',
            data: {
              recordId: record.recordId,
              transactionHash: record.blockchain.transactionHash,
              isVerified: verificationResult.isVerified,
              verifiedAt: verificationResult.verifiedAt,
              verificationAttempts: record.blockchain.verificationAttempts
            }
          };
        } catch (blockchainError) {
          logger.error('Blockchain verification failed', {
            recordId: record.recordId,
            transactionHash: record.blockchain.transactionHash,
            error: blockchainError.message
          });
          return res.status(500).json({
            success: false,
            error: 'Failed to verify on blockchain',
            details: blockchainError.message
          });
        }
        break;

      case 'update_status':
        // Manual status update (admin override)
        if (isVerified !== undefined) {
          record.blockchain.isVerified = isVerified;
        }
        if (transactionHash) {
          record.blockchain.transactionHash = transactionHash;
        }
        if (blockNumber) {
          record.blockchain.blockNumber = blockNumber;
        }
        
        record.blockchain.timestamp = new Date();
        record.blockchain.verificationAttempts += 1;
        await record.save();

        result = {
          success: true,
          message: 'Blockchain status updated manually',
          data: {
            recordId: record.recordId,
            transactionHash: record.blockchain.transactionHash,
            blockNumber: record.blockchain.blockNumber,
            isVerified: record.blockchain.isVerified,
            timestamp: record.blockchain.timestamp,
            verificationAttempts: record.blockchain.verificationAttempts
          }
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Must be one of: record, verify, update_status'
        });
    }

    // Log the blockchain status update
    logger.audit('blockchain_status_updated', req.user.userId, `record:${record.recordId}`, {
      recordId: record.recordId,
      action,
      transactionHash: record.blockchain.transactionHash,
      isVerified: record.blockchain.isVerified,
      verificationAttempts: record.blockchain.verificationAttempts
    });

    res.json(result);

  } catch (error) {
    logger.error('Update blockchain status failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update blockchain status',
      details: error.message
    });
  }
});

module.exports = router; 