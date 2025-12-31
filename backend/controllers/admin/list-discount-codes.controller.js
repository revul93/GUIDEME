import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

/**
 * List discount codes (Admin only)
 * Supports filtering and pagination
 */
export const listDiscountCodes = async (req, res) => {
  try {
    // Only admins can list discount codes
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view discount codes",
      });
    }

    const {
      page = 1,
      limit = 20,
      active,
      expired,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {
      deletedAt: null,
    };

    // Filter by active status
    if (active !== undefined) {
      whereClause.isActive = active === "true";
    }

    // Filter by expiration
    if (expired !== undefined) {
      const now = new Date();
      if (expired === "true") {
        whereClause.validUntil = { lt: now };
      } else {
        whereClause.validUntil = { gte: now };
      }
    }

    // Search by code or description
    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.discountCode.count({ where: whereClause });

    // Get discount codes
    const discountCodes = await prisma.discountCode.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limitNum,
    });

    // Calculate additional stats for each code
    const codesWithStats = discountCodes.map((code) => {
      const now = new Date();
      const isExpired = now > code.validUntil;
      const isNotYetValid = now < code.validFrom;
      const isExhausted =
        code.maxUsesTotal !== null && code.timesUsed >= code.maxUsesTotal;

      let status = "active";
      if (!code.isActive) {
        status = "inactive";
      } else if (isExpired) {
        status = "expired";
      } else if (isNotYetValid) {
        status = "pending";
      } else if (isExhausted) {
        status = "exhausted";
      }

      return {
        id: code.id,
        code: code.code,
        discountType: code.discountType,
        discountValue: code.discountValue,
        maxDiscountAmount: code.maxDiscountAmount,
        minOrderAmount: code.minOrderAmount,
        maxUsesTotal: code.maxUsesTotal,
        maxUsesPerClient: code.maxUsesPerClient,
        validFrom: code.validFrom,
        validUntil: code.validUntil,
        isActive: code.isActive,
        timesUsed: code.timesUsed,
        uniqueUsers: code._count.usages,
        description: code.description,
        status,
        usagePercentage:
          code.maxUsesTotal !== null
            ? Math.round((code.timesUsed / code.maxUsesTotal) * 100)
            : null,
        createdBy: code.createdBy.name,
        createdAt: code.createdAt,
      };
    });

    logger.info("Discount codes retrieved", {
      count: discountCodes.length,
      total,
      page: pageNum,
      userId: req.user.id,
    });

    res.json({
      success: true,
      data: {
        discountCodes: codesWithStats,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "listDiscountCodes",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch discount codes",
    });
  }
};
