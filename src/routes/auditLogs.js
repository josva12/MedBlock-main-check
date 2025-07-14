const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const router = express.Router();
const AuditLog = require('../models/AuditLog'); // You will need to create this model

// GET /api/v1/audit-logs?userId=...&action=...&startDate=...&endDate=...
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId, action, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (startDate || endDate) query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit));
    const total = await AuditLog.countDocuments(query);
    res.json({
      success: true,
      data: logs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    logger.error('Failed to fetch audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs', details: error.message });
  }
});

module.exports = router; 