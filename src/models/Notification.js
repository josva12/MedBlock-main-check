const mongoose = require('mongoose');
const logger = require('../utils/logger');

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Notification type for styling and categorization
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'admin'],
    default: 'info',
    index: true
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Optional metadata for additional context
  metadata: {
    action: String, // e.g., 'appointment_created', 'vital_signs_updated'
    resource: String, // e.g., 'appointment', 'patient', 'vital_signs'
    link: String, // URL to navigate to when clicked
    resourceId: mongoose.Schema.Types.ObjectId // ID of the related resource
  },
  
  // User who sent the notification (for admin notifications)
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return this.createdAt.toLocaleDateString();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  return this.save();
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

// Static method to create system notification
notificationSchema.statics.createSystemNotification = function(userId, title, message, type = 'info', metadata = {}) {
  return this.create({
    userId,
    title,
    message,
    type,
    metadata
  });
};

// Static method to create admin notification
notificationSchema.statics.createAdminNotification = function(userIds, title, message, type = 'admin', metadata = {}, sentBy = null) {
  const notifications = userIds.map(userId => ({
    userId,
    title,
    message,
    type,
    metadata,
    sentBy
  }));
  
  return this.insertMany(notifications);
};

// Pre-save middleware for logging
notificationSchema.pre('save', function(next) {
  if (this.isNew) {
    logger.info('Notification created', {
      notificationId: this._id,
      userId: this.userId,
      type: this.type,
      title: this.title
    });
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema); 