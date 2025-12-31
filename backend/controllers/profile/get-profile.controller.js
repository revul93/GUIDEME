import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const getProfile = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const profile = await prisma.clientProfile.findUnique({
      where: { id: req.user.profile.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            emailVerified: true,
            phoneVerified: true,
            accountStatus: true,
            preferredLanguage: true,
            timezone: true,
            notificationPreferences: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        addresses: {
          where: {
            deletedAt: null, // FIXED: Add soft delete check
          },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!profile || profile.deletedAt) {
      // FIXED: Check profile soft delete
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          clientType: profile.clientType,
          name: profile.name,
          profileImageUrl: profile.profileImageUrl, // FIXED: Added
          specialty: profile.specialty,
          specialtyOther: profile.specialtyOther,
          clinicName: profile.clinicName,
          labName: profile.labName, // FIXED: Added
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
        user: profile.user,
        addresses: profile.addresses,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getProfile",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};
