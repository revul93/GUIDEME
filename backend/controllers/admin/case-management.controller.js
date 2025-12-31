import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

/**
 * Assign case to designer (Admin only)
 * Manually assign a specific designer to work on a case
 */
export const assignCaseToDesigner = async (req, res) => {
  try {
    // Only admins can assign cases
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can assign cases to designers",
      });
    }

    const { id } = req.params;
    const { designerId, notes } = req.body;

    const caseId = parseInt(id);
    const designerProfileId = parseInt(designerId);

    if (!designerId) {
      return res.status(400).json({
        success: false,
        message: "Designer ID is required",
      });
    }

    // Get case
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        deletedAt: null,
      },
      include: {
        clientProfile: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Verify designer exists
    const designer = await prisma.designerProfile.findFirst({
      where: {
        id: designerProfileId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            accountStatus: true,
          },
        },
      },
    });

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: "Designer not found",
      });
    }

    if (designer.user.accountStatus !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign to inactive designer",
      });
    }

    // Note: In your schema, there's no direct "assignedTo" field
    // This assignment is tracked through status history and comments
    // We'll add a comment to indicate assignment

    await prisma.caseComment.create({
      data: {
        caseId,
        comment: `Case assigned to ${designer.name}${notes ? `\nNotes: ${notes}` : ""}`,
        commentedByDesignerId: req.user.profile.id,
        isInternal: true, // Admin note, not visible to client
      },
    });

    logger.info("Case assigned to designer", {
      caseId,
      caseNumber: caseRecord.caseNumber,
      designerId: designerProfileId,
      designerName: designer.name,
      assignedBy: req.user.id,
    });

    res.json({
      success: true,
      message: "Case assigned successfully",
      data: {
        case: {
          id: caseRecord.id,
          caseNumber: caseRecord.caseNumber,
        },
        assignedTo: {
          id: designer.id,
          name: designer.name,
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "assignCaseToDesigner",
      userId: req.user?.id,
      caseId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to assign case",
    });
  }
};

/**
 * Override case status (Admin only)
 * Manually change case status (bypass normal workflow)
 */
export const overrideCaseStatus = async (req, res) => {
  try {
    // Only admins can override case status
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can override case status",
      });
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    const caseId = parseInt(id);

    // Validate status
    const validStatuses = [
      "submitted",
      "study_in_progress",
      "study_completed",
      "quote_sent",
      "quote_accepted",
      "quote_rejected",
      "in_production",
      "production_completed",
      "ready_for_pickup",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "pending_response",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        validStatuses,
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required for status override",
      });
    }

    // Get case
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        deletedAt: null,
      },
    });

    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    const oldStatus = caseRecord.status;

    // Update case status
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: { status },
    });

    // Create status history
    await prisma.caseStatusHistory.create({
      data: {
        caseId,
        fromStatus: oldStatus,
        toStatus: status,
        changedBy: "admin",
        changedByDesignerId: req.user.profile.id,
        notes: `Admin override: ${reason}`,
      },
    });

    // Add internal comment
    await prisma.caseComment.create({
      data: {
        caseId,
        comment: `Status manually changed from ${oldStatus} to ${status}\nReason: ${reason}`,
        commentedByDesignerId: req.user.profile.id,
        isInternal: true,
      },
    });

    logger.warn("Case status overridden by admin", {
      caseId,
      caseNumber: caseRecord.caseNumber,
      fromStatus: oldStatus,
      toStatus: status,
      reason,
      adminId: req.user.id,
    });

    res.json({
      success: true,
      message: "Case status overridden successfully",
      data: {
        case: {
          id: updatedCase.id,
          caseNumber: updatedCase.caseNumber,
          oldStatus,
          newStatus: updatedCase.status,
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "overrideCaseStatus",
      userId: req.user?.id,
      caseId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to override case status",
    });
  }
};
