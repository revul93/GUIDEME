import prisma from "../../config/db.js";
import { validateCaseData } from "./validation.js";
import logger from "../../utils/logger.js";

export const createCase = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can create cases",
      });
    }

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
      isDraft,
    } = req.body;

    const validation = validateCaseData({
      procedureCategory,
      guideType,
      requiredService,
      implantSystem,
      implantSystemOther,
      isDraft,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const caseNumber = `CASE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const caseData = {
      clientProfileId: req.user.profile.id,
      caseNumber,
      patientId,
      patientName,
      patientAge,
      patientGender,
      procedureCategory,
      guideType,
      requiredService,
      implantSystem,
      implantSystemOther,
      teethNumbers: teethNumbers ? JSON.stringify(teethNumbers) : null,
      clinicalNotes,
      specialInstructions,
      status: isDraft ? "draft" : "submitted",
      isDraft: isDraft !== false,
      submittedAt: isDraft ? null : new Date(),
    };

    const newCase = await prisma.case.create({
      data: caseData,
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

    if (!isDraft) {
      await prisma.caseStatusHistory.create({
        data: {
          caseId: newCase.id,
          fromStatus: null,
          toStatus: "submitted",
          changedBy: "client",
          changedById: null,
          notes: "Case submitted",
        },
      });
    }

    res.status(201).json({
      success: true,
      message: isDraft ? "Case saved as draft" : "Case submitted successfully",
      data: {
        case: newCase,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "createCase",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to create case",
    });
  }
};
