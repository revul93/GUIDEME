import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const getCaseStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const caseId = parseInt(id);

    // Check if case exists and user has access
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, clientProfileId: true },
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Check authorization
    if (req.user.role === "client" && caseData.clientProfileId !== req.user.profile.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const history = await prisma.caseStatusHistory.findMany({
      where: { caseId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        designer: {
          select: {
            id: true,
            name: true,
            isAdmin: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    logger.info("Status history retrieved", {
      caseId,
      count: history.length,
      userId: req.user.id,
    });

    res.json({
      success: true,
      data: { history },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getCaseStatusHistory",
      userId: req.user?.id,
      caseId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch status history",
    });
  }
};
