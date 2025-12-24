import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
// import { awardPoints } from "../../utils/loyalty.js";

export const verifyPayment = async (req, res) => {
  try {
    if (req.user.role !== "designer" || !req.user.designerProfile?.isAdmin) {
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
              select: {
                id: true,
                clientType: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
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

    // Update payment status
    await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        status: "verified",
        verifiedAt: new Date(),
        verifiedBy: {
          connect: { id: req.user.designerProfile.id },
        },
      },
    });

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

    // Update case status
    await prisma.case.update({
      where: { id: payment.caseId },
      data: { status: newCaseStatus },
    });

    // Create status history
    await prisma.caseStatusHistory.create({
      data: {
        caseId: payment.caseId,
        fromStatus: payment.case.status,
        toStatus: newCaseStatus,
        changedBy: "designer",
        changedById: req.user.designerProfile.id,
        notes: statusNote,
      },
    });

    // Award loyalty points if client is a lab
    /* if (payment.case.clientProfile.clientType === "lab") {
      try {
        await awardPoints(
          payment.case.clientProfile.id,
          payment.amount,
          payment.id
        );
        logger.info("Loyalty points awarded:", {
          paymentId: payment.id,
          clientProfileId: payment.case.clientProfile.id,
          amount: payment.amount,
        });
      } catch (pointsError) {
        // Don't fail payment verification if points award fails
        logger.error("Failed to award loyalty points:", {
          error: pointsError.message,
          paymentId: payment.id,
          clientProfileId: payment.case.clientProfile.id,
        });
      }
    } */

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
      error: error.message,
    });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    if (req.user.role !== "designer" || !req.user.designerProfile?.isAdmin) {
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
        case: true,
      },
    });

    if (!payment) {
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

    await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        status: "failed",
        rejectionReason: rejectionReason.trim(),
        verifiedBy: {
          connect: { id: req.user.designerProfile.id },
        },
        verifiedAt: new Date(),
      },
    });

    let newCaseStatus;

    if (payment.paymentType === "study_fee") {
      newCaseStatus = "draft";
    } else if (payment.paymentType === "production_fee") {
      newCaseStatus = "quote_accepted";
    }

    await prisma.case.update({
      where: { id: payment.caseId },
      data: { status: newCaseStatus },
    });

    await prisma.caseStatusHistory.create({
      data: {
        caseId: payment.caseId,
        fromStatus: payment.case.status,
        toStatus: newCaseStatus,
        changedBy: "designer",
        changedById: req.user.designerProfile.id,
        notes: `Payment rejected. Reason: ${rejectionReason.trim()}`,
      },
    });

    logger.info("Payment rejected:", {
      paymentId: payment.id,
      reason: rejectionReason.trim(),
      rejectedBy: req.user.profile.id,
    });

    res.status(200).json({
      success: true,
      message: "Payment rejected. Doctor will need to upload new payment proof",
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
      error: error.message,
    });
  }
};
