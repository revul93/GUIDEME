import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

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
        case: true,
      },
    });

    if (!payment) {
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

    await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        refundRequestedAt: new Date(),
        refundReason: refundReason.trim(),
      },
    });

    await prisma.case.update({
      where: { id: payment.caseId },
      data: { status: "refund_requested" },
    });

    await prisma.caseStatusHistory.create({
      data: {
        caseId: payment.caseId,
        fromStatus: payment.case.status,
        toStatus: "refund_requested",
        changedBy: "client",
        changedById: null,
        notes: `Refund requested. Reason: ${refundReason.trim()}`,
      },
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
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to request refund",
    });
  }
};

export const approveRefund = async (req, res) => {
  try {
    if (req.user.role !== "designer" || !req.user.designerProfile?.isAdmin) {
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
        case: true,
      },
    });

    if (!payment) {
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

    await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        isRefunded: true,
        refundAmount,
        refundedAt: new Date(),
        refundNotes,
      },
    });

    await prisma.case.update({
      where: { id: payment.caseId },
      data: { status: "refunded" },
    });

    await prisma.caseStatusHistory.create({
      data: {
        caseId: payment.caseId,
        fromStatus: "refund_requested",
        toStatus: "refunded",
        changedBy: "designer",
        changedById: req.user.designerProfile.id,
        notes: `Refund approved. Amount: SAR ${refundAmount}. ${refundNotes || ""}`,
      },
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
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to approve refund request",
    });
  }
};

export const rejectRefund = async (req, res) => {
  try {
    if (req.user.role !== "designer" || !req.user.designerProfile?.isAdmin) {
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
        case: true,
      },
    });

    if (!payment) {
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

    await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        refundRequestedAt: null,
        refundReason: null,
        refundNotes: `Refund rejected. Reason: ${rejectionReason.trim()}`,
      },
    });

    await prisma.case.update({
      where: { id: payment.caseId },
      data: {
        status:
          payment.case.status === "refund_requested"
            ? "in_production"
            : payment.case.status,
      },
    });

    await prisma.caseStatusHistory.create({
      data: {
        caseId: payment.caseId,
        fromStatus: "refund_requested",
        toStatus: "in_production",
        changedBy: "designer",
        changedById: req.user.designerProfile.id,
        notes: `Refund request rejected. Reason: ${rejectionReason.trim()}`,
      },
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
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to reject refund request",
    });
  }
};
