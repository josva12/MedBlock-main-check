const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
// Assuming you have validateObjectId in ../utils/validation, if not, add it
const { validateObjectId } = require('../utils/validation'); 
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const { body, validationResult } = require('express-validator'); // Import for validation

// GET /api/v1/admin/admins - List all admin users
router.get(
  '/admins',
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      // Additional safety check for req.user
      if (!req.user || !req.user._id) {
        logger.error('CRITICAL_ERROR: req.user is not properly set in admin route');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const admins = await User.find({ role: 'admin' }).select('-password');
      logger.audit('FETCH_ADMINS_SUCCESS', req.user._id, 'Admins List');
      res.status(200).json({ success: true, count: admins.length, data: admins });
    } catch (err) {
      const accessorId = req.user ? req.user._id : 'N/A';
      logger.error('FETCH_ADMINS_FAILED', { userId: accessorId, error: err.message });
      res.status(500).json({ error: 'Server error while fetching admins' });
    }
  }
);

// --- NEW ROUTE: PATCH /api/v1/admin/users/:id/verify-professional ---
// @route   PATCH /api/v1/admin/users/:id/verify-professional
// @desc    Admin verifies or rejects a professional (doctor/nurse)
// @access  Private (admin)
router.patch('/users/:id/verify-professional', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
    const { id } = req.params;
    const { status, rejectionReason, notes, submittedLicenseNumber, licensingBody } = req.body;
    if (!['verified', 'rejected', 'pending', 'unsubmitted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
      }
    const user = await User.findById(id);
      if (!user) {
      return res.status(404).json({ error: 'User not found' });
      }
    // --- Professional Verification Logic ---
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = 'info';
    // Handle rejection attempts and blocking
    if (status === 'rejected') {
      user.professionalVerification.rejectionAttempts = (user.professionalVerification.rejectionAttempts || 0) + 1;
      user.professionalVerification.blocked = false;
      if (user.professionalVerification.rejectionAttempts >= 3) {
        user.professionalVerification.blocked = true;
        user.isActive = false;
        notificationTitle = 'Account Blocked';
        notificationMessage = 'You have been blocked from the system after 3 failed verification attempts. Please contact support.';
        notificationType = 'error';
      } else {
        notificationTitle = 'Verification Rejected';
        notificationMessage = `Your professional verification was rejected. Reason: ${rejectionReason || 'Not specified'}. You have ${3 - user.professionalVerification.rejectionAttempts} attempt(s) left.`;
        notificationType = 'warning';
      }
    } else if (status === 'verified') {
      user.professionalVerification.rejectionAttempts = 0;
      user.professionalVerification.blocked = false;
      user.isActive = true;
      notificationTitle = 'Verification Approved';
      notificationMessage = 'Congratulations! Your professional verification has been approved. You can now access all system features.';
      notificationType = 'success';
    } else if (status === 'pending') {
      notificationTitle = 'Verification Submitted';
      notificationMessage = 'Your professional details have been submitted and are under review.';
      notificationType = 'info';
    }
    user.professionalVerification.status = status;
    user.professionalVerification.verificationDate = status === 'verified' ? new Date() : undefined;
    user.professionalVerification.verifiedBy = req.user._id;
    user.professionalVerification.rejectionReason = status === 'rejected' ? rejectionReason : undefined;
    user.professionalVerification.notes = notes;
    if (submittedLicenseNumber) user.professionalVerification.submittedLicenseNumber = submittedLicenseNumber;
    if (licensingBody) user.professionalVerification.licensingBody = licensingBody;
    user.isGovernmentVerified = status === 'verified';
    user.isVerified = status === 'verified';
    await user.save();
    logger.audit('professional_verification', req.user._id, 'user', { userId: id, status });
    // --- Send notification if needed ---
    if (notificationTitle && notificationMessage) {
      await Notification.createSystemNotification(user._id, notificationTitle, notificationMessage, notificationType, {
        action: 'professional_verification',
        status,
        rejectionAttempts: user.professionalVerification.rejectionAttempts,
        blocked: user.professionalVerification.blocked
      });
    }
    res.json({ success: true, message: 'Professional verification updated', data: { user: user.getProfile() }, notification: { title: notificationTitle, message: notificationMessage, type: notificationType } });
  } catch (error) {
    logger.error('Professional verification failed:', error);
    res.status(500).json({ error: 'Failed to verify professional', details: error.message });
    }
});

// DELETE /api/v1/admin/users/:id - Delete any user (admin only, not self)
router.delete(
  '/users/:id',
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      // Additional safety check for req.user
      if (!req.user || !req.user._id) {
        logger.error('CRITICAL_ERROR: req.user is not properly set in admin delete route');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const userToDeleteId = req.params.id;
      if (req.user._id.toString() === userToDeleteId) {
        logger.warn('SECURITY_EVENT: Admin attempted self-deletion via admin route.', { adminId: req.user._id });
        return res.status(400).json({ error: 'You cannot delete your own admin account.' });
      }
      const user = await User.findById(userToDeleteId);
      if (!user) {
        return res.status(404).json({ error: 'User not found with that ID.' });
      }
      await user.deleteOne();
      logger.audit('ADMIN_DELETE_USER_SUCCESS', req.user._id, `Deleted User ID: ${userToDeleteId}`);
      res.status(200).json({ success: true, message: `User with ID ${userToDeleteId} has been successfully deleted.` });
    } catch (err) {
      const accessorId = req.user ? req.user._id : 'N/A';
      logger.error('ADMIN_DELETE_USER_FAILED', { adminId: accessorId, targetId: req.params.id, error: err.message });
      res.status(500).json({ error: 'Server error while deleting user' });
    }
  }
);

module.exports = router; 