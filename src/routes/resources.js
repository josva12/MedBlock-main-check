const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { authenticateToken, requireRole } = require('../middleware/auth');

// @route   POST /api/v1/resources
// @desc    Create a new health resource
// @access  Private (admin)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
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

// @route   POST /api/v1/resources/:id/react
// @desc    React to a resource
// @access  Private
router.post('/:id/react', authenticateToken, async (req, res) => {
  try {
    const { reaction } = req.body;
    const validReactions = ['happy', 'sad', 'helpful', 'unhelpful', 'neutral'];
    if (!validReactions.includes(reaction)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const userId = req.user.id;

    // Check if user already reacted
    const existingReactionIndex = resource.userReactions.findIndex(
      ur => ur.userId.toString() === userId
    );

    if (existingReactionIndex !== -1) {
      // User already reacted, update their reaction
      const oldReaction = resource.userReactions[existingReactionIndex].reaction;
      if (oldReaction === reaction) {
        // Same reaction, remove it (toggle off)
        resource.reactions[oldReaction]--;
        resource.userReactions.splice(existingReactionIndex, 1);
      } else {
        // Different reaction, update it
        resource.reactions[oldReaction]--;
        resource.reactions[reaction]++;
        resource.userReactions[existingReactionIndex].reaction = reaction;
      }
    } else {
      // New reaction
      resource.reactions[reaction]++;
      resource.userReactions.push({ userId, reaction });
    }

    await resource.save();

    res.json({ 
      success: true, 
      data: {
        reactions: resource.reactions,
        userReaction: resource.userReactions.find(ur => ur.userId.toString() === userId)?.reaction || null
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to react to resource', details: error.message });
  }
});

// @route   POST /api/v1/resources/:id/rate
// @desc    Rate a resource
// @access  Private
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const userId = req.user.id;

    // Check if user already rated
    const existingRatingIndex = resource.userRatings.findIndex(
      ur => ur.userId.toString() === userId
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      resource.userRatings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      resource.userRatings.push({ userId, rating });
    }

    await resource.save();

    res.json({ 
      success: true, 
      data: {
        averageRating: resource.averageRating,
        totalRatings: resource.totalRatings,
        userRating: resource.userRatings.find(ur => ur.userId.toString() === userId)?.rating || null
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rate resource', details: error.message });
  }
});

module.exports = router; 