import prisma from "../../config/db.js";
import { validateCaseData } from "./validation.js";
import logger from "../../utils/logger.js";

export const updateCase = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can update cases",
      });
    }

    const { id } = req.params;
    const {
      patientId,
      patientName,
      patientAge,
      patientGender,
      procedureCategory,
      guideType,
      requiredService,
      implantSystem,
      implantSystemOther,
      teethNumbers,
      clinicalNotes,
      specialInstructions,
    } = req.body;

    const existingCase = await prisma.case.findFirst({
      where: {
        id: parseInt(id),
        clientProfileId: req.user.profile.id,
      },
    });

    if (!existingCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (!existingCase.isDraft) {
      return res.status(400).json({
        success: false,
        message:
          "Only draft cases can be updated. After submission, please use comments for additional information",
      });
    }

    const validation = validateCaseData({
      procedureCategory: procedureCategory || existingCase.procedureCategory,
      guideType: guideType || existingCase.guideType,
      requiredService: requiredService || existingCase.requiredService,
      implantSystem: implantSystem || existingCase.implantSystem,
      implantSystemOther: implantSystemOther || existingCase.implantSystemOther,
      isDraft: true,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const updateData = {};
    if (patientId !== undefined) updateData.patientId = patientId;
    if (patientName !== undefined) updateData.patientName = patientName;
    if (patientAge !== undefined) updateData.patientAge = patientAge;
    if (patientGender !== undefined) updateData.patientGender = patientGender;
    if (procedureCategory !== undefined)
      updateData.procedureCategory = procedureCategory;
    if (guideType !== undefined) updateData.guideType = guideType;
    if (requiredService !== undefined)
      updateData.requiredService = requiredService;
    if (implantSystem !== undefined) updateData.implantSystem = implantSystem;
    if (implantSystemOther !== undefined)
      updateData.implantSystemOther = implantSystemOther;
    if (teethNumbers !== undefined)
      updateData.teethNumbers = JSON.stringify(teethNumbers);
    if (clinicalNotes !== undefined) updateData.clinicalNotes = clinicalNotes;
    if (specialInstructions !== undefined)
      updateData.specialInstructions = specialInstructions;

    const updatedCase = await prisma.case.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        clientProfile: {
          select: {
            id: true,
            name: true,
            clientType: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Draft case updated successfully",
      data: {
        case: updatedCase,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "updateCase",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to update case",
    });
  }
};
