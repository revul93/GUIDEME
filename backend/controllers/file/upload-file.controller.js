import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const uploadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName, fileUrl, fileType, fileSize, category, description } =
      req.body;

    if (!fileName || !fileUrl || !fileType || !fileSize) {
      return res.status(400).json({
        success: false,
        message: "fileName, fileUrl, fileType, and fileSize are required",
      });
    }

    const validCategories = [
      "xray",
      "ct_scan",
      "cbct",
      "dicom",
      "intraoral_scan",
      "stl",
      "clinical_photo",
      "prescription",
      "study_file",
      "design_file",
      "production_file",
      "other",
    ];

    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file category",
      });
    }

    const maxFileSize = 100 * 1024 * 1024;
    if (fileSize > maxFileSize) {
      return res.status(400).json({
        success: false,
        message: "File size must be less than 100MB",
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

    const file = await prisma.caseFile.create({
      data: {
        caseId: parseInt(id),
        fileName,
        fileUrl,
        fileType,
        fileSize,
        category: category || "other",
        description,
        uploadedBy: req.user.role === "client" ? "client" : "designer",
        uploadedById: req.user.profile.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        file,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "uploadFile",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to upload file",
    });
  }
};

export const listFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.query;

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

    const where = { caseId: parseInt(id) };
    if (category) {
      where.category = category;
    }

    const files = await prisma.caseFile.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: {
        files,
        total: files.length,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "listFiles",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to list files",
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await prisma.caseFile.findUnique({
      where: { id: parseInt(id) },
      include: {
        case: {
          select: {
            clientProfileId: true,
          },
        },
      },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    if (req.user.role === "client") {
      if (file.case.clientProfileId !== req.user.profile.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      if (file.uploadedBy !== "client") {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own files",
        });
      }
    }

    if (req.user.role === "designer") {
      if (
        file.uploadedBy === "designer" &&
        file.uploadedById !== req.user.profile.id
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own files",
        });
      }
    }

    await prisma.caseFile.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "deleteFile",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to delete file",
    });
  }
};
