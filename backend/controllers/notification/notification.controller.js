import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

/**
 * Get user's web notifications (paginated)
 */
export const getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      purpose,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      userId: req.user.id,
      type: "web",
      deletedAt: null,
    };

    if (unreadOnly === "true") {
      where.isRead = false;
    }

    if (purpose) {
      where.purpose = purpose;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        select: {
          id: true,
          purpose: true,
          title: true,
          body: true,
          actionUrl: true,
          isRead: true,
          readAt: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.notificationLog.count({ where }),
      prisma.notificationLog.count({
        where: {
          userId: req.user.id,
          type: "web",
          isRead: false,
        },
      }),
    ]);

    logger.info("Notifications retrieved", {
      userId: req.user.id,
      count: notifications.length,
      total,
      unreadCount,
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        unreadCount,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getNotifications",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await prisma.notificationLog.count({
      where: {
        userId: req.user.id,
        type: "web",
        isRead: false,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getUnreadCount",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to get unread count",
    });
  }
};

/**
 * Mark single notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notificationLog.findUnique({
      where: { id: parseInt(id) },
      select: { userId: true, isRead: true },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (notification.isRead) {
      return res.status(200).json({
        success: true,
        message: "Notification already read",
      });
    }

    await prisma.notificationLog.update({
      where: { id: parseInt(id) },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    logger.info("Notification marked as read", {
      notificationId: parseInt(id),
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "markAsRead",
      userId: req.user?.id,
      notificationId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const result = await prisma.notificationLog.updateMany({
      where: {
        userId: req.user.id,
        type: "web",
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    logger.info("All notifications marked as read", {
      userId: req.user.id,
      count: result.count,
    });

    res.status(200).json({
      success: true,
      message: `${result.count} notification(s) marked as read`,
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "markAllAsRead",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};

/**
 * Delete notification (soft delete)
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notificationLog.findUnique({
      where: { id: parseInt(id) },
      select: { userId: true },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Soft delete
    await prisma.notificationLog.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });

    logger.info("Notification deleted", {
      notificationId: parseInt(id),
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "deleteNotification",
      userId: req.user?.id,
      notificationId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

/**
 * Clear all read notifications (soft delete)
 */
export const clearAllRead = async (req, res) => {
  try {
    const result = await prisma.notificationLog.updateMany({
      where: {
        userId: req.user.id,
        type: "web",
        isRead: true,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    logger.info("All read notifications cleared", {
      userId: req.user.id,
      count: result.count,
    });

    res.status(200).json({
      success: true,
      message: `${result.count} notification(s) cleared`,
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "clearAllRead",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to clear notifications",
    });
  }
};
