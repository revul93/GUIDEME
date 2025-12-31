import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, fileUrl, fileName, fileSize, fileType } = req.body;

    // Validate: must have either comment text or file attachment
    if ((!comment || comment.trim().length === 0) && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Either comment text or file attachment is required",
      });
    }

    // Validate comment length if provided
    if (comment && comment.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Comment must be less than 2000 characters",
      });
    }

    // Validate file data if fileUrl is provided
    if (fileUrl && (!fileName || !fileSize || !fileType)) {
      return res.status(400).json({
        success: false,
        message: "fileName, fileSize, and fileType are required when attaching a file",
      });
    }

    // Check if case exists
    const caseData = await prisma.case.findUnique({
      where: { id: parseInt(id) },
      select: { 
        id: true, 
        clientProfileId: true,
        deletedAt: true,
      },
    });

    if (!caseData || caseData.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Check authorization for clients
    if (req.user.role === "client") {
      if (caseData.clientProfileId !== req.user.profile.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // Build attachments array if file is provided
    let attachmentsArray = null;
    if (fileUrl) {
      attachmentsArray = JSON.stringify([
        {
          url: fileUrl,
          name: fileName,
          size: fileSize,
          type: fileType,
          uploadedAt: new Date().toISOString(),
        },
      ]);
    }

    // Build comment data matching schema
    const commentData = {
      caseId: parseInt(id),
      authorType: req.user.role, // "client" or "designer"
      comment: comment ? comment.trim() : "",
      attachments: attachmentsArray, // JSON string or null
    };

    // Set appropriate profile ID based on role
    if (req.user.role === "client") {
      commentData.clientProfileId = req.user.profile.id;
    } else if (req.user.role === "designer") {
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

    logger.info("Comment added successfully", {
      commentId: newComment.id,
      caseId: parseInt(id),
      userId: req.user.id,
      hasAttachment: !!fileUrl,
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