import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import { sendEmail } from "../../services/email.service.js";
import { createNotification } from "../../services/notification.service.js";

/**
 * List pending lab approvals
 * GET /api/admin/labs/pending
 */
export const listPendingLabApprovals = async (req, res) => {
  try {
    // Only admins
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view pending approvals",
        errors: [],
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pending_approval status and lab profiles
    const [pendingLabs, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          accountStatus: "pending_approval",
          role: "client",
          clientProfile: {
            clientType: "lab",
          },
        },
        include: {
          clientProfile: {
            select: {
              id: true,
              name: true,
              labName: true,
              labLicenseNumber: true,
              labAddress: true,
              city: true,
              state: true,
              postalCode: true,
            },
          },
        },
        orderBy: { createdAt: "asc" }, // Oldest first
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({
        where: {
          accountStatus: "pending_approval",
          role: "client",
          clientProfile: {
            clientType: "lab",
          },
        },
      }),
    ]);

    // Calculate days pending for each lab
    const labsWithDetails = pendingLabs.map((lab) => {
      const daysPending = Math.floor(
        (new Date() - new Date(lab.createdAt)) / (1000 * 60 * 60 * 24)
      );

      return {
        userId: lab.id,
        email: lab.email,
        phoneNumber: lab.phoneNumber,
        emailVerified: lab.emailVerified,
        phoneVerified: lab.phoneVerified,
        lab: {
          name: lab.clientProfile.name,
          labName: lab.clientProfile.labName,
          labLicenseNumber: lab.clientProfile.labLicenseNumber,
          address: lab.clientProfile.labAddress,
          city: lab.clientProfile.city,
          state: lab.clientProfile.state,
          postalCode: lab.clientProfile.postalCode,
        },
        submittedAt: lab.createdAt,
        daysPending,
      };
    });

    logger.info("Pending lab approvals accessed", {
      adminId: req.user.id,
      adminName: req.user.profile.name,
      total,
    });

    res.json({
      success: true,
      data: {
        pendingLabs: labsWithDetails,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "listPendingLabApprovals",
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending approvals",
      errors: [],
    });
  }
};

/**
 * Approve lab registration
 * PUT /api/admin/labs/:userId/approve
 */
