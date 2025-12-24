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

    const { name, specialty, specialtyOther, clinicName } = req.body;

    const errors = [];

    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        errors.push("Name must be at least 2 characters");
      } else if (name.trim().length > 100) {
        errors.push("Name must be less than 100 characters");
      }
    }

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

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (specialty !== undefined) updateData.specialty = specialty;
    if (specialtyOther !== undefined)
      updateData.specialtyOther = specialtyOther;
    if (clinicName !== undefined) updateData.clinicName = clinicName;

    const updatedProfile = await prisma.clientProfile.update({
      where: { id: req.user.profile.id },
      data: updateData,
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
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};
