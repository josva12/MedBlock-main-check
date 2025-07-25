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

    const users = await User.find({
      $or: [
        { fullName: searchRegex },
        { email: searchRegex },
        { userId: searchRegex }
      ],
      // Exclude the user who is performing the search from the results
      _id: { $ne: req.user.userId } 
    })
    .limit(10) // Limit results to prevent sending huge payloads
    .select('_id userId fullName email role profilePicture avatar'); // Only send necessary fields

    logger.audit('USER_SEARCH_SUCCESS', req.user.userId, `query:${sanitizedQuery}`);
    res.status(200).json({ success: true, data: users });

  } catch (error) {
    logger.error('USER_SEARCH_FAILED:', error);
    res.status(500).json({ success: false, error: 'Failed to search users.' });
  }
};

/**
 * @desc    Update user profile picture
 * @route   PUT /api/v1/users/profile-picture
 * @access  Private
 */
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Profile picture is required' });
    }

    const profilePicture = {
      filename: req.file.filename,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture },
      { new: true }
    ).select('_id fullName email role profilePicture');

    logger.audit('PROFILE_PICTURE_UPDATED', req.user._id, `file:${req.file.filename}`);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error('PROFILE_PICTURE_UPDATE_FAILED:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile picture' });
  }
};

/**
 * @desc    Update user privacy settings
 * @route   PUT /api/v1/users/privacy-settings
 * @access  Private
 */
exports.updatePrivacySettings = async (req, res) => {
  try {
    const { showLastSeen, showOnlineStatus } = req.body;

    const updateData = {};
    if (typeof showLastSeen === 'boolean') {
      updateData['preferences.showLastSeen'] = showLastSeen;
    }
    if (typeof showOnlineStatus === 'boolean') {
      updateData['preferences.showOnlineStatus'] = showOnlineStatus;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('_id fullName email preferences');

    logger.audit('PRIVACY_SETTINGS_UPDATED', req.user._id, `settings:${JSON.stringify(updateData)}`);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error('PRIVACY_SETTINGS_UPDATE_FAILED:', error);
    res.status(500).json({ success: false, error: 'Failed to update privacy settings' });
  }
};

/**
 * @desc    Update user online status
 * @route   PUT /api/v1/users/online-status
 * @access  Private
 */
exports.updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;

    const updateData = {
      isOnline: Boolean(isOnline),
      lastActive: new Date()
    };

    if (!isOnline) {
      updateData.lastSeen = new Date();
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('_id fullName isOnline lastSeen lastActive preferences.showLastSeen preferences.showOnlineStatus');

    logger.audit('ONLINE_STATUS_UPDATED', req.user._id, `status:${isOnline}`);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error('ONLINE_STATUS_UPDATE_FAILED:', error);
    res.status(500).json({ success: false, error: 'Failed to update online status' });
  }
};

/**
 * @desc    Get user's privacy settings and online status
 * @route   GET /api/v1/users/privacy-status
 * @access  Private
 */
exports.getPrivacyStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('_id fullName isOnline lastSeen lastActive preferences.showLastSeen preferences.showOnlineStatus');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error('PRIVACY_STATUS_FETCH_FAILED:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch privacy status' });
  }
};

/**
 * @desc    Get user's online status (for other users to see)
 * @route   GET /api/v1/users/:userId/status
 * @access  Private
 */
exports.getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('_id fullName isOnline lastSeen preferences.showLastSeen preferences.showOnlineStatus');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if the user allows showing their status
    const statusData = {
      _id: user._id,
      fullName: user.fullName
    };

    if (user.preferences.showOnlineStatus) {
      statusData.isOnline = user.isOnline;
    }

    if (user.preferences.showLastSeen && !user.isOnline) {
      statusData.lastSeen = user.lastSeen;
    }

    res.status(200).json({ success: true, data: statusData });
  } catch (error) {
    logger.error('USER_STATUS_FETCH_FAILED:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user status' });
  }
}; 