const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/v1/claims
// @desc    Create a new insurance claim (blockchain hash optional)
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, insurerId, amount, blockchainHash } = req.body;
    const claim = new Claim({ patientId, insurerId, amount, blockchainHash });
    await claim.save();
    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create claim', details: error.message });
  }
});

// @route   GET /api/v1/claims
// @desc    List all claims (admin/insurer only)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const claims = await Claim.find();
    res.json({ success: true, data: claims });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claims', details: error.message });
  }
});

// @route   GET /api/v1/claims/:id
// @desc    Get claim by id
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    res.json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claim', details: error.message });
  }
});

module.exports = router; 