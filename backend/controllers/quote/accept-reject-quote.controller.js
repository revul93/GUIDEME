import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

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

    await prisma.caseQuote.update({
      where: { id: parseInt(id) },
      data: {
        isAccepted: true,
        acceptedAt: new Date(),
      },
    });

    await prisma.case.update({
      where: { id: quote.caseId },
      data: { status: "quote_accepted" },
    });

    await prisma.caseStatusHistory.create({
      data: {
        caseId: quote.caseId,
        fromStatus: "quote_sent",
        toStatus: "quote_accepted",
        changedBy: "client",
        changedById: null,
        notes: "Quote accepted by doctor",
      },
    });

    res.status(200).json({
      success: true,
      message:
        "Quote accepted successfully. Please proceed with production payment",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "acceptQuote",
      userId: req.user?.id,
      caseId: req.params?.id,
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
        case: true,
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
        message: "Accepted quote cannot be rejected",
      });
    }

    await prisma.caseQuote.update({
      where: { id: parseInt(id) },
      data: {
        isRejected: true,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason.trim(),
      },
    });

    const newStatus = requestRevision ? "quote_rejected" : "cancelled";

    await prisma.case.update({
      where: { id: quote.caseId },
      data: { status: newStatus },
    });

    await prisma.caseStatusHistory.create({
      data: {
        caseId: quote.caseId,
        fromStatus: "quote_sent",
        toStatus: newStatus,
        changedBy: "client",
        changedById: null,
        notes: requestRevision
          ? `Quote rejected. Reason: ${rejectionReason.trim()}. Revision requested`
          : `Quote rejected and case cancelled. Reason: ${rejectionReason.trim()}`,
      },
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
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to reject quote",
    });
  }
};
