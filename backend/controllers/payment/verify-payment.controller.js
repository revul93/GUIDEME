import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import { sendPaymentNotification } from "../../services/notification.service.js";

export const verifyPayment = async (req, res) => {
  try {
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can verify payments",
      });
    }

    const { id } = req.params;
    const { verificationNotes } = req.body;

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

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending payments can be verified",
      });
    }

    // Determine new case status
    let newCaseStatus;
    let statusNote;

    if (payment.paymentType === "study_fee") {
      newCaseStatus = "submitted";
      statusNote = "Study payment verified, case submitted";
    } else if (payment.paymentType === "production_fee") {
      newCaseStatus = "in_production";
      statusNote = "Production payment verified, case in production";
    }

    // Update payment status - FIXED: correct Prisma syntax
    await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        status: "verified",
        isVerified: true,
        verifiedAt: new Date(),
        verifiedById: req.user.profile.id, // FIXED: direct field instead of connect
        notes: verificationNotes
          ? `${payment.notes || ""}\nVerification: ${verificationNotes}`.trim()
          : payment.notes,
      },
    });

    // Update case status
    await prisma.case.update({
      where: { id: payment.caseId },
      data: { status: newCaseStatus },
    });

    // Create status history - FIXED: correct field names
    await prisma.caseStatusHistory.create({
      data: {
        caseId: payment.caseId,
        fromStatus: payment.case.status,
        toStatus: newCaseStatus,
        changedBy: "designer",
        changedByDesignerId: req.user.profile.id, // FIXED
        notes: statusNote,
      },
    });

    // Send notification (email + web)
    const clientUser = payment.case.clientProfile.user;
    sendPaymentNotification(
      clientUser.id,
      clientUser.email,
      { ...payment, case: payment.case },
      true, // isVerified
      clientUser.preferredLanguage
    ).catch((error) => {
      logger.error("Failed to send payment notification:", {
        error: error.message,
        paymentId: payment.id,
      });
    });

    logger.info("Payment verified:", {
      paymentId: payment.id,
      paymentType: payment.paymentType,
      caseId: payment.caseId,
      verifiedBy: req.user.profile.id,
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    logger.error("Verify payment error:", {
      error: error.message,
      stack: error.stack,
      paymentId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can reject payments",
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

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending payments can be rejected",
      });
    }

    // Determine case status to revert to
    let newCaseStatus;

    if (payment.paymentType === "study_fee") {
      // If study payment rejected, case goes back to submitted (no payment)
      newCaseStatus = "submitted";
    } else if (payment.paymentType === "production_fee") {
      newCaseStatus = "quote_accepted";
    }

    // Update payment - FIXED: correct field names
    await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        status: "failed",
        rejectionReason: rejectionReason.trim(),
        verifiedById: req.user.profile.id, // FIXED
        verifiedAt: new Date(),
      },
    });

    // Update case status
    await prisma.case.update({
      where: { id: payment.caseId },
      data: { status: newCaseStatus },
    });

    // Create status history - FIXED: correct field names
    await prisma.caseStatusHistory.create({
      data: {
        caseId: payment.caseId,
        fromStatus: payment.case.status,
        toStatus: newCaseStatus,
        changedBy: "designer",
        changedByDesignerId: req.user.profile.id, // FIXED
        notes: `Payment rejected. Reason: ${rejectionReason.trim()}`,
      },
    });

    // Send notification (email + web)
    const clientUser = payment.case.clientProfile.user;
    sendPaymentNotification(
      clientUser.id,
      clientUser.email,
      { ...payment, case: payment.case },
      false, // isVerified = false (rejected)
      clientUser.preferredLanguage
    ).catch((error) => {
      logger.error("Failed to send payment notification:", {
        error: error.message,
        paymentId: payment.id,
      });
    });

    logger.info("Payment rejected:", {
      paymentId: payment.id,
      reason: rejectionReason.trim(),
      rejectedBy: req.user.profile.id,
    });

    res.status(200).json({
      success: true,
      message: "Payment rejected. Client will need to upload new payment proof",
    });
  } catch (error) {
    logger.error("Reject payment error:", {
      error: error.message,
      stack: error.stack,
      paymentId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({
      success: false,
      message: "Failed to reject payment",
    });
  }
};
