import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import { createWebNotification } from "../../services/notification.service.js";
import { recordDiscountUsage } from "../../services/discount.service.js";

export const acceptQuote = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can accept quotes",
      });
    }

    const { id } = req.params;

    const quote = await prisma.caseQuote.findUnique({
      where: { id: parseInt(id) },
      include: {
        case: true,
        discountCode: true, // ADD: Include discount code
      },
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    if (quote.case.clientProfileId !== req.user.profile.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (quote.isAccepted) {
      return res.status(400).json({
        success: false,
        message: "Quote has already been accepted",
      });
    }

    if (quote.isRejected) {
      return res.status(400).json({
        success: false,
        message: "Rejected quote cannot be accepted. Wait for revised quote",
      });
    }

    if (quote.validUntil && new Date() > quote.validUntil) {
      await prisma.case.update({
        where: { id: quote.caseId },
        data: { status: "cancelled" },
      });

      return res.status(400).json({
        success: false,
        message: "Quote has expired",
      });
    }

    // NEW: Record discount usage if discount code was applied
    if (quote.discountCodeId && quote.discountAmount > 0) {
      const orderAmount =
        quote.productionFee + quote.designFee + quote.deliveryFee;
      const finalAmount = orderAmount - quote.discountAmount;

      await recordDiscountUsage(
        quote.discountCodeId,
        quote.case.clientProfileId,
        quote.caseId,
        quote.id,
        orderAmount,
        quote.discountAmount,
        finalAmount
      );

      logger.info("Discount usage recorded for accepted quote", {
        quoteId: quote.id,
        discountCode: quote.discountCode.code,
        discountAmount: quote.discountAmount,
      });
    }

    // EXISTING: Update quote
    await prisma.caseQuote.update({
      where: { id: parseInt(id) },
      data: {
        isAccepted: true,
        acceptedAt: new Date(),
      },
    });

    // EXISTING: Update case status
    await prisma.case.update({
      where: { id: quote.caseId },
      data: { status: "quote_accepted" },
    });

    // EXISTING: Create status history
    await prisma.caseStatusHistory.create({
      data: {
        caseId: quote.caseId,
        fromStatus: "quote_sent",
        toStatus: "quote_accepted",
        changedBy: "client",
        changedByClientId: req.user.profile.id,
      },
    });

    logger.info("Quote accepted", {
      quoteId: quote.id,
      caseId: quote.caseId,
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: "Quote accepted successfully",
      data: {
        quote: {
          id: quote.id,
          quoteNumber: quote.quoteNumber,
          totalAmount: quote.totalAmount,
          acceptedAt: new Date(),
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "acceptQuote",
      userId: req.user?.id,
      quoteId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to accept quote",
    });
  }
};

export const rejectQuote = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can reject quotes",
      });
    }

    const { id } = req.params;
    const { rejectionReason, requestRevision = true } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const quote = await prisma.caseQuote.findUnique({
      where: { id: parseInt(id) },
      include: {
        case: {
          include: {
            clientProfile: true,
          },
        },
      },
    });

    if (!quote || quote.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    if (quote.case.clientProfileId !== req.user.profile.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (quote.isAccepted) {
      return res.status(400).json({
        success: false,
        message: "Accepted quote cannot be rejected",
      });
    }

    // Update quote
    await prisma.caseQuote.update({
      where: { id: parseInt(id) },
      data: {
        isRejected: true,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason.trim(),
      },
    });

    const newStatus = requestRevision ? "quote_rejected" : "cancelled";

    // Update case status
    await prisma.case.update({
      where: { id: quote.caseId },
      data: { status: newStatus },
    });

    // Create status history - FIXED: correct field names
    await prisma.caseStatusHistory.create({
      data: {
        caseId: quote.caseId,
        fromStatus: "quote_sent",
        toStatus: newStatus,
        changedBy: "client",
        changedByClientId: req.user.profile.id, // FIXED
        notes: requestRevision
          ? `Quote rejected. Reason: ${rejectionReason.trim()}. Revision requested`
          : `Quote rejected and case cancelled. Reason: ${rejectionReason.trim()}`,
      },
    });

    // Notify admin designers (web notification)
    const admins = await prisma.designerProfile.findMany({
      where: { isAdmin: true, deletedAt: null },
      include: { user: true },
    });

    for (const admin of admins) {
      createWebNotification({
        userId: admin.user.id,
        purpose: "quote_sent",
        title: `Quote Rejected - ${quote.case.caseNumber}`,
        body: requestRevision
          ? `Client rejected quote. Revision requested: ${rejectionReason.trim()}`
          : `Client rejected quote and cancelled case`,
        actionUrl: `/cases/${quote.caseId}/quotes/${quote.id}`,
        metadata: { quoteId: quote.id, caseId: quote.caseId, requestRevision },
        language: admin.user.preferredLanguage || "en",
      }).catch((error) => {
        logger.error("Failed to notify admin:", {
          error: error.message,
          adminId: admin.user.id,
        });
      });
    }

    logger.info("Quote rejected", {
      quoteId: quote.id,
      caseId: quote.caseId,
      requestRevision,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: requestRevision
        ? "Quote rejected. Admin will send a revised quote"
        : "Quote rejected and case cancelled",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "rejectQuote",
      userId: req.user?.id,
      quoteId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to reject quote",
    });
  }
};
