const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/v1/subscriptions
// @desc    Create a new subscription (M-Pesa supported)
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { plan, facilityId, paymentMethod, mpesaReceipt } = req.body;
    const subscription = new Subscription({
      userId: req.user._id,
      facilityId,
      plan,
      paymentMethod: paymentMethod || 'mpesa',
      mpesaReceipt
    });
    await subscription.save();
    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription', details: error.message });
  }
});

// @route   GET /api/v1/subscriptions
// @desc    List all subscriptions (admin only)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const subs = await Subscription.find();
    res.json({ success: true, data: subs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions', details: error.message });
  }
});

// @route   GET /api/v1/subscriptions/:id
// @desc    Get subscription by id
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription', details: error.message });
  }
});

module.exports = router; 