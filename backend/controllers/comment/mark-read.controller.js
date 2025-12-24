import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const markCommentAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.caseComment.findUnique({
      where: { id: parseInt(id) },
      include: {
        case: {
          select: {
            clientProfileId: true,
          },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (req.user.role === "client") {
      if (comment.case.clientProfileId !== req.user.profile.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      if (comment.authorType === "client") {
        return res.status(400).json({
          success: false,
          message: "Cannot mark your own comment as read",
        });
      }
    }

    if (req.user.role === "designer") {
      if (
        comment.authorType === "designer" &&
        comment.designerProfileId === req.user.profile.id
      ) {
        return res.status(400).json({
          success: false,
          message: "Cannot mark your own comment as read",
        });
      }
    }

    await prisma.caseComment.update({
      where: { id: parseInt(id) },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Comment marked as read",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "markCommentAsRead",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to mark comment as read",
    });
  }
};

export const markAllCommentsAsRead = async (req, res) => {
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

      await prisma.caseComment.updateMany({
        where: {
          caseId: parseInt(id),
          authorType: "designer",
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } else {
      await prisma.caseComment.updateMany({
        where: {
          caseId: parseInt(id),
          authorType: "client",
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "All comments marked as read",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "markAllCommentsAsRead",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to mark all comments as read",
    });
  }
};