export const approveLabRegistration = async (req, res) => {
  try {
    // Only admins
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can approve registrations",
        errors: [],
      });
    }

    const { userId } = req.params;
    const { notes } = req.body;

    const labUserId = parseInt(userId);

    if (isNaN(labUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
        errors: [],
      });
    }

    // Get lab user
    const labUser = await prisma.user.findFirst({
      where: {
        id: labUserId,
        accountStatus: "pending_approval",
        role: "client",
      },
      include: {
        clientProfile: true,
      },
    });

    if (!labUser) {
      return res.status(404).json({
        success: false,
        message: "Lab registration not found or already processed",
        errors: [],
      });
    }

    if (labUser.clientProfile.clientType !== "lab") {
      return res.status(400).json({
        success: false,
        message: "User is not a lab account",
        errors: [],
      });
    }

    // Approve account
    const approvedUser = await prisma.user.update({
      where: { id: labUserId },
      data: { accountStatus: "active" },
      include: {
        clientProfile: true,
      },
    });

    // Send approval notification
    try {
      await createNotification({
        userId: labUserId,
        title: "Account Approved",
        message:
          "Your lab account has been approved. You can now login and start using the platform.",
        type: "account_approved",
      });
    } catch (notifError) {
      logger.error("Failed to create notification:", notifError);
    }

    // Send approval email
    try {
      await sendEmail({
        to: labUser.email,
        subject: "Lab Account Approved - GuideMe",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981; margin-bottom: 20px;">Account Approved!</h2>
            <p style="font-size: 16px; color: #333;">Dear ${labUser.clientProfile.name},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Great news! Your lab account for <strong>${labUser.clientProfile.labName}</strong> has been approved.
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              You can now login and start using the GuideMe platform.
            </p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://guideme.com'}/login" 
                 style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
                Login to Your Account
              </a>
            </div>
            ${
              notes
                ? `<div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #333;"><strong>Admin Notes:</strong></p>
                <p style="margin: 5px 0 0; color: #333;">${notes}</p>
              </div>`
                : ""
            }
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              If you have any questions, please don't hesitate to contact our support team.
            </p>
            <p style="font-size: 16px; color: #333; margin-top: 30px;">
              Best regards,<br>
              <strong>GuideMe Team</strong>
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      logger.error("Failed to send approval email:", {
        error: emailError.message,
        userId: labUserId,
      });
      // Don't fail the approval if email fails
    }

    logger.info("Lab registration approved", {
      labUserId,
      labName: labUser.clientProfile.labName,
      approvedBy: req.user.id,
      approvedByName: req.user.profile.name,
      notes: notes || "No notes",
    });

    res.json({
      success: true,
      message: "Lab registration approved successfully",
      data: {
        userId: approvedUser.id,
        email: approvedUser.email,
        accountStatus: approvedUser.accountStatus,
        labName: approvedUser.clientProfile.labName,
        approvedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "approveLabRegistration",
      userId: req.params?.userId,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to approve registration",
      errors: [],
    });
  }
};

/**
 * Reject lab registration
 * PUT /api/admin/labs/:userId/reject
 */
export const rejectLabRegistration = async (req, res) => {
  try {
    // Only admins
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can reject registrations",
        errors: [],
      });
    }

    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required (minimum 10 characters)",
        errors: ["reason: Minimum 10 characters required"],
      });
    }

    const labUserId = parseInt(userId);

    if (isNaN(labUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
        errors: [],
      });
    }

    // Get lab user
    const labUser = await prisma.user.findFirst({
      where: {
        id: labUserId,
        accountStatus: "pending_approval",
        role: "client",
      },
      include: {
        clientProfile: true,
      },
    });

    if (!labUser) {
      return res.status(404).json({
        success: false,
        message: "Lab registration not found or already processed",
        errors: [],
      });
    }

    if (labUser.clientProfile.clientType !== "lab") {
      return res.status(400).json({
        success: false,
        message: "User is not a lab account",
        errors: [],
      });
    }

    // Mark account as suspended (allows resubmission)
    await prisma.user.update({
      where: { id: labUserId },
      data: {
        accountStatus: "suspended",
      },
    });

    // Send rejection notification
    try {
      await createNotification({
        userId: labUserId,
        title: "Registration Rejected",
        message: `Your lab registration has been rejected. Reason: ${reason}`,
        type: "account_rejected",
      });
    } catch (notifError) {
      logger.error("Failed to create notification:", notifError);
    }

    // Send rejection email
    try {
      await sendEmail({
        to: labUser.email,
        subject: "Lab Registration Update - GuideMe",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #ef4444; margin-bottom: 20px;">Registration Update</h2>
            <p style="font-size: 16px; color: #333;">Dear ${labUser.clientProfile.name},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Thank you for your interest in GuideMe. Unfortunately, we cannot approve your lab registration at this time.
            </p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #333;"><strong>Reason:</strong></p>
              <p style="margin: 5px 0 0; color: #333;">${reason}</p>
            </div>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              If you believe this is an error or would like to provide additional information, please contact our support team.
            </p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://guideme.com'}/support" 
                 style="background-color: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
                Contact Support
              </a>
            </div>
            <p style="font-size: 16px; color: #333; margin-top: 30px;">
              Best regards,<br>
              <strong>GuideMe Team</strong>
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      logger.error("Failed to send rejection email:", {
        error: emailError.message,
        userId: labUserId,
      });
    }

    logger.warn("Lab registration rejected", {
      labUserId,
      labName: labUser.clientProfile.labName,
      reason,
      rejectedBy: req.user.id,
      rejectedByName: req.user.profile.name,
    });

    res.json({
      success: true,
      message: "Lab registration rejected",
      data: {
        userId: labUserId,
        email: labUser.email,
        labName: labUser.clientProfile.labName,
        rejectedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "rejectLabRegistration",
      userId: req.params?.userId,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to reject registration",
      errors: [],
    });
  }
};
