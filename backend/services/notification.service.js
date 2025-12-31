import prisma from "../config/db.js";
import {
  sendOTPEmail,
  sendWelcomeEmail,
  sendCaseStatusEmail,
  sendNewCommentEmail,
  sendPaymentReceiptEmail,
  sendCaseSubmissionEmail,
} from "./email.service.js";
import { sendWhatsAppOtp } from "./twilio.service.js";
import logger from "../utils/logger.js";

const logNotification = async (notificationData) => {
  try {
    const notification = await prisma.notificationLog.create({
      data: notificationData,
    });
    return notification;
  } catch (error) {
    logger.error("Failed to log notification:", {
      error: error.message,
      data: notificationData,
    });
    return null;
  }
};

export const createWebNotification = async ({
  userId,
  purpose,
  title,
  body,
  actionUrl = null,
  metadata = {},
  language = "en",
}) => {
  try {
    const notification = await prisma.notificationLog.create({
      data: {
        userId,
        type: "web",
        purpose,
        recipient: userId.toString(),
        title,
        body,
        actionUrl,
        language,
        sent: true,
        sentAt: new Date(),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    logger.info("Web notification created", {
      notificationId: notification.id,
      userId,
      purpose,
    });

    return { success: true, notification };
  } catch (error) {
    logger.error("Failed to create web notification:", {
      error: error.message,
      userId,
      purpose,
    });
    return { success: false, error: error.message };
  }
};

export const sendOtpNotification = async (
  userId,
  recipient,
  code,
  channel,
  purpose,
  userName = "",
  language = "en"
) => {
  const notificationLog = await logNotification({
    userId,
    type: channel,
    purpose: "otp",
    recipient,
    templateUsed: "otp",
    language,
    subject:
      purpose === "register"
        ? language === "en"
          ? "Welcome - Verification Code"
          : "مرحباً بك - رمز التحقق"
        : language === "en"
          ? "Verification Code"
          : "رمز التحقق",
    metadata: { purpose },
  });

  let result;

  try {
    if (channel === "email") {
      result = await sendOTPEmail(recipient, code, purpose, userName, language);
    } else if (channel === "whatsapp") {
      result = await sendWhatsAppOtp(recipient, code, language);
    } else {
      result = { success: false, error: "Invalid channel" };
    }

    // Update notification log with result
    if (notificationLog) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          sent: result.success,
          sentAt: result.success ? new Date() : null,
          error: result.success ? null : result.error || result.message,
          errorCode: result.error,
          messageId: result.messageId,
        },
      });
    }

    return result;
  } catch (error) {
    logger.error("Failed to send OTP notification:", {
      error: error.message,
      userId,
      recipient,
      channel,
    });

    if (notificationLog) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          sent: false,
          error: error.message,
        },
      });
    }

    return { success: false, error: error.message };
  }
};

export const sendWelcomeNotification = async (
  userId,
  email,
  name,
  language = "en"
) => {
  const notificationLog = await logNotification({
    userId,
    type: "email",
    purpose: "welcome",
    recipient: email,
    templateUsed: "welcome",
    language,
    subject: language === "en" ? "Welcome to GuideMe" : "مرحباً بك في GuideMe",
  });

  try {
    const result = await sendWelcomeEmail(email, name, language);

    if (notificationLog) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          sent: result.success,
          sentAt: result.success ? new Date() : null,
          error: result.success ? null : result.error,
          messageId: result.messageId,
        },
      });
    }

    return result;
  } catch (error) {
    logger.error("Failed to send welcome notification:", {
      error: error.message,
      userId,
      email,
    });

    if (notificationLog) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          sent: false,
          error: error.message,
        },
      });
    }

    return { success: false, error: error.message };
  }
};

/**
 * Send case status update notification (Email + Web)
 */
export const sendCaseStatusNotification = async (
  userId,
  email,
  caseData,
  newStatus,
  language = "en"
) => {
  const notificationLog = await logNotification({
    userId,
    type: "email",
    purpose: "case_update",
    recipient: email,
    templateUsed: "case_status",
    language,
    subject: `Case ${caseData.caseNumber} - Status Update`,
    metadata: { caseId: caseData.id, status: newStatus },
  });

  try {
    // Send email
    const result = await sendCaseStatusEmail(
      email,
      caseData,
      newStatus,
      language
    );

    if (notificationLog) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          sent: result.success,
          sentAt: result.success ? new Date() : null,
          error: result.success ? null : result.error,
          messageId: result.messageId,
        },
      });
    }

    // Create web notification
    await createWebNotification({
      userId,
      purpose: "status_changed",
      title:
        language === "ar"
          ? `تحديث حالة الحالة ${caseData.caseNumber}`
          : `Case ${caseData.caseNumber} Status Update`,
      body:
        language === "ar"
          ? `تم تحديث حالة حالتك إلى: ${newStatus}`
          : `Your case status changed to: ${newStatus}`,
      actionUrl: `/cases/${caseData.id}`,
      metadata: { caseId: caseData.id, status: newStatus },
      language,
    });

    return result;
  } catch (error) {
    logger.error("Failed to send case status notification:", {
      error: error.message,
      userId,
      email,
      caseId: caseData.id,
    });

    if (notificationLog) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          sent: false,
          error: error.message,
        },
      });
    }

    return { success: false, error: error.message };
  }
};

/**
 * Send new comment notification (Email + Web)
 */
