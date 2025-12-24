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
    });

    if (!caseData) {
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

    if (caseData.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Study payment can only be uploaded for draft cases",
      });
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        caseId,
        paymentType: "study_fee",
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

    await prisma.case.update({
      where: { id: caseId },
      data: {
        status: "pending_study_payment",
        isDraft: false,
      },
    });

    await prisma.caseStatusHistory.create({
      data: {
        caseId,
        fromStatus: "draft",
        toStatus: "pending_study_payment",
        changedBy: "client",
        changedById: null,
        notes: "Study payment proof uploaded, awaiting verification",
      },
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
      caseId: req.params?.id,
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
    });

    if (!caseData) {
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
    });

    if (!quote || quote.caseId !== caseId) {
      return res.status(404).json({
        success: false,
        message: "Quote not found or doesn't belong to this case",
      });
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        caseId,
        paymentType: "production_fee",
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

    await prisma.case.update({
      where: { id: caseId },
      data: { status: "pending_production_payment" },
    });

    await prisma.caseStatusHistory.create({
      data: {
        caseId,
        fromStatus: "quote_accepted",
        toStatus: "pending_production_payment",
        changedBy: "client",
        changedById: null,
        notes: "Production payment proof uploaded, awaiting verification",
      },
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
      controller: "uplosdProductionPaymentProof",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to upload payment proof",
    });
  }
};
