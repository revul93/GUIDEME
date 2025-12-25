import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const getCase = async (req, res) => {
  try {
    const { id } = req.params;
    const caseId = parseInt(id);

    // Build where clause based on user role
    const whereClause = { id: caseId };
    if (req.user.role === "client") {
      whereClause.clientProfileId = req.user.profile.id;
    }

    const caseData = await prisma.case.findFirst({
      where: whereClause,
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
      },
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    logger.info("Case retrieved successfully", {
      caseId: caseData.id,
      userId: req.user.id,
    });

    res.json({
      success: true,
      data: { case: caseData },
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
      message: "Failed to fetch case",
    });
  }
};
