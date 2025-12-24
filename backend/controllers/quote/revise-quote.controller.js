import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const reviseQuote = async (req, res) => {
  try {
    if (req.user.role !== "designer" || !req.user.designerProfile?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can revise quotes",
      });
    }

    const { id } = req.params;
    const {
      studyFee = 100,
      designFee,
      productionFee,
      deliveryFee,
      discountAmount = 0,
      discountReason,
      vatRate = 15,
      internalNotes,
      notes,
      validUntil,
    } = req.body;

    const existingQuote = await prisma.caseQuote.findUnique({
      where: { id: parseInt(id) },
      include: {
        case: true,
      },
    });

    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    if (!existingQuote.isRejected) {
      return res.status(400).json({
        success: false,
        message: "Only rejected quotes can be revised",
      });
    }

    const newDesignFee =
      designFee !== undefined ? designFee : existingQuote.designFee;
    const newProductionFee =
      productionFee !== undefined ? productionFee : existingQuote.productionFee;
    const newDeliveryFee =
      deliveryFee !== undefined ? deliveryFee : existingQuote.deliveryFee;

    const subtotal =
      studyFee +
      newDesignFee +
      newProductionFee +
      newDeliveryFee -
      discountAmount;
    const vatAmount = (subtotal * vatRate) / 100;
    const totalAmount = subtotal + vatAmount;

    const defaultValidUntil = new Date();
    defaultValidUntil.setDate(defaultValidUntil.getDate() + 30);

    const revisedQuote = await prisma.caseQuote.update({
      where: { id: parseInt(id) },
      data: {
        studyFee,
        designFee: newDesignFee,
        productionFee: newProductionFee,
        deliveryFee: newDeliveryFee,
        subtotal,
        discountAmount,
        discountReason,
        vatRate,
        vatAmount,
        totalAmount,
        validUntil: validUntil ? new Date(validUntil) : defaultValidUntil,
        internalNotes,
        notes,
        isRejected: false,
        rejectedAt: null,
        rejectionReason: null,
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
      where: { id: existingQuote.caseId },
      data: { status: "quote_sent" },
    });

    await prisma.caseStatusHistory.create({
      data: {
        caseId: existingQuote.caseId,
        fromStatus: "quote_rejected",
        toStatus: "quote_sent",
        changedBy: "designer",
        changedById: req.user.designerProfile.id,
        notes: "Quote revised and re-sent",
      },
    });

    res.status(200).json({
      success: true,
      message: "Quote revised successfully",
      data: {
        quote: revisedQuote,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "reviseQuote",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to revise quote",
    });
  }
};
