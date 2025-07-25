const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * @desc    Search for users by name, email, or userId for chat invitations
 * @route   GET /api/v1/users/search
 * @access  Private (must be logged in)
 */
exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === "") {
    // If the query is empty, return an empty array immediately.
    return res.status(200).json({ success: true, data: [] });
  }

  // Sanitize the query to prevent Regex crashes on special characters
  const sanitizedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  try {
    // Build a robust and efficient database query
    const searchRegex = new RegExp(sanitizedQuery, 'i'); // 'i' for case-insensitive

    const filter = {
      $or: [
        { fullName: searchRegex },
        { email: searchRegex },
        { userId: searchRegex }
      ]
    };

    // This is the most reliable way to check for the user's ID
    // from your auth middleware and exclude them from the search.
    if (req.user && req.user.userId) {
      filter._id = { $ne: req.user.userId };
    }

    const users = await User.find(filter)
      .limit(10)
      .select('_id userId fullName email role profilePicture avatar'); // Only send necessary fields

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    // This will catch any other unforeseen errors and prevent a server crash
    logger.error(`User search failed with query "${query}":`, error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during the user search.'
    });
  }
}; 