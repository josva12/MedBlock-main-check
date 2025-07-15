const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/v1/predictions
// @desc    Create a new AI health risk prediction
// @access  Private (doctor, admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, risk, probability } = req.body;
    const prediction = new Prediction({ patientId, risk, probability });
    await prediction.save();
    res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prediction', details: error.message });
  }
});

// @route   GET /api/v1/predictions
// @desc    List all predictions (admin/doctor only)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const predictions = await Prediction.find();
    res.json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch predictions', details: error.message });
  }
});

// @route   GET /api/v1/predictions/:id
// @desc    Get prediction by id
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) return res.status(404).json({ error: 'Prediction not found' });
    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prediction', details: error.message });
  }
});

module.exports = router; 