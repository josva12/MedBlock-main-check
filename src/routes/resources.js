const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/v1/resources
// @desc    Create a new health resource
// @access  Private (admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const resource = new Resource({ title, content, category });
    await resource.save();
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resource', details: error.message });
  }
});

// @route   GET /api/v1/resources
// @desc    List all resources, filter by category
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const resources = await Resource.find(filter);
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resources', details: error.message });
  }
});

// @route   GET /api/v1/resources/:id
// @desc    Get resource by id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resource', details: error.message });
  }
});

module.exports = router; 