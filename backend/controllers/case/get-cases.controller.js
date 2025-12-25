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
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {};

    // Filter by client if user is a client
    if (req.user.role === "client") {
      whereClause.clientProfileId = req.user.profile.id;
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by procedure category
    if (procedureCategory) {
      whereClause.procedureCategory = procedureCategory;
    }

    // Search by case number or patient ref
    if (search) {
      whereClause.OR = [
        { caseNumber: { contains: search, mode: "insensitive" } },
        { patientRef: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.case.count({ where: whereClause });

    // Get cases
    const cases = await prisma.case.findMany({
      where: whereClause,
      include: {
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
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limitNum,
    });

    logger.info("Cases retrieved", {
      count: cases.length,
      total,
      page: pageNum,
      userId: req.user.id,
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
