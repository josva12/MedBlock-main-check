const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const logger = require("../utils/logger");
const router = express.Router();

// Notification model (we'll create this)
const Notification = require("../models/Notification");

// POST /api/v1/notifications/sms
router.post("/sms", authenticateToken, async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: "Missing to or message" });
    }
    // TODO: Integrate with SMS provider
    logger.info(`SMS sent to ${to}: ${message}`);
    res.json({ success: true, message: "SMS sent (stub)" });
  } catch (error) {
    logger.error("Failed to send SMS:", error);
    res
      .status(500)
      .json({ error: "Failed to send SMS", details: error.message });
  }
});

// POST /api/v1/notifications/email
router.post("/email", authenticateToken, async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) {
      return res.status(400).json({ error: "Missing to, subject, or message" });
    }
    // TODO: Integrate with email provider
    logger.info(
      `Email sent to ${to}: Subject: ${subject}, Message: ${message}`,
    );
    res.json({ success: true, message: "Email sent (stub)" });
  } catch (error) {
    logger.error("Failed to send email:", error);
    res
      .status(500)
      .json({ error: "Failed to send email", details: error.message });
  }
});

// GET /api/v1/users/:id/notifications
router.get("/users/:id/notifications", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { userId: id };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: id,
      isRead: false,
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      unreadCount,
    });
  } catch (error) {
    logger.error("Failed to fetch user notifications:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch notifications", details: error.message });
  }
});

// PATCH /api/v1/notifications/:id/read
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    logger.error("Failed to mark notification as read:", error);
    res
      .status(500)
      .json({
        error: "Failed to mark notification as read",
        details: error.message,
      });
  }
});

// POST /api/v1/notifications/read-all
router.post("/read-all", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    logger.error("Failed to mark all notifications as read:", error);
    res
      .status(500)
      .json({
        error: "Failed to mark all notifications as read",
        details: error.message,
      });
  }
});

// DELETE /api/v1/notifications/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    logger.error("Failed to delete notification:", error);
    res
      .status(500)
      .json({ error: "Failed to delete notification", details: error.message });
  }
});

// POST /api/v1/notifications/send
router.post("/send", authenticateToken, async (req, res) => {
  try {
    const {
      userIds,
      roles,
      title,
      message,
      type = "info",
      metadata,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    // Build query to find target users
    const userQuery = {};
    if (userIds && userIds.length > 0) {
      userQuery._id = { $in: userIds };
    }
    if (roles && roles.length > 0) {
      userQuery.role = { $in: roles };
    }

    if (!userIds && !roles) {
      return res
        .status(400)
        .json({ error: "Either userIds or roles must be specified" });
    }

    // Find target users
    const User = require("../models/User");
    const targetUsers = await User.find(userQuery).select("_id");

    if (targetUsers.length === 0) {
      return res
        .status(404)
        .json({ error: "No users found matching the criteria" });
    }

    // Create notifications for each user
    const notifications = targetUsers.map((user) => ({
      userId: user._id,
      title,
      message,
      type,
      metadata,
      isRead: false,
    }));

    await Notification.insertMany(notifications);

    logger.info(`Notification sent to ${targetUsers.length} users`, {
      title,
      type,
      sentBy: req.user.id,
    });

    res.json({
      success: true,
      message: `Notification sent to ${targetUsers.length} users`,
      sentCount: targetUsers.length,
    });
  } catch (error) {
    logger.error("Failed to send notification:", error);
    res
      .status(500)
      .json({ error: "Failed to send notification", details: error.message });
  }
});

// PATCH /api/v1/notifications/:id/unread
router.patch("/:id/unread", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: false },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    logger.error("Failed to mark notification as unread:", error);
    res
      .status(500)
      .json({
        error: "Failed to mark notification as unread",
        details: error.message,
      });
  }
});

// GET /api/v1/notifications/unread-count?userId=...
router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });
    res.json({ success: true, unreadCount });
  } catch (error) {
    logger.error("Failed to fetch unread count:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch unread count", details: error.message });
  }
});

module.exports = router;
