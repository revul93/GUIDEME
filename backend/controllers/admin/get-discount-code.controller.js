import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import { getDiscountCodeStats } from "../../services/discount.service.js";

/**
 * Get discount code details with statistics (Admin only)
 */
export const getDiscountCode = async (req, res) => {
  try {
    // Only admins can view discount code details
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view discount code details",
      });
    }

    const { id } = req.params;
    const discountCodeId = parseInt(id);

    // Get discount code
    const discountCode = await prisma.discountCode.findFirst({
      where: {
        id: discountCodeId,
        deletedAt: null,
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        usages: {
          include: {
            clientProfile: {
              select: {
                id: true,
                name: true,
              },
            },
            case: {
              select: {
                id: true,
                caseNumber: true,
              },
            },
            quote: {
              select: {
                id: true,
                quoteNumber: true,
              },
            },
          },
          orderBy: {
            appliedAt: "desc",
          },
          take: 50, // Last 50 uses
        },
      },
    });

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found",
      });
    }

    // Get statistics
    const stats = await getDiscountCodeStats(discountCodeId);

    // Calculate status
    const now = new Date();
    const isExpired = now > discountCode.validUntil;
    const isNotYetValid = now < discountCode.validFrom;
    const isExhausted =
      discountCode.maxUsesTotal !== null &&
      discountCode.timesUsed >= discountCode.maxUsesTotal;

    let status = "active";
    if (!discountCode.isActive) {
      status = "inactive";
    } else if (isExpired) {
      status = "expired";
    } else if (isNotYetValid) {
      status = "pending";
    } else if (isExhausted) {
      status = "exhausted";
    }

    logger.info("Discount code retrieved", {
      code: discountCode.code,
      userId: req.user.id,
    });

    res.json({
      success: true,
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
          internalNotes: discountCode.internalNotes,
          status,
          createdBy: discountCode.createdBy.name,
          createdAt: discountCode.createdAt,
          updatedAt: discountCode.updatedAt,
        },
        statistics: stats,
        recentUsage: discountCode.usages.map((usage) => ({
          id: usage.id,
          client: usage.clientProfile.name,
          case: usage.case.caseNumber,
          quote: usage.quote.quoteNumber,
          originalAmount: usage.originalAmount,
          discountAmount: usage.discountAmount,
          finalAmount: usage.finalAmount,
          appliedAt: usage.appliedAt,
        })),
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getDiscountCode",
      userId: req.user?.id,
      discountCodeId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch discount code",
    });
  }
};
