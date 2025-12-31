import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import { sendCaseStatusNotification } from "../../services/notification.service.js";
import { createWebNotification } from "../../services/notification.service.js";

// ===================================================================
// CASE STATUS TRANSITION RULES
// ===================================================================

/**
 * Defines which status transitions are allowed for each role
 * 
 * Format: {
 *   currentStatus: {
 *     client: [allowedNextStatuses],
 *     designer: [allowedNextStatuses]
 *   }
 * }
 */
const STATUS_TRANSITION_RULES = {
  // Initial state - after creation
  submitted: {
    client: ["cancelled"], // Client can cancel
    designer: [
      "study_in_progress",
      "pending_study_payment_verification",
      "cancelled",
    ],
  },

  // Waiting for study payment
  pending_study_payment_verification: {
    client: ["cancelled"],
    designer: ["study_in_progress", "cancelled"],
  },

  // Study phase
  study_in_progress: {
    client: ["cancelled"],
    designer: ["study_completed", "pending_response", "cancelled"],
  },

  study_completed: {
    client: ["cancelled"],
    designer: ["quote_pending", "cancelled"],
  },

  // Quote phase
  quote_pending: {
    client: ["cancelled"],
    designer: ["quote_sent", "cancelled"],
  },

  quote_sent: {
    client: ["quote_accepted", "quote_rejected", "cancelled"],
    designer: ["cancelled"],
  },

  quote_accepted: {
    client: ["cancelled"],
    designer: ["pending_production_payment_verification", "cancelled"],
  },

  quote_rejected: {
    client: [],
    designer: ["quote_pending", "cancelled"], // Designer can send new quote
  },

  // Production payment
  pending_production_payment_verification: {
    client: ["cancelled"],
    designer: ["in_production", "cancelled"],
  },

  // Production phase
  in_production: {
    client: [],
    designer: ["pending_response", "production_completed", "cancelled"],
  },

  pending_response: {
    client: [], // Client responds via comments, not status
    designer: ["in_production", "production_completed", "cancelled"],
  },

  production_completed: {
    client: [],
    designer: ["ready_for_pickup", "out_for_delivery", "cancelled"],
  },

  // Delivery phase
  ready_for_pickup: {
    client: ["delivered"], // Client confirms pickup
    designer: ["delivered", "cancelled"],
  },

  out_for_delivery: {
    client: ["delivered"], // Client confirms delivery
    designer: ["delivered", "cancelled"],
  },

  // Final states
  delivered: {
    client: ["completed"],
    designer: ["completed", "refund_requested"],
  },

  completed: {
    client: ["refund_requested"],
    designer: ["refund_requested"],
  },

  // Cancellation & Refund
  cancelled: {
    client: [],
    designer: [],
  },

  refund_requested: {
    client: [],
    designer: ["refunded", "completed"], // Designer/admin decides
  },

  refunded: {
    client: [],
    designer: [],
  },
};

/**
 * Check if status transition is allowed
 */
export const isTransitionAllowed = (currentStatus, newStatus, userRole) => {
  const rules = STATUS_TRANSITION_RULES[currentStatus];
  if (!rules) return false;

  const allowedStatuses = rules[userRole] || [];
  return allowedStatuses.includes(newStatus);
};

/**
 * Get allowed next statuses for current state
 */
export const getAllowedNextStatuses = (currentStatus, userRole) => {
  const rules = STATUS_TRANSITION_RULES[currentStatus];
  if (!rules) return [];

  return rules[userRole] || [];
};

// ===================================================================
// CASE STATUS CONTROLLER
// ===================================================================

/**
 * Update case status
 */
export const updateCaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Get case with client info
    const caseData = await prisma.case.findUnique({
      where: { id: parseInt(id) },
      include: {
        clientProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!caseData || caseData.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Check authorization
    if (req.user.role === "client") {
      if (caseData.clientProfileId !== req.user.profile.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // Check if transition is allowed
    if (!isTransitionAllowed(caseData.status, status, req.user.role)) {
      const allowedStatuses = getAllowedNextStatuses(
        caseData.status,
        req.user.role
      );

      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${caseData.status} to ${status}`,
        allowedStatuses,
      });
    }

    // Update case status
    const updatedCase = await prisma.case.update({
      where: { id: parseInt(id) },
      data: {
        status,
        ...(status === "completed" && { completedAt: new Date() }),
        ...(status === "cancelled" && { cancelledAt: new Date() }),
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

    // Create status history
    const historyData = {
      caseId: parseInt(id),
      fromStatus: caseData.status,
      toStatus: status,
      changedBy: req.user.role,
      notes: notes || null,
    };

    if (req.user.role === "client") {
      historyData.changedByClientId = req.user.profile.id;
    } else {
      historyData.changedByDesignerId = req.user.profile.id;
    }

    await prisma.caseStatusHistory.create({
      data: historyData,
    });

    // Send notifications (email + web)
    const clientUser = caseData.clientProfile.user;

    // Email notification
    sendCaseStatusNotification(
      clientUser.id,
      clientUser.email,
      updatedCase,
      status,
      clientUser.preferredLanguage
    ).catch((error) => {
      logger.error("Failed to send email notification:", {
        error: error.message,
        caseId: updatedCase.id,
      });
    });

    // Web notification
    createWebNotification({
      userId: clientUser.id,
      purpose: "status_changed",
      title: "Case Status Updated",
      body: `Your case ${updatedCase.caseNumber} status changed to ${status}`,
      actionUrl: `/cases/${updatedCase.id}`,
      metadata: {
        caseId: updatedCase.id,
        fromStatus: caseData.status,
        toStatus: status,
      },
      language: clientUser.preferredLanguage,
    }).catch((error) => {
      logger.error("Failed to create web notification:", {
        error: error.message,
        caseId: updatedCase.id,
      });
    });

    logger.info("Case status updated", {
      caseId: updatedCase.id,
      fromStatus: caseData.status,
      toStatus: status,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Case status updated successfully",
      data: {
        case: updatedCase,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "updateCaseStatus",
      userId: req.user?.id,
      caseId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to update case status",
    });
  }
};

/**
 * Get allowed next statuses for a case
 */
export const getAllowedStatuses = async (req, res) => {
  try {
    const { id } = req.params;

    const caseData = await prisma.case.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        status: true,
        clientProfileId: true,
        deletedAt: true,
      },
    });

    if (!caseData || caseData.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Check authorization
    if (req.user.role === "client") {
      if (caseData.clientProfileId !== req.user.profile.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    const allowedStatuses = getAllowedNextStatuses(
      caseData.status,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: {
        currentStatus: caseData.status,
        allowedStatuses,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getAllowedStatuses",
      userId: req.user?.id,
      caseId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to get allowed statuses",
    });
  }
};