export const sendCommentNotification = async (
  userId,
  email,
  caseData,
  comment,
  commenterName,
  language = "en"
) => {
  const notificationLog = await logNotification({
    userId,
    type: "email",
    purpose: "comment_added",
    recipient: email,
    templateUsed: "comment",
    language,
    subject: `New Comment on Case ${caseData.caseNumber}`,
    metadata: { caseId: caseData.id, commentId: comment.id },
  });

  try {
    // Send email
    const result = await sendNewCommentEmail(
      email,
      caseData,
      comment,
      commenterName,
      language
    );

    if (notificationLog) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          sent: result.success,
          sentAt: result.success ? new Date() : null,
          error: result.success ? null : result.error,
          messageId: result.messageId,
        },
      });
    }

    // Create web notification
    await createWebNotification({
      userId,
      purpose: "comment_added",
      title:
        language === "ar"
          ? `تعليق جديد على الحالة ${caseData.caseNumber}`
          : `New Comment on Case ${caseData.caseNumber}`,
      body:
        language === "ar"
          ? `${commenterName} أضاف تعليقاً جديداً`
          : `${commenterName} added a new comment`,
      actionUrl: `/cases/${caseData.id}#comments`,
      metadata: { caseId: caseData.id, commentId: comment.id },
      language,
    });

    return result;
  } catch (error) {
    logger.error("Failed to send comment notification:", {
      error: error.message,
      userId,
      email,
      caseId: caseData.id,
    });

    if (notificationLog) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          sent: false,
          error: error.message,
        },
      });
    }

    return { success: false, error: error.message };
  }
};

/**
 * Send payment verified/rejected notification (Email + Web)
 */
export const sendPaymentNotification = async (
  userId,
  email,
  paymentData,
  isVerified,
  language = "en"
) => {
  const purpose = isVerified ? "payment_verified" : "payment_rejected";

  const notificationLog = await logNotification({
    userId,
    type: "email",
    purpose,
    recipient: email,
    templateUsed: "payment_receipt",
    language,
    subject: `Payment ${isVerified ? "Verified" : "Rejected"} - Case ${paymentData.case?.caseNumber}`,
    metadata: {
      paymentId: paymentData.id,
      caseId: paymentData.caseId,
      isVerified,
    },
  });

  try {
    // Send email
    const result = await sendPaymentReceiptEmail(email, paymentData, language);

    if (notificationLog) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          sent: result.success,
          sentAt: result.success ? new Date() : null,
          error: result.success ? null : result.error,
          messageId: result.messageId,
        },
      });
    }

    // Create web notification
    await createWebNotification({
      userId,
      purpose,
      title:
        language === "ar"
          ? `الدفع ${isVerified ? "تم التحقق منه" : "مرفوض"}`
          : `Payment ${isVerified ? "Verified" : "Rejected"}`,
      body:
        language === "ar"
          ? `دفعة بقيمة ${paymentData.amount} SAR ${isVerified ? "تم التحقق منها" : "تم رفضها"}`
          : `Payment of ${paymentData.amount} SAR ${isVerified ? "verified" : "rejected"}`,
      actionUrl: `/cases/${paymentData.caseId}/payments`,
      metadata: {
        paymentId: paymentData.id,
        caseId: paymentData.caseId,
        isVerified,
      },
      language,
    });

    return result;
  } catch (error) {
    logger.error("Failed to send payment notification:", {
      error: error.message,
      userId,
      email,
      paymentId: paymentData.id,
    });

    if (notificationLog) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          sent: false,
          error: error.message,
        },
      });
    }

    return { success: false, error: error.message };
  }
};

/**
 * Send case submission notification (to designers - Email only)
 */
export const sendCaseSubmissionNotification = async (
  designerUserId,
  designerEmail,
  caseData,
  designerName,
  language = "en"
) => {
  const notificationLog = await logNotification({
    userId: designerUserId,
    type: "email",
    purpose: "case_submitted",
    recipient: designerEmail,
    templateUsed: "case_submission",
    language,
    subject: `New Case Submission - ${caseData.caseNumber}`,
    metadata: { caseId: caseData.id },
  });

  try {
    const result = await sendCaseSubmissionEmail(
      designerEmail,
      caseData,
      designerName,
      language
    );

    if (notificationLog) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          sent: result.success,
          sentAt: result.success ? new Date() : null,
          error: result.success ? null : result.error,
          messageId: result.messageId,
        },
      });
    }

    return result;
  } catch (error) {
    logger.error("Failed to send case submission notification:", {
      error: error.message,
      designerUserId,
      designerEmail,
      caseId: caseData.id,
    });

    if (notificationLog) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          sent: false,
          error: error.message,
        },
      });
    }

    return { success: false, error: error.message };
  }
};

// ===================================================================
// QUERY FUNCTIONS
// ===================================================================

/**
 * Get user's notification history
 */
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const notifications = await prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return notifications;
  } catch (error) {
    logger.error("Failed to get user notifications:", {
      error: error.message,
      userId,
    });
    return [];
  }
};

/**
 * Get unread notifications count for user
 */
export const getUnreadNotificationsCount = async (userId) => {
  try {
    const count = await prisma.notificationLog.count({
      where: {
        userId,
        type: "web",
        isRead: false,
      },
    });
    return count;
  } catch (error) {
    logger.error("Failed to get unread notifications count:", {
      error: error.message,
      userId,
    });
    return 0;
  }
};

/**
 * Cleanup old notifications (older than 90 days)
 */
export const cleanupOldNotifications = async () => {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const result = await prisma.notificationLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    logger.info(`Cleaned up ${result.count} old notifications`);
    return result.count;
  } catch (error) {
    logger.error("Failed to cleanup old notifications:", {
      error: error.message,
    });
    return 0;
  }
};

export default {
  createWebNotification,
  sendOtpNotification,
  sendWelcomeNotification,
  sendCaseStatusNotification,
  sendCommentNotification,
  sendPaymentNotification,
  sendCaseSubmissionNotification,
  getUserNotifications,
  getUnreadNotificationsCount,
  cleanupOldNotifications,
};
