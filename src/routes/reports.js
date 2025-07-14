const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const logger = require('../utils/logger');
const router = express.Router();

// GET /api/v1/reports/medical-record-trends
router.get('/medical-record-trends', authenticateToken, async (req, res) => {
  try {
    // Example: count records by type per month
    const trends = await MedicalRecord.aggregate([
      { $group: {
        _id: { type: '$recordType', month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.type': 1 } }
    ]);
    res.json({ success: true, data: trends });
  } catch (error) {
    logger.error('Failed to generate medical record trends report:', error);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
});

// GET /api/v1/reports/appointment-utilization
router.get('/appointment-utilization', authenticateToken, async (req, res) => {
  try {
    // Example: count appointments by status per month
    const utilization = await Appointment.aggregate([
      { $group: {
        _id: { status: '$status', month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.status': 1 } }
    ]);
    res.json({ success: true, data: utilization });
  } catch (error) {
    logger.error('Failed to generate appointment utilization report:', error);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
});

module.exports = router; 