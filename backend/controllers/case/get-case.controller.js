import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const getCase = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access cases",
      });
    }

    const { id } = req.params;

    const caseData = await prisma.case.findFirst({
      where: {
        id: parseInt(id),
        clientProfileId: req.user.profile.id,
      },
      include: {
        clientProfile: {
          select: {
            id: true,
            name: true,
            clientType: true,
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
          error: "Failed to parse teethNumbers",
          stack: error.stack,
          controller: "getCase.teethparsing",
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
      controller: "getCase",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Retriving case failed",
    });
  }
};
