import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import {
  validateDiscountCode,
  calculateDiscount,
} from "../../services/discount.service.js";

/**
 * Validate discount code (Client)
 * Returns discount preview without applying
 */
export const validateDiscountCodeForClient = async (req, res) => {
  try {
    const { code, quoteId } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Discount code is required",
      });
    }

    if (!quoteId) {
      return res.status(400).json({
        success: false,
        message: "Quote ID is required",
      });
    }

    const quote = await prisma.caseQuote.findFirst({
      where: {
        id: parseInt(quoteId),
      },
      include: {
        case: {
          include: {
            clientProfile: true,
          },
        },
      },
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    // Verify client owns this quote
    if (req.user.role === "client") {
      if (quote.case.clientProfileId !== req.user.profile.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // Check if quote already has a discount code
    if (quote.discountCodeId) {
      return res.status(400).json({
        success: false,
        message: "This quote already has a discount code applied",
      });
    }

    // Calculate order amount (production fee + design fee + delivery fee)
    // Study fee is excluded from discount
    const orderAmount =
      quote.productionFee + quote.designFee + quote.deliveryFee;

    // Validate code
    const validation = await validateDiscountCode(
      code,
      quote.case.clientProfileId,
      orderAmount
    );

    if (!validation.valid) {
      logger.info("Discount code validation failed", {
        code,
        error: validation.error,
        clientId: quote.case.clientProfileId,
      });

      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    // Calculate discount
    const discountAmount = calculateDiscount(
      validation.discountCode,
      orderAmount
    );
    const finalAmount = orderAmount - discountAmount;

    // Calculate new totals with VAT
    const vatAmount = finalAmount * (quote.vatRate / 100);
    const totalWithVat = finalAmount + vatAmount + quote.studyFee; // Study fee always added

    logger.info("Discount code validated", {
      code: validation.discountCode.code,
      clientId: quote.case.clientProfileId,
      quoteId,
      discountAmount,
    });

    res.json({
      success: true,
      message: "Discount code is valid",
      data: {
        code: validation.discountCode.code,
        discountType: validation.discountCode.discountType,
        discountValue: validation.discountCode.discountValue,
        breakdown: {
          studyFee: quote.studyFee,
          productionFee: quote.productionFee,
          designFee: quote.designFee,
          deliveryFee: quote.deliveryFee,
          subtotal: orderAmount + quote.studyFee,
          discountableAmount: orderAmount,
          discountAmount,
          afterDiscount: finalAmount,
          vatAmount,
          total: totalWithVat,
        },
        savings: discountAmount,
        message:
          validation.discountCode.discountType === "percentage"
            ? `${validation.discountCode.discountValue}% discount applied${
                validation.discountCode.maxDiscountAmount
                  ? ` (max ${validation.discountCode.maxDiscountAmount} SAR)`
                  : ""
              }`
            : `${validation.discountCode.discountValue} SAR discount applied`,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "validateDiscountCodeForClient",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to validate discount code",
    });
  }
};
