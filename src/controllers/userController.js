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
    // Exclude the user who is performing the search from the results
    if (req.user && req.user._id) {
      filter._id = { $ne: req.user._id };
    }

    const users = await User.find(filter)
      .limit(10)
      .select('_id userId fullName email role profilePicture avatar');

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error(`Failed to search users with query "${query}": ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while searching for users.'
    });
  }
}; 