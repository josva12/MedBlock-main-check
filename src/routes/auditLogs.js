const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const router = express.Router();
const AuditLog = require('../models/AuditLog'); // You will need to create this model
const { BlockchainService } = require('../services/blockchainService');
const { requireRole } = require('../middleware/authMiddleware');

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

// GET /api/v1/audit-logs/blockchain?entityType=...&entityId=...
// Only admin can access
router.get('/blockchain', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    if (!entityType || !entityId) {
      return res.status(400).json({ error: 'entityType and entityId are required' });
    }
    // Map entityType to model and blockchain transaction field
    const modelMap = {
      'medicalRecord': require('../models/MedicalRecord'),
      'claim': require('../models/Claim'),
      'insurancePolicy': require('../models/InsurancePolicy'),
      'facility': require('../models/Facility')
    };
    const Model = modelMap[entityType];
    if (!Model) return res.status(400).json({ error: 'Invalid entityType' });
    const entity = await Model.findById(entityId);
    if (!entity) return res.status(404).json({ error: 'Entity not found' });
    if (!entity.transactionHash && !(entity.blockchain && entity.blockchain.transactionHash)) {
      return res.status(404).json({ error: 'No blockchain transaction found for this entity' });
    }
    const txHash = entity.transactionHash || (entity.blockchain && entity.blockchain.transactionHash);
    const blockchainService = new BlockchainService();
    const txDetails = await blockchainService.getTransactionDetails(txHash);
    res.json({ success: true, data: txDetails });
  } catch (error) {
    logger.error('Failed to fetch blockchain log:', error);
    res.status(500).json({ error: 'Failed to fetch blockchain log', details: error.message });
  }
});

module.exports = router; 