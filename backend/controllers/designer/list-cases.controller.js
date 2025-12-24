import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const listAllCases = async (req, res) => {
  try {
    if (req.user.role !== "designer") {
      return res.status(403).json({
        success: false,
        message: "Only designers can access this endpoint",
      });
    }

    const {
      status,
      clientProfileId,
      procedureCategory,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const where = {
      isDraft: false, // Designers don't see drafts
    };

    if (status) {
      where.status = status;
    }

    if (clientProfileId) {
      where.clientProfileId = parseInt(clientProfileId);
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
              specialty: true,
              clinicName: true,
              // No email or phone
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
      controller: "listAllCases",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to list all cases",
    });
  }
};

export const getCaseDetails = async (req, res) => {
  try {
    if (req.user.role !== "designer") {
      return res.status(403).json({
        success: false,
        message: "Only designers can access this endpoint",
      });
    }

    const { id } = req.params;

    const caseData = await prisma.case.findUnique({
      where: { id: parseInt(id) },
      include: {
        clientProfile: {
          select: {
            id: true,
            name: true,
            clientType: true,
            specialty: true,
            specialtyOther: true,
            clinicName: true,
            // No email or phone for non-admin designers
          },
        },
        files: {
          orderBy: { createdAt: "desc" },
        },
        comments: {
          include: {
            clientProfile: {
              select: {
                id: true,
                name: true,
              },
            },
            designerProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        statusHistory: {
          include: {
            designerProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        quotes: {
          orderBy: { createdAt: "desc" },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        deliveryAddress: true,
        pickupBranch: true,
        studyCompletedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (caseData.teethNumbers) {
      try {
        caseData.teethNumbers = JSON.parse(caseData.teethNumbers);
      } catch (error) {
        logger.error("Controller error:", {
          error: error.message,
          stack: error.stack,
          controller: "getCaseDetails - parsing teethNumbers",
          userId: req.user?.id,
          caseId: req.params?.id,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        case: caseData,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getCaseDetails",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to get case details",
    });
  }
};
