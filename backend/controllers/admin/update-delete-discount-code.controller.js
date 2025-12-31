import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import { validateCodeFormat } from "../../services/discount.service.js";

/**
 * Update discount code (Admin only)
 */
export const updateDiscountCode = async (req, res) => {
  try {
    // Only admins can update discount codes
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update discount codes",
      });
    }

    const { id } = req.params;
    const discountCodeId = parseInt(id);

    const {
      code,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      maxUsesTotal,
      maxUsesPerClient,
      validFrom,
      validUntil,
      isActive,
      description,
      internalNotes,
    } = req.body;

    // Get existing code
    const existingCode = await prisma.discountCode.findFirst({
      where: {
        id: discountCodeId,
        deletedAt: null,
      },
    });

    if (!existingCode) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found",
      });
    }

    // Validation
    const errors = [];
    const updateData = {};

    // Validate and update code if provided
    if (code && code !== existingCode.code) {
      const codeValidation = validateCodeFormat(code);
      if (!codeValidation.valid) {
        errors.push(codeValidation.error);
      } else {
        // Check if new code already exists
        const codeExists = await prisma.discountCode.findFirst({
          where: {
            code: {
              equals: codeValidation.code,
              mode: "insensitive",
            },
            id: { not: discountCodeId },
            deletedAt: null,
          },
        });

        if (codeExists) {
          errors.push("A discount code with this code already exists");
        } else {
          updateData.code = codeValidation.code;
        }
      }
    }

    // Validate and update discount type
    if (discountType) {
      if (!["percentage", "fixed"].includes(discountType)) {
        errors.push("Discount type must be 'percentage' or 'fixed'");
      } else {
        updateData.discountType = discountType;
      }
    }

    // Validate and update discount value
    if (discountValue !== undefined) {
      if (discountValue <= 0) {
        errors.push("Discount value must be greater than 0");
      } else {
        const type = discountType || existingCode.discountType;
        if (type === "percentage" && discountValue > 100) {
          errors.push("Percentage discount cannot exceed 100%");
        }
        updateData.discountValue = discountValue;
      }
    }

    // Update max discount amount
    if (maxDiscountAmount !== undefined) {
      updateData.maxDiscountAmount = maxDiscountAmount || null;
    }

    // Update min order amount
    if (minOrderAmount !== undefined) {
      if (minOrderAmount < 0) {
        errors.push("Minimum order amount cannot be negative");
      } else {
        updateData.minOrderAmount = minOrderAmount;
      }
    }

    // Update max uses
    if (maxUsesTotal !== undefined) {
      if (maxUsesTotal !== null && maxUsesTotal <= 0) {
        errors.push("Maximum total uses must be greater than 0");
      } else {
        updateData.maxUsesTotal = maxUsesTotal;
      }
    }

    if (maxUsesPerClient !== undefined) {
      if (maxUsesPerClient !== null && maxUsesPerClient <= 0) {
        errors.push("Maximum uses per client must be greater than 0");
      } else {
        updateData.maxUsesPerClient = maxUsesPerClient;
      }
    }

    // Validate and update dates
    if (validFrom || validUntil) {
      const fromDate = validFrom
        ? new Date(validFrom)
        : existingCode.validFrom;
      const untilDate = validUntil
        ? new Date(validUntil)
        : existingCode.validUntil;

      if (fromDate >= untilDate) {
        errors.push("Valid until date must be after valid from date");
      } else {
        if (validFrom) updateData.validFrom = fromDate;
        if (validUntil) updateData.validUntil = untilDate;
      }
    }

    // Update active status
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    // Update description and notes
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes?.trim() || null;
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Update discount code
    const updatedCode = await prisma.discountCode.update({
      where: { id: discountCodeId },
      data: updateData,
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    logger.info("Discount code updated", {
      code: updatedCode.code,
      updatedBy: req.user.id,
      changes: Object.keys(updateData),
    });

    res.json({
      success: true,
      message: "Discount code updated successfully",
      data: {
        discountCode: {
          id: updatedCode.id,
          code: updatedCode.code,
          discountType: updatedCode.discountType,
          discountValue: updatedCode.discountValue,
          maxDiscountAmount: updatedCode.maxDiscountAmount,
          minOrderAmount: updatedCode.minOrderAmount,
          maxUsesTotal: updatedCode.maxUsesTotal,
          maxUsesPerClient: updatedCode.maxUsesPerClient,
          validFrom: updatedCode.validFrom,
          validUntil: updatedCode.validUntil,
          isActive: updatedCode.isActive,
          timesUsed: updatedCode.timesUsed,
          description: updatedCode.description,
          updatedAt: updatedCode.updatedAt,
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "updateDiscountCode",
      userId: req.user?.id,
      discountCodeId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to update discount code",
    });
  }
};

/**
 * Delete discount code (Admin only)
 * Soft delete - sets deletedAt timestamp
 */
export const deleteDiscountCode = async (req, res) => {
  try {
    // Only admins can delete discount codes
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete discount codes",
      });
    }

    const { id } = req.params;
    const discountCodeId = parseInt(id);

    // Check if code exists
    const existingCode = await prisma.discountCode.findFirst({
      where: {
        id: discountCodeId,
        deletedAt: null,
      },
    });

    if (!existingCode) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found",
      });
    }

    // Soft delete (set deletedAt)
    await prisma.discountCode.update({
      where: { id: discountCodeId },
      data: {
        deletedAt: new Date(),
        isActive: false, // Also deactivate
      },
    });

    logger.info("Discount code deleted", {
      code: existingCode.code,
      deletedBy: req.user.id,
    });

    res.json({
      success: true,
      message: "Discount code deleted successfully",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "deleteDiscountCode",
      userId: req.user?.id,
      discountCodeId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to delete discount code",
    });
  }
};
