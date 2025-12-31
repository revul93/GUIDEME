import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllRead,
} from "../controllers/notification/notification.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get notifications (with pagination and filters)
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark single notification as read
router.put("/:id/read", markAsRead);

// Mark all notifications as read
router.put("/mark-all-read", markAllAsRead);

// Delete single notification
router.delete("/:id", deleteNotification);

// Clear all read notifications
router.delete("/clear-read", clearAllRead);

export default router;
