import prisma from "../config/db.js";
import logger from "../utils/logger.js";

/**
 * Discount Service
 * Centralized logic for discount code validation and calculation
 */

/**
 * Validate discount code
 * Checks existence, active status, dates, and conditions
 */
export const validateDiscountCode = async (
  code,
  clientProfileId,
  orderAmount
) => {
  try {
    // Find code (case insensitive)
    const discountCode = await prisma.discountCode.findFirst({
      where: {
        code: {
          equals: code.toUpperCase(),
          mode: "insensitive",
        },
        deletedAt: null,
      },
    });

    if (!discountCode) {
      return {
        valid: false,
        error: "Invalid discount code",
      };
    }

    // Check if active
    if (!discountCode.isActive) {
      return {
        valid: false,
        error: "This discount code is no longer active",
      };
    }

    // Check validity dates
    const now = new Date();
    if (now < discountCode.validFrom) {
      return {
        valid: false,
        error: `This code is not yet valid. Valid from ${discountCode.validFrom.toLocaleDateString()}`,
      };
    }

    if (now > discountCode.validUntil) {
      return {
        valid: false,
        error: `This code has expired. Valid until ${discountCode.validUntil.toLocaleDateString()}`,
      };
    }

    // Check minimum order amount
    if (orderAmount < discountCode.minOrderAmount) {
      return {
        valid: false,
        error: `Minimum order amount is ${discountCode.minOrderAmount} SAR. Your order is ${orderAmount} SAR`,
      };
    }

    // Check total usage limit
    if (
      discountCode.maxUsesTotal !== null &&
      discountCode.timesUsed >= discountCode.maxUsesTotal
    ) {
      return {
        valid: false,
        error: "This discount code has reached its usage limit",
      };
    }

    // Check per-client usage limit
    if (discountCode.maxUsesPerClient !== null && clientProfileId) {
      const clientUsageCount = await prisma.discountUsage.count({
        where: {
          discountCodeId: discountCode.id,
          clientProfileId: clientProfileId,
        },
      });

      if (clientUsageCount >= discountCode.maxUsesPerClient) {
        return {
          valid: false,
          error: "You have already used this discount code the maximum number of times",
        };
      }
    }

    // All validations passed
    return {
      valid: true,
      discountCode,
    };
  } catch (error) {
    logger.error("Error validating discount code:", {
      error: error.message,
      code,
    });
    return {
      valid: false,
      error: "Failed to validate discount code",
    };
  }
};

/**
 * Calculate discount amount
 * Returns discount amount based on type (percentage or fixed)
 */
export const calculateDiscount = (discountCode, orderAmount) => {
  let discountAmount = 0;

  if (discountCode.discountType === "percentage") {
    // Calculate percentage discount
    discountAmount = orderAmount * (discountCode.discountValue / 100);

    // Apply max discount cap if set
    if (
      discountCode.maxDiscountAmount &&
      discountAmount > discountCode.maxDiscountAmount
    ) {
      discountAmount = discountCode.maxDiscountAmount;
    }
  } else {
    // Fixed discount
    discountAmount = discountCode.discountValue;
  }

  // Discount cannot exceed order amount
  if (discountAmount > orderAmount) {
    discountAmount = orderAmount;
  }

  // Round to 2 decimal places
  discountAmount = Math.round(discountAmount * 100) / 100;

  return discountAmount;
};

/**
 * Check if client can use discount code
 * Returns usage count and whether limit is reached
 */
export const checkClientUsageLimit = async (discountCodeId, clientProfileId) => {
  try {
    const discountCode = await prisma.discountCode.findUnique({
      where: { id: discountCodeId },
    });

    if (!discountCode || !discountCode.maxUsesPerClient) {
      return {
        canUse: true,
        usageCount: 0,
        limit: null,
      };
    }

    const usageCount = await prisma.discountUsage.count({
      where: {
        discountCodeId,
        clientProfileId,
      },
    });

    return {
      canUse: usageCount < discountCode.maxUsesPerClient,
      usageCount,
      limit: discountCode.maxUsesPerClient,
    };
  } catch (error) {
    logger.error("Error checking client usage limit:", {
      error: error.message,
      discountCodeId,
      clientProfileId,
    });
    return {
      canUse: false,
      error: "Failed to check usage limit",
    };
  }
};

