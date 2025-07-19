const express = require('express');
const router = express.Router();
const InsurancePolicy = require('../models/InsurancePolicy');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// POST /api/v1/insurance - Enroll a user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { policyTier, premiumAmount, coverageLimit, dependents } = req.body;
    const userId = req.user._id;
    const policy = new InsurancePolicy({
      userId,
      policyTier,
      premiumAmount,
      coverageLimit,
      dependents,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await policy.save();
    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enroll user', details: error.message });
  }
});

// GET /api/v1/insurance/user/:userId - Get user's policy
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const policy = await InsurancePolicy.findOne({ userId });
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch policy', details: error.message });
  }
});

// PATCH /api/v1/insurance/:policyId/status - Update policy status (admin only)
router.patch('/:policyId/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { policyId } = req.params;
    const { status } = req.body;
    const policy = await InsurancePolicy.findByIdAndUpdate(policyId, { status, updatedAt: new Date() }, { new: true });
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update policy status', details: error.message });
  }
});

module.exports = router; 