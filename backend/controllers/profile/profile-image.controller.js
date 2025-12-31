import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = "/mnt/user-data/uploads/profile-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Upload profile image
 */
export const uploadProfileImage = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const file = req.file;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, and WebP are allowed",
      });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: "File size must be less than 5MB",
      });
    }

    // Get current profile
    const profile = await prisma.clientProfile.findUnique({
      where: { id: req.user.profile.id },
      select: { profileImageUrl: true },
    });

    // Delete old image if exists
    if (profile.profileImageUrl) {
      try {
        const oldImagePath = path.join(process.cwd(), profile.profileImageUrl);
        await fs.unlink(oldImagePath);
      } catch (error) {
        logger.warn("Failed to delete old profile image:", {
          error: error.message,
          oldImageUrl: profile.profileImageUrl,
        });
      }
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `profile-${req.user.id}-${Date.now()}${ext}`;
    const imageUrl = `/uploads/profile-images/${filename}`;

    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // Save file
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filepath, file.buffer);

    // Update profile
    await prisma.clientProfile.update({
      where: { id: req.user.profile.id },
      data: { profileImageUrl: imageUrl },
    });

    logger.info("Profile image uploaded", {
      userId: req.user.id,
      filename,
    });

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      data: {
        imageUrl,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "uploadProfileImage",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to upload profile image",
    });
  }
};

/**
 * Delete profile image
 */
export const deleteProfileImage = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    // Get current profile
    const profile = await prisma.clientProfile.findUnique({
      where: { id: req.user.profile.id },
      select: { profileImageUrl: true },
    });

    if (!profile.profileImageUrl) {
      return res.status(404).json({
        success: false,
        message: "No profile image to delete",
      });
    }

    // Delete physical file
    try {
      const imagePath = path.join(process.cwd(), profile.profileImageUrl);
      await fs.unlink(imagePath);
    } catch (error) {
      logger.warn("Failed to delete physical image file:", {
        error: error.message,
        imageUrl: profile.profileImageUrl,
      });
    }

    // Update profile
    await prisma.clientProfile.update({
      where: { id: req.user.profile.id },
      data: { profileImageUrl: null },
    });

    logger.info("Profile image deleted", {
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "deleteProfileImage",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to delete profile image",
    });
  }
};
