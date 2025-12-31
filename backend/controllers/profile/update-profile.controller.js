import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const updateProfile = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const { name, specialty, specialtyOther, clinicName, labName } = req.body;

    const errors = [];

    // Get current profile to check clientType
    const currentProfile = await prisma.clientProfile.findUnique({
      where: { id: req.user.profile.id },
      select: { clientType: true },
    });

    if (!currentProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Validate name
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        errors.push("Name must be at least 2 characters");
      } else if (name.trim().length > 100) {
        errors.push("Name must be less than 100 characters");
      }
    }

    // Validate specialty
    const validSpecialties = [
      "GENERAL_DENTISTRY",
      "ORTHODONTICS",
      "PERIODONTICS",
      "ENDODONTICS",
      "PROSTHODONTICS",
      "ORAL_SURGERY",
      "PEDIATRIC_DENTISTRY",
      "COSMETIC_DENTISTRY",
      "IMPLANTOLOGY",
      "ORAL_PATHOLOGY",
      "OTHER",
    ];

    if (specialty !== undefined && !validSpecialties.includes(specialty)) {
      errors.push("Invalid specialty");
    }

    if (specialty === "OTHER" && !specialtyOther) {
      errors.push("Please specify your specialty");
    }

    // FIXED: Validate clinicName vs labName based on clientType
    if (currentProfile.clientType === "doctor") {
      if (labName !== undefined) {
        errors.push("Doctors should use clinicName, not labName");
      }
    }

    if (currentProfile.clientType === "lab") {
      if (clinicName !== undefined) {
        errors.push("Labs should use labName, not clinicName");
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (specialty !== undefined) updateData.specialty = specialty;
    if (specialtyOther !== undefined)
      updateData.specialtyOther = specialtyOther;

    // FIXED: Handle clinicName and labName based on clientType
    if (currentProfile.clientType === "doctor" && clinicName !== undefined) {
      updateData.clinicName = clinicName;
      updateData.labName = null; // Clear labName for doctors
    }

    if (currentProfile.clientType === "lab" && labName !== undefined) {
      updateData.labName = labName;
      updateData.clinicName = null; // Clear clinicName for labs
    }

    const updatedProfile = await prisma.clientProfile.update({
      where: { id: req.user.profile.id },
      data: updateData,
    });

    logger.info("Profile updated", {
      userId: req.user.id,
      profileId: updatedProfile.id,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        profile: updatedProfile,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "updateProfile",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};
