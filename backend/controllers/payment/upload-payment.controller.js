import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const uploadStudyPaymentProof = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can upload payment proof",
      });
    }

    const {
      caseId,
      amount = 100,
      paymentMethod,
      proofUrl,
      transactionId,
      transactionDate,
      notes,
    } = req.body;

    if (!caseId || !paymentMethod || !proofUrl) {
      return res.status(400).json({
        success: false,
        message: "caseId, paymentMethod, and proofUrl are required",
      });
    }

    if (amount !== 100) {
      return res.status(400).json({
        success: false,
        message: "Study fee must be SAR 100",
      });
    }

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        clientProfileId: true,
        status: true,
        submittedAt: true,
        deletedAt: true,
      },
    });

    if (!caseData || caseData.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (caseData.clientProfileId !== req.user.profile.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if case is already submitted (has submittedAt timestamp)
    if (caseData.submittedAt) {
      return res.status(400).json({
        success: false,
        message: "Study payment can only be uploaded for unsubmitted cases",
      });
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        caseId,
        paymentType: "study_fee",
        deletedAt: null,
      },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Study fee payment already exists for this case",
      });
    }

    const paymentNumber = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        caseId,
        clientProfileId: req.user.profile.id,
        paymentType: "study_fee",
        amount,
        currency: "SAR",
        paymentMethod,
        status: "pending",
        proofUrl,
        proofUploadedAt: new Date(),
        transactionId,
        transactionDate: transactionDate ? new Date(transactionDate) : null,
        notes,
        ipAddress: req.ip,
      },
    });

    // Update case status - FIXED: correct status name
    await prisma.case.update({
      where: { id: caseId },
      data: {
        status: "pending_study_payment_verification",
        submittedAt: new Date(), // Mark as submitted
      },
    });

    // Create status history - FIXED: use correct field names
    await prisma.caseStatusHistory.create({
      data: {
        caseId,
        toStatus: "pending_study_payment_verification",
        changedBy: "client",
        changedByClientId: req.user.profile.id, // FIXED
        notes: "Study payment proof uploaded, awaiting verification",
      },
    });

    logger.info("Study payment proof uploaded", {
      paymentId: payment.id,
      caseId,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message:
        "Study payment proof uploaded successfully. Awaiting admin verification",
      data: {
        payment,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "uploadStudyPaymentProof",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to upload payment proof",
    });
  }
};

export const uploadProductionPaymentProof = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can upload payment proof",
      });
    }

    const {
      caseId,
      quoteId,
      amount,
      paymentMethod,
      proofUrl,
      transactionId,
      transactionDate,
      notes,
    } = req.body;

    if (!caseId || !quoteId || !amount || !paymentMethod || !proofUrl) {
      return res.status(400).json({
        success: false,
        message:
          "caseId, quoteId, amount, paymentMethod, and proofUrl are required",
      });
    }

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        clientProfileId: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!caseData || caseData.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (caseData.clientProfileId !== req.user.profile.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (caseData.status !== "quote_accepted") {
      return res.status(400).json({
        success: false,
        message:
          "Production payment can only be uploaded after quote is accepted",
      });
    }

    const quote = await prisma.caseQuote.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        caseId: true,
        deletedAt: true,
      },
    });

    if (!quote || quote.deletedAt || quote.caseId !== caseId) {
      return res.status(404).json({
        success: false,
        message: "Quote not found or doesn't belong to this case",
      });
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        caseId,
        paymentType: "production_fee",
        deletedAt: null,
      },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Production fee payment already exists for this case",
      });
    }

    const paymentNumber = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        caseId,
        quoteId,
        clientProfileId: req.user.profile.id,
        paymentType: "production_fee",
        amount,
        currency: "SAR",
        paymentMethod,
        status: "pending",
        proofUrl,
        proofUploadedAt: new Date(),
        transactionId,
        transactionDate: transactionDate ? new Date(transactionDate) : null,
        notes,
        ipAddress: req.ip,
      },
    });

    // Update case status - FIXED: correct status name
    await prisma.case.update({
      where: { id: caseId },
      data: { status: "pending_production_payment_verification" },
    });

    // Create status history - FIXED: use correct field names
    await prisma.caseStatusHistory.create({
      data: {
        caseId,
        fromStatus: "quote_accepted",
        toStatus: "pending_production_payment_verification",
        changedBy: "client",
        changedByClientId: req.user.profile.id, // FIXED
        notes: "Production payment proof uploaded, awaiting verification",
      },
    });

    logger.info("Production payment proof uploaded", {
      paymentId: payment.id,
      caseId,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message:
        "Production payment proof uploaded successfully. Awaiting admin verification",
      data: {
        payment,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "uploadProductionPaymentProof", // FIXED typo
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to upload payment proof",
    });
  }
};
