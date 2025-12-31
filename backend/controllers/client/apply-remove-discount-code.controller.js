import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import {
  validateDiscountCode,
  calculateDiscount,
} from "../../services/discount.service.js";

/**
 * Apply discount code to quote (Client)
 * Actually applies the discount and updates quote totals
 */
export const applyDiscountCode = async (req, res) => {
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

    // Cannot apply discount to accepted quote
    if (quote.isAccepted) {
      return res.status(400).json({
        success: false,
        message: "Cannot apply discount to an already accepted quote",
      });
    }

    // Cannot apply discount to rejected quote
    if (quote.isRejected) {
      return res.status(400).json({
        success: false,
        message: "Cannot apply discount to a rejected quote",
      });
    }

    // Check if quote already has a discount code
    if (quote.discountCodeId) {
      return res.status(400).json({
        success: false,
        message:
          "This quote already has a discount code. Remove it first to apply a different code",
      });
    }

    // Calculate order amount (exclude study fee)
    const orderAmount =
      quote.productionFee + quote.designFee + quote.deliveryFee;

    // Validate code
    const validation = await validateDiscountCode(
      code,
      quote.case.clientProfileId,
      orderAmount
    );

    if (!validation.valid) {
      logger.warn("Discount code application failed - validation", {
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
    const afterDiscount = orderAmount - discountAmount;

    // Recalculate totals
    const subtotal = quote.studyFee + orderAmount;
    const vatAmount = afterDiscount * (quote.vatRate / 100);
    const totalAmount = quote.studyFee + afterDiscount + vatAmount;

    // Update quote with discount
    const updatedQuote = await prisma.caseQuote.update({
      where: { id: parseInt(quoteId) },
      data: {
        discountCodeId: validation.discountCode.id,
        discountAmount,
        discountReason: `Discount code: ${validation.discountCode.code}`,
        subtotal,
        vatAmount,
        totalAmount,
      },
      include: {
        discountCode: true,
        case: {
          select: {
            caseNumber: true,
          },
        },
      },
    });

    logger.info("Discount code applied to quote", {
      code: validation.discountCode.code,
      quoteId,
      discountAmount,
      clientId: quote.case.clientProfileId,
    });

    res.json({
      success: true,
      message: "Discount code applied successfully",
      data: {
        quote: {
          id: updatedQuote.id,
          quoteNumber: updatedQuote.quoteNumber,
          caseNumber: updatedQuote.case.caseNumber,
          studyFee: updatedQuote.studyFee,
          designFee: updatedQuote.designFee,
          productionFee: updatedQuote.productionFee,
          deliveryFee: updatedQuote.deliveryFee,
          subtotal: updatedQuote.subtotal,
          discountAmount: updatedQuote.discountAmount,
          discountCode: {
            code: updatedQuote.discountCode.code,
            type: updatedQuote.discountCode.discountType,
            value: updatedQuote.discountCode.discountValue,
          },
          vatRate: updatedQuote.vatRate,
          vatAmount: updatedQuote.vatAmount,
          totalAmount: updatedQuote.totalAmount,
        },
        savings: discountAmount,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "applyDiscountCode",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to apply discount code",
    });
  }
};

/**
 * Remove discount code from quote (Client)
 */
export const removeDiscountCode = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = await prisma.caseQuote.findFirst({
      where: {
        id: parseInt(quoteId),
      },
      include: {
        case: true,
        discountCode: true,
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

    // Cannot remove discount from accepted quote
    if (quote.isAccepted) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove discount from an already accepted quote",
      });
    }

    if (!quote.discountCodeId) {
      return res.status(400).json({
        success: false,
        message: "This quote does not have a discount code applied",
      });
    }

    // Recalculate totals without discount
    const orderAmount =
      quote.productionFee + quote.designFee + quote.deliveryFee;
    const subtotal = quote.studyFee + orderAmount;
    const vatAmount = orderAmount * (quote.vatRate / 100);
    const totalAmount = quote.studyFee + orderAmount + vatAmount;

    // Remove discount from quote
    const updatedQuote = await prisma.caseQuote.update({
      where: { id: parseInt(quoteId) },
      data: {
        discountCodeId: null,
        discountAmount: 0,
        discountReason: null,
        subtotal,
        vatAmount,
        totalAmount,
      },
    });

    logger.info("Discount code removed from quote", {
      code: quote.discountCode.code,
      quoteId,
      clientId: quote.case.clientProfileId,
    });

    res.json({
      success: true,
      message: "Discount code removed successfully",
      data: {
        quote: {
          id: updatedQuote.id,
          quoteNumber: updatedQuote.quoteNumber,
          subtotal: updatedQuote.subtotal,
          vatAmount: updatedQuote.vatAmount,
          totalAmount: updatedQuote.totalAmount,
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "removeDiscountCode",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to remove discount code",
    });
  }
};
