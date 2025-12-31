import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import { validateCodeFormat } from "../../services/discount.service.js";

/**
 * Create discount code (Admin only)
 */
export const createDiscountCode = async (req, res) => {
  try {
    // Only admins can create discount codes
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create discount codes",
      });
    }

    const {
      code,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount = 0,
      maxUsesTotal,
      maxUsesPerClient,
      validFrom,
      validUntil,
      description,
      internalNotes,
    } = req.body;

    // Validation
    const errors = [];

    // Validate code format
    const codeValidation = validateCodeFormat(code);
    if (!codeValidation.valid) {
      errors.push(codeValidation.error);
    }

    // Validate discount type
    if (!["percentage", "fixed"].includes(discountType)) {
      errors.push("Discount type must be 'percentage' or 'fixed'");
    }

    // Validate discount value
    if (!discountValue || discountValue <= 0) {
      errors.push("Discount value must be greater than 0");
    }

    if (discountType === "percentage") {
      if (discountValue > 100) {
        errors.push("Percentage discount cannot exceed 100%");
      }
      if (discountValue < 1) {
        errors.push("Percentage discount must be at least 1%");
      }
    }

    // Validate max discount amount (for percentage)
    if (
      discountType === "percentage" &&
      maxDiscountAmount &&
      maxDiscountAmount <= 0
    ) {
      errors.push("Maximum discount amount must be greater than 0");
    }

    // Validate min order amount
    if (minOrderAmount < 0) {
      errors.push("Minimum order amount cannot be negative");
    }

    // Validate max uses
    if (maxUsesTotal !== null && maxUsesTotal !== undefined) {
      if (maxUsesTotal <= 0) {
        errors.push("Maximum total uses must be greater than 0");
      }
    }

    if (maxUsesPerClient !== null && maxUsesPerClient !== undefined) {
      if (maxUsesPerClient <= 0) {
        errors.push("Maximum uses per client must be greater than 0");
      }
    }

    // Validate dates
    if (!validFrom || !validUntil) {
      errors.push("Valid from and valid until dates are required");
    } else {
      const fromDate = new Date(validFrom);
      const untilDate = new Date(validUntil);

      if (fromDate >= untilDate) {
        errors.push("Valid until date must be after valid from date");
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Check if code already exists
    const existingCode = await prisma.discountCode.findFirst({
      where: {
        code: {
          equals: codeValidation.code,
          mode: "insensitive",
        },
        deletedAt: null,
      },
    });

    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: "A discount code with this code already exists",
      });
    }

    // Create discount code
    const discountCode = await prisma.discountCode.create({
      data: {
        code: codeValidation.code,
        discountType,
        discountValue,
        maxDiscountAmount: maxDiscountAmount || null,
        minOrderAmount,
        maxUsesTotal: maxUsesTotal || null,
        maxUsesPerClient: maxUsesPerClient || null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        description: description?.trim() || null,
        internalNotes: internalNotes?.trim() || null,
        createdByAdminId: req.user.profile.id,
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    logger.info("Discount code created", {
      code: discountCode.code,
      type: discountCode.discountType,
      value: discountCode.discountValue,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Discount code created successfully",
      data: {
        discountCode: {
          id: discountCode.id,
          code: discountCode.code,
          discountType: discountCode.discountType,
          discountValue: discountCode.discountValue,
          maxDiscountAmount: discountCode.maxDiscountAmount,
          minOrderAmount: discountCode.minOrderAmount,
          maxUsesTotal: discountCode.maxUsesTotal,
          maxUsesPerClient: discountCode.maxUsesPerClient,
          validFrom: discountCode.validFrom,
          validUntil: discountCode.validUntil,
          isActive: discountCode.isActive,
          timesUsed: discountCode.timesUsed,
          description: discountCode.description,
          createdBy: discountCode.createdBy.name,
          createdAt: discountCode.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "createDiscountCode",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to create discount code",
    });
  }
};
