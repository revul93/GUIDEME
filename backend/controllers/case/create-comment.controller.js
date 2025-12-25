import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const createCaseComment = async (req, res) => {
  try {
    const { id } = req.params;
    const caseId = parseInt(id);
    const { comment, fileUrl, fileName, fileSize } = req.body;

    // Validate at least comment or file
    if (!comment && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Comment or file is required",
      });
    }

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

    // Create comment data
    const commentData = {
      caseId,
      comment: comment || null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
      commentedBy: req.user.role,
    };

    // Set appropriate profile ID
    if (req.user.role === "client") {
      commentData.commentedByClientId = req.user.profile.id;
    } else {
      commentData.commentedByDesignerId = req.user.profile.id;
    }

    const newComment = await prisma.caseComment.create({
      data: commentData,
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
    });

    logger.info("Comment created", {
      commentId: newComment.id,
      caseId,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: { comment: newComment },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "createCaseComment",
      userId: req.user?.id,
      caseId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to create comment",
    });
  }
};
