import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const createQuote = async (req, res) => {
  try {
    if (req.user.role !== "designer" || !req.user.designerProfile?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create quotes",
      });
    }

    const { caseId } = req.body;
    const {
      studyFee = 100,
      designFee = 0,
      productionFee = 0,
      deliveryFee = 0,
      discountAmount = 0,
      discountReason,
      vatRate = 15,
      internalNotes,
      notes,
      validUntil,
    } = req.body;

    if (!caseId) {
      return res.status(400).json({
        success: false,
        message: "Case ID is required",
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

    if (caseData.status !== "study_completed") {
      return res.status(400).json({
        success: false,
        message: "Case must be in study_completed status to create a quote",
      });
    }

    const subtotal =
      studyFee + designFee + productionFee + deliveryFee - discountAmount;
    const vatAmount = (subtotal * vatRate) / 100;
    const totalAmount = subtotal + vatAmount;

    const quoteNumber = `QUOTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const defaultValidUntil = new Date();
    defaultValidUntil.setDate(defaultValidUntil.getDate() + 30);

    const quote = await prisma.caseQuote.create({
      data: {
        quoteNumber,
        caseId,
        studyFee,
        designFee,
        productionFee,
        deliveryFee,
        subtotal,
        discountAmount,
        discountReason,
        vatRate,
        vatAmount,
        totalAmount,
        validUntil: validUntil ? new Date(validUntil) : defaultValidUntil,
        internalNotes,
        notes,
        createdById: req.user.designerProfile.id,
        isSent: true,
        sentAt: new Date(),
      },
      include: {
        case: {
          include: {
            clientProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await prisma.case.update({
      where: { id: caseId },
      data: { status: "quote_sent" },
    });

    await prisma.caseStatusHistory.create({
      data: {
        caseId,
        fromStatus: "study_completed",
        toStatus: "quote_sent",
        changedBy: "designer",
        changedById: req.user.designerProfile.id,
        notes: "Quote created and sent",
      },
    });

    res.status(201).json({
      success: true,
      message: "Quote created successfully",
      data: {
        quote,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "createQuote",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to create quote",
    });
  }
};
