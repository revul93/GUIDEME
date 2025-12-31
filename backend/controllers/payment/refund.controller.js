import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import { createWebNotification } from "../../services/notification.service.js";

export const requestRefund = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can request refunds",
      });
    }

    const { id } = req.params;
    const { refundReason } = req.body;

    if (!refundReason || refundReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Refund reason is required",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        case: {
          include: {
            clientProfile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!payment || payment.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.case.clientProfileId !== req.user.profile.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (payment.paymentType === "study_fee") {
      return res.status(400).json({
        success: false,
        message: "Study fee is non-refundable",
      });
    }

    if (payment.status !== "verified") {
      return res.status(400).json({
        success: false,
        message: "Only verified payments can be refunded",
      });
    }

    if (payment.isRefunded) {
      return res.status(400).json({
        success: false,
        message: "Payment has already been refunded",
      });
    }

    if (payment.refundRequestedAt) {
      return res.status(400).json({
        success: false,
        message: "Refund request already submitted. Awaiting admin review",
      });
    }

    // Update payment with refund request - FIXED: use correct field names
    await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        refundRequestedAt: new Date(),
        refundReason: refundReason.trim(),
      },
    });

    // Update case status
    await prisma.case.update({
      where: { id: payment.caseId },
      data: { status: "refund_requested" },
    });

    // Create status history - FIXED: correct field names
    await prisma.caseStatusHistory.create({
      data: {
        caseId: payment.caseId,
        fromStatus: payment.case.status,
        toStatus: "refund_requested",
        changedBy: "client",
        changedByClientId: req.user.profile.id, // FIXED
        notes: `Refund requested. Reason: ${refundReason.trim()}`,
      },
    });

    // Notify admin (web notification)
    // Get all admin designers
    const admins = await prisma.designerProfile.findMany({
      where: { isAdmin: true, deletedAt: null },
      include: { user: true },
    });

    for (const admin of admins) {
      createWebNotification({
        userId: admin.user.id,
        purpose: "payment_reminder",
        title: "Refund Request",
        body: `Client ${payment.case.clientProfile.user.email} requested refund for payment ${payment.paymentNumber}`,
        actionUrl: `/payments/${payment.id}`,
        metadata: { paymentId: payment.id, caseId: payment.caseId },
        language: admin.user.preferredLanguage || "en",
      }).catch((error) => {
        logger.error("Failed to notify admin:", {
          error: error.message,
          adminId: admin.user.id,
        });
      });
    }

    logger.info("Refund requested", {
      paymentId: payment.id,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Refund request submitted successfully. Awaiting admin review",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "requestRefund",
      userId: req.user?.id,
      paymentId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to request refund",
    });
  }
};

export const approveRefund = async (req, res) => {
  try {
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can approve refunds",
      });
    }

    const { id } = req.params;
    const { refundAmount, refundNotes } = req.body;

    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid refund amount is required",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        case: {
          include: {
            clientProfile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!payment || payment.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (!payment.refundRequestedAt) {
      return res.status(400).json({
        success: false,
        message: "No refund request found for this payment",
      });
    }

    if (payment.isRefunded) {
      return res.status(400).json({
        success: false,
        message: "Payment has already been refunded",
      });
    }

    if (refundAmount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: "Refund amount cannot exceed payment amount",
      });
    }

    // Update payment - FIXED: use correct field names
    await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        isRefunded: true,
        refundedAmount: refundAmount,
        refundedAt: new Date(),
        refundNotes,
        status: "refunded",
      },
    });

    // Update case status
    await prisma.case.update({
      where: { id: payment.caseId },
      data: { status: "refunded" },
    });

    // Create status history - FIXED: correct field names
    await prisma.caseStatusHistory.create({
      data: {
        caseId: payment.caseId,
        fromStatus: "refund_requested",
        toStatus: "refunded",
        changedBy: "designer",
        changedByDesignerId: req.user.profile.id, // FIXED
        notes: `Refund approved. Amount: SAR ${refundAmount}. ${refundNotes || ""}`,
      },
    });

    // Send notification to client (email + web)
    const clientUser = payment.case.clientProfile.user;

    createWebNotification({
      userId: clientUser.id,
      purpose: "payment_verified",
      title:
        clientUser.preferredLanguage === "ar"
          ? "تمت الموافقة على استرداد الأموال"
          : "Refund Approved",
      body:
        clientUser.preferredLanguage === "ar"
          ? `تمت الموافقة على استرداد مبلغ ${refundAmount} ريال`
          : `Refund of SAR ${refundAmount} approved`,
      actionUrl: `/cases/${payment.caseId}/payments`,
      metadata: { paymentId: payment.id, refundAmount },
      language: clientUser.preferredLanguage,
    }).catch((error) => {
      logger.error("Failed to send notification:", {
        error: error.message,
        paymentId: payment.id,
      });
    });

    logger.info("Refund approved", {
      paymentId: payment.id,
      refundAmount,
      approvedBy: req.user.profile.id,
    });

    res.status(200).json({
      success: true,
      message: "Refund approved successfully",
      data: {
        refundAmount,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "approveRefund",
      userId: req.user?.id,
      paymentId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to approve refund request",
    });
  }
};

export const rejectRefund = async (req, res) => {
  try {
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can reject refunds",
      });
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        case: {
          include: {
            clientProfile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!payment || payment.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (!payment.refundRequestedAt) {
      return res.status(400).json({
        success: false,
        message: "No refund request found for this payment",
      });
    }

    if (payment.isRefunded) {
      return res.status(400).json({
        success: false,
        message: "Payment has already been refunded",
      });
    }

    // Clear refund request - FIXED: use correct field names
    await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        refundRequestedAt: null,
        refundReason: null,
        refundNotes: `Refund rejected. Reason: ${rejectionReason.trim()}`,
      },
    });

    // Revert case status
    await prisma.case.update({
      where: { id: payment.caseId },
      data: {
        status:
          payment.case.status === "refund_requested"
            ? "in_production"
            : payment.case.status,
      },
    });

    // Create status history - FIXED: correct field names
    await prisma.caseStatusHistory.create({
      data: {
        caseId: payment.caseId,
        fromStatus: "refund_requested",
        toStatus: "in_production",
        changedBy: "designer",
        changedByDesignerId: req.user.profile.id, // FIXED
        notes: `Refund request rejected. Reason: ${rejectionReason.trim()}`,
      },
    });

    // Send notification to client (email + web)
    const clientUser = payment.case.clientProfile.user;

    createWebNotification({
      userId: clientUser.id,
      purpose: "payment_rejected",
      title:
        clientUser.preferredLanguage === "ar"
          ? "تم رفض طلب الاسترداد"
          : "Refund Request Rejected",
      body:
        clientUser.preferredLanguage === "ar"
          ? `تم رفض طلب الاسترداد: ${rejectionReason.trim()}`
          : `Refund request rejected: ${rejectionReason.trim()}`,
      actionUrl: `/cases/${payment.caseId}/payments`,
      metadata: { paymentId: payment.id },
      language: clientUser.preferredLanguage,
    }).catch((error) => {
      logger.error("Failed to send notification:", {
        error: error.message,
        paymentId: payment.id,
      });
    });

    logger.info("Refund rejected", {
      paymentId: payment.id,
      rejectedBy: req.user.profile.id,
    });

    res.status(200).json({
      success: true,
      message: "Refund request rejected",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "rejectRefund",
      userId: req.user?.id,
      paymentId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to reject refund request",
    });
  }
};