/**
 * Record discount usage
 * Creates DiscountUsage record and increments counter
 */
export const recordDiscountUsage = async (
  discountCodeId,
  clientProfileId,
  caseId,
  quoteId,
  originalAmount,
  discountAmount,
  finalAmount
) => {
  try {
    // Use transaction to ensure atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // Create usage record
      const usage = await tx.discountUsage.create({
        data: {
          discountCodeId,
          clientProfileId,
          caseId,
          quoteId,
          originalAmount,
          discountAmount,
          finalAmount,
        },
      });

      // Increment usage counter
      await tx.discountCode.update({
        where: { id: discountCodeId },
        data: {
          timesUsed: { increment: 1 },
        },
      });

      return usage;
    });

    logger.info("Discount usage recorded", {
      discountCodeId,
      clientProfileId,
      quoteId,
      discountAmount,
    });

    return {
      success: true,
      usage: result,
    };
  } catch (error) {
    logger.error("Error recording discount usage:", {
      error: error.message,
      discountCodeId,
      quoteId,
    });
    return {
      success: false,
      error: "Failed to record discount usage",
    };
  }
};

/**
 * Get discount code statistics
 * Returns usage stats for a specific code
 */
export const getDiscountCodeStats = async (discountCodeId) => {
  try {
    const [discountCode, totalUsage, uniqueClients, totalDiscount] =
      await Promise.all([
        prisma.discountCode.findUnique({
          where: { id: discountCodeId },
          include: {
            createdBy: {
              select: {
                name: true,
              },
            },
          },
        }),
        prisma.discountUsage.count({
          where: { discountCodeId },
        }),
        prisma.discountUsage.groupBy({
          by: ["clientProfileId"],
          where: { discountCodeId },
          _count: true,
        }),
        prisma.discountUsage.aggregate({
          where: { discountCodeId },
          _sum: {
            discountAmount: true,
          },
        }),
      ]);

    if (!discountCode) {
      return null;
    }

    return {
      code: discountCode.code,
      type: discountCode.discountType,
      value: discountCode.discountValue,
      isActive: discountCode.isActive,
      validFrom: discountCode.validFrom,
      validUntil: discountCode.validUntil,
      totalUsage,
      uniqueClients: uniqueClients.length,
      totalDiscountGiven: totalDiscount._sum.discountAmount || 0,
      maxUsesTotal: discountCode.maxUsesTotal,
      maxUsesPerClient: discountCode.maxUsesPerClient,
      usageRate:
        discountCode.maxUsesTotal
          ? (totalUsage / discountCode.maxUsesTotal) * 100
          : null,
      createdBy: discountCode.createdBy.name,
      createdAt: discountCode.createdAt,
    };
  } catch (error) {
    logger.error("Error getting discount code stats:", {
      error: error.message,
      discountCodeId,
    });
    return null;
  }
};

/**
 * Validate code format
 * Checks if code meets format requirements
 */
export const validateCodeFormat = (code) => {
  if (!code || typeof code !== "string") {
    return {
      valid: false,
      error: "Code is required",
    };
  }

  const trimmedCode = code.trim().toUpperCase();

  if (trimmedCode.length < 3 || trimmedCode.length > 20) {
    return {
      valid: false,
      error: "Code must be between 3 and 20 characters",
    };
  }

  // Allow only alphanumeric characters
  if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
    return {
      valid: false,
      error: "Code can only contain letters and numbers",
    };
  }

  return {
    valid: true,
    code: trimmedCode,
  };
};

/**
 * Check if code is expired
 */
export const isCodeExpired = (validUntil) => {
  return new Date() > new Date(validUntil);
};

/**
 * Check if code is valid for current date
 */
export const isCodeValidNow = (validFrom, validUntil) => {
  const now = new Date();
  return now >= new Date(validFrom) && now <= new Date(validUntil);
};
