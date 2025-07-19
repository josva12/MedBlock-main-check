const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');
const router = express.Router();
const Report = require('../models/Report');

// List all reports
router.get('/', authenticateToken, requireRole(['admin', 'doctor', 'nurse', 'front-desk']), async (req, res) => {
  try {
    const reports = await Report.find();
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports', details: error.message });
  }
});

// Create a new report
router.post('/', authenticateToken, requireRole(['admin', 'doctor', 'nurse']), async (req, res) => {
  try {
    const report = new Report({ ...req.body });
    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create report', details: error.message });
  }
});

// Get report by id
router.get('/:id', authenticateToken, requireRole(['admin', 'doctor', 'nurse', 'front-desk']), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report', details: error.message });
  }
});

// Update report
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor', 'nurse']), async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report', details: error.message });
  }
});

// Delete report
router.delete('/:id', authenticateToken, requireRole(['admin', 'doctor', 'nurse']), async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete report', details: error.message });
  }
});

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

// GET /api/v1/reports/patient-demographics
router.get('/patient-demographics', authenticateToken, async (req, res) => {
  try {
    // Gender distribution
    const genderStats = await Patient.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    // Age group distribution
    const now = new Date();
    const ageGroups = [
      { label: '0-17', min: 0, max: 17 },
      { label: '18-35', min: 18, max: 35 },
      { label: '36-55', min: 36, max: 55 },
      { label: '56+', min: 56, max: 200 }
    ];
    const ageStats = [];
    for (const group of ageGroups) {
      const minDate = new Date(now.getFullYear() - group.max, now.getMonth(), now.getDate());
      const maxDate = new Date(now.getFullYear() - group.min, now.getMonth(), now.getDate());
      const count = await Patient.countDocuments({ dateOfBirth: { $gte: minDate, $lte: maxDate } });
      ageStats.push({ group: group.label, count });
    }
    // County distribution
    const countyStats = await Patient.aggregate([
      { $group: { _id: '$address.county', count: { $sum: 1 } } }
    ]);
    res.json({
      success: true,
      data: {
        gender: genderStats,
        ageGroups: ageStats,
        county: countyStats
      }
    });
  } catch (error) {
    logger.error('Failed to generate patient demographics report:', error);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
});

module.exports = router; 