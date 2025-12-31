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
      patientRef,
      procedureCategory,
      guideType,
      requiredService,
      implantSystem,
      implantSystemOther,
      teethNumbers,
      clinicalNotes,
      specialInstructions,
      deliveryMethod,
      deliveryAddressId,
      pickupBranchId,
    } = req.body;

    const existingCase = await prisma.case.findFirst({
      where: {
        id: parseInt(id),
        clientProfileId: req.user.profile.id,
        deletedAt: null, // Soft delete check
      },
    });

    if (!existingCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Check if case can be updated (not yet submitted)
    if (existingCase.submittedAt) {
      return res.status(400).json({
        success: false,
        message:
          "Submitted cases cannot be updated. Please use comments for additional information",
      });
    }

    const validation = validateCaseData({
      procedureCategory: procedureCategory || existingCase.procedureCategory,
      guideType: guideType || existingCase.guideType,
      requiredService: requiredService || existingCase.requiredService,
      implantSystem: implantSystem || existingCase.implantSystem,
      implantSystemOther:
        implantSystemOther || existingCase.implantSystemOther,
      teethNumbers: teethNumbers || existingCase.teethNumbers,
      deliveryMethod: deliveryMethod || existingCase.deliveryMethod,
      deliveryAddressId: deliveryAddressId || existingCase.deliveryAddressId,
      pickupBranchId: pickupBranchId || existingCase.pickupBranchId,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const updateData = {};
    if (patientRef !== undefined) updateData.patientRef = patientRef;
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
    if (deliveryMethod !== undefined)
      updateData.deliveryMethod = deliveryMethod;
    if (deliveryAddressId !== undefined)
      updateData.deliveryAddressId = deliveryAddressId;
    if (pickupBranchId !== undefined)
      updateData.pickupBranchId = pickupBranchId;

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

    logger.info("Case updated successfully", {
      caseId: updatedCase.id,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Case updated successfully",
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