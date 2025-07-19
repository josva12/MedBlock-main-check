const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');
const router = express.Router();

// In-memory reports array for demo (replace with DB/model in production)
let reports = [
  {
    _id: '1',
    patientId: 'p1',
    patientName: 'John Doe',
    reportType: 'lab',
    title: 'Blood Test',
    content: 'Normal',
    findings: 'All good',
    recommendations: 'Continue medication',
    status: 'completed',
    generatedBy: 'u1',
    generatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// List all reports
router.get('/', authenticateToken, requireRole(['admin', 'doctor', 'nurse', 'front-desk']), (req, res) => {
  res.json({ success: true, data: reports });
});

// Create a new report
router.post('/', authenticateToken, requireRole(['admin', 'doctor', 'nurse']), (req, res) => {
  const newReport = {
    ...req.body,
    _id: (reports.length + 1).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  reports.push(newReport);
  res.status(201).json({ success: true, data: newReport });
});

// Get report by id
router.get('/:id', authenticateToken, requireRole(['admin', 'doctor', 'nurse', 'front-desk']), (req, res) => {
  const report = reports.find(r => r._id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json({ success: true, data: report });
});

// Update report
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor', 'nurse']), (req, res) => {
  const idx = reports.findIndex(r => r._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Report not found' });
  reports[idx] = { ...reports[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: reports[idx] });
});

// Delete report
router.delete('/:id', authenticateToken, requireRole(['admin', 'doctor', 'nurse']), (req, res) => {
  const idx = reports.findIndex(r => r._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Report not found' });
  const deleted = reports.splice(idx, 1)[0];
  res.json({ success: true, data: deleted });
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