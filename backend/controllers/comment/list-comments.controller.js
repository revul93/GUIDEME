import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const listComments = async (req, res) => {
  try {
    const { id } = req.params;

    const caseData = await prisma.case.findUnique({
      where: { id: parseInt(id) },
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (req.user.role === "client") {
      if (caseData.clientProfileId !== req.user.profile.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    const comments = await prisma.caseComment.findMany({
      where: { caseId: parseInt(id) },
      include: {
        clientProfile: {
          select: {
            id: true,
            name: true,
            clientType: true,
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
    });

    res.status(200).json({
      success: true,
      data: {
        comments,
        total: comments.length,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "listComments",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to list comments",
    });
  }
};
