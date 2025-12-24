import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    if (comment.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Comment must be less than 2000 characters",
      });
    }

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

    const commentData = {
      caseId: parseInt(id),
      authorType: req.user.role === "client" ? "client" : "designer",
      comment: comment.trim(),
    };

    if (req.user.role === "client") {
      commentData.clientProfileId = req.user.profile.id;
    } else {
      commentData.designerProfileId = req.user.profile.id;
    }

    const newComment = await prisma.caseComment.create({
      data: commentData,
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
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: {
        comment: newComment,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "addComment",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};
