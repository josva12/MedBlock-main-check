const express = require('express');
const router = express.Router();
const Teleconsultation = require('../models/Teleconsultation');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/v1/teleconsultations
// @desc    Create a new teleconsultation (M-Pesa supported)
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, doctorId, paymentMethod, mpesaReceipt } = req.body;
    const teleconsult = new Teleconsultation({
      patientId,
      doctorId,
      paymentMethod: paymentMethod || 'mpesa',
      mpesaReceipt
    });
    await teleconsult.save();
    res.status(201).json({ success: true, data: teleconsult });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create teleconsultation', details: error.message });
  }
});

// @route   GET /api/v1/teleconsultations
// @desc    List all teleconsultations (admin/doctor only)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const teleconsults = await Teleconsultation.find();
    res.json({ success: true, data: teleconsults });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teleconsultations', details: error.message });
  }
});

// @route   GET /api/v1/teleconsultations/:id
// @desc    Get teleconsultation by id
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const teleconsult = await Teleconsultation.findById(req.params.id);
    if (!teleconsult) return res.status(404).json({ error: 'Teleconsultation not found' });
    res.json({ success: true, data: teleconsult });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teleconsultation', details: error.message });
  }
});

module.exports = router; 