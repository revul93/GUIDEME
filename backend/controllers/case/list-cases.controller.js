import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const listCases = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access cases",
      });
    }

    const {
      status,
      isDraft,
      procedureCategory,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const where = {
      clientProfileId: req.user.profile.id,
    };

    if (status) {
      where.status = status;
    }

    if (isDraft !== undefined) {
      where.isDraft = isDraft === "true";
    }

    if (procedureCategory) {
      where.procedureCategory = procedureCategory;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
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
              quotes: true,
            },
          },
        },
      }),
      prisma.case.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        cases,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "listCases",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to list cases",
    });
  }
};
