import prisma from "../../config/db.js";
import { validateCaseData } from "./validation.js";
import logger from "../../utils/logger.js";

export const submitCase = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can submit cases",
      });
    }

    const { id } = req.params;

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
        message: "Case has already been submitted",
      });
    }

    const validation = validateCaseData({
      procedureCategory: existingCase.procedureCategory,
      guideType: existingCase.guideType,
      requiredService: existingCase.requiredService,
      implantSystem: existingCase.implantSystem,
      implantSystemOther: existingCase.implantSystemOther,
      isDraft: false,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Cannot submit incomplete case",
        errors: validation.errors,
      });
    }

    const submittedCase = await prisma.case.update({
      where: { id: parseInt(id) },
      data: {
        isDraft: false,
        status: "submitted",
        submittedAt: new Date(),
      },
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

    await prisma.caseStatusHistory.create({
      data: {
        caseId: submittedCase.id,
        fromStatus: "draft",
        toStatus: "submitted",
        changedBy: "client",
        changedById: null,
        notes: "Case submitted for processing",
      },
    });

    res.status(200).json({
      success: true,
      message: "Case submitted successfully",
      data: {
        case: submittedCase,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "submitCase",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to submit case",
    });
  }
};
