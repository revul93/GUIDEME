import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

const validStatusTransitions = {
  submitted: ["study_in_progress"],
  study_in_progress: ["study_completed"],
  in_production: ["production_completed"],
  production_completed: ["ready_for_pickup", "out_for_delivery"],
  ready_for_pickup: ["delivered"],
  out_for_delivery: ["delivered"],
};

export const updateCaseStatus = async (req, res) => {
  try {
    if (req.user.role !== "designer") {
      return res.status(403).json({
        success: false,
        message: "Only designers can update case status",
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const caseData = await prisma.case.findUnique({
      where: { id: parseInt(id) },
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    const currentStatus = caseData.status;
    const allowedTransitions = validStatusTransitions[currentStatus];

    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${currentStatus} to ${status}`,
        allowedTransitions: allowedTransitions || [],
      });
    }

    const updateData = { status };

    if (status === "study_completed") {
      updateData.studyCompletedById = req.user.designerProfile.id;
    }

    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    await prisma.case.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    await prisma.caseStatusHistory.create({
      data: {
        caseId: parseInt(id),
        fromStatus: currentStatus,
        toStatus: status,
        changedBy: "designer",
        changedById: req.user.designerProfile.id,
        notes: notes || `Status changed to ${status}`,
      },
    });

    res.status(200).json({
      success: true,
      message: `Case status updated to ${status}`,
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

export const getAvailableStatuses = async (req, res) => {
  try {
    if (req.user.role !== "designer") {
      return res.status(403).json({
        success: false,
        message: "Only designers can access this endpoint",
      });
    }

    const { id } = req.params;

    const caseData = await prisma.case.findUnique({
      where: { id: parseInt(id) },
      select: {
        status: true,
      },
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    const currentStatus = caseData.status;
    const availableStatuses = validStatusTransitions[currentStatus] || [];

    res.status(200).json({
      success: true,
      data: {
        currentStatus,
        availableStatuses,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getAvailableStatuses",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to get available statuses",
    });
  }
};
