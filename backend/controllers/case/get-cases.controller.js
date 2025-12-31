import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const getCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      procedureCategory,
      search,
      clientId, // For designers to filter by specific client
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {
      deletedAt: null, // Exclude soft-deleted cases
    };

    // Clients only see their own cases
    if (req.user.role === "client") {
      where.clientProfileId = req.user.profile.id;
    }

    // Designers can optionally filter by client
    if (req.user.role === "designer" && clientId) {
      where.clientProfileId = parseInt(clientId);
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by procedure category
    if (procedureCategory) {
      where.procedureCategory = procedureCategory;
    }

    // Search by case number or patient ref (useful for designers)
    if (search) {
      where.OR = [
        { caseNumber: { contains: search, mode: "insensitive" } },
        { patientRef: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.case.count({ where });

    // Build include based on role
    const include = {
      clientProfile: {
        select: {
          id: true,
          name: true,
          clientType: true,
        },
      },
      _count: {
        select: {
          files: true,
          comments: true,
          // Only clients need quote count in their dashboard
          ...(req.user.role === "client" && { quotes: true }),
        },
      },
    };

    // Get cases
    const cases = await prisma.case.findMany({
      where,
      include,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limitNum,
    });

    logger.info("Cases retrieved", {
      count: cases.length,
      total,
      page: pageNum,
      userId: req.user.id,
      role: req.user.role,
    });

    res.json({
      success: true,
      data: {
        cases,
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
      controller: "getCases",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cases",
    });
  }
};
