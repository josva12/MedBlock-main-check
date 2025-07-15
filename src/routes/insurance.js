const express = require('express');
const router = express.Router();
const Insurance = require('../models/Insurance');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/v1/insurance
// @desc    Create a new insurance policy
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, plan } = req.body;
    const insurance = new Insurance({ patientId, plan, status: 'active' });
    await insurance.save();
    res.status(201).json({ success: true, data: insurance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create insurance', details: error.message });
  }
});

// @route   GET /api/v1/insurance
// @desc    List all insurance policies (admin only)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const policies = await Insurance.find();
    res.json({ success: true, data: policies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insurance policies', details: error.message });
  }
});

// @route   GET /api/v1/insurance/:id
// @desc    Get insurance policy by id
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const policy = await Insurance.findById(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Insurance policy not found' });
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insurance policy', details: error.message });
  }
});

module.exports = router; 