import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import { validateCaseData } from "./validation.js";

export const createCase = async (req, res) => {
  try {
    // Ensure user is a client
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can create cases",
      });
    }

    const clientProfileId = req.user.profile.id;

    // Validate input
    const validation = validateCaseData(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

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

    // Generate unique case number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const caseNumber = `CASE-${timestamp}-${random}`;

    // Create case
    const newCase = await prisma.case.create({
      data: {
        clientProfileId,
        caseNumber,
        patientRef: patientRef || null,
        procedureCategory,
        guideType,
        requiredService,
        implantSystem: implantSystem || null,
        implantSystemOther: implantSystemOther || null,
        teethNumbers: teethNumbers ? JSON.stringify(teethNumbers) : null,
        clinicalNotes: clinicalNotes || null,
        specialInstructions: specialInstructions || null,
        deliveryMethod: deliveryMethod || null,
        deliveryAddressId: deliveryAddressId || null,
        pickupBranchId: pickupBranchId || null,
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

    // Create initial status history
    await prisma.caseStatusHistory.create({
      data: {
        caseId: newCase.id,
        toStatus: "submitted",
        notes: "Case submitted by client",
        changedByClientId: clientProfileId,
        changedBy: "client", // Fixed: was "doctor"
      },
    });

    logger.info("Case created successfully", {
      caseId: newCase.id,
      caseNumber: newCase.caseNumber,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Case created successfully",
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
    });

    return res.status(500).json({
      success: false,
      message: "Failed to create case",
    });
  }
};