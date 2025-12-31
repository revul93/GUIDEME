import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import { sendEmail } from "../../services/email.service.js";

/**
 * Send system announcement (Admin only)
 * Broadcast message to all users or specific user groups
 */
export const sendAnnouncement = async (req, res) => {
  try {
    // Only admins can send announcements
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can send announcements",
      });
    }

    const {
      subject,
      message,
      targetAudience = "all", // all, clients, designers, doctors, labs
      priority = "normal", // normal, high, urgent
      sendEmail: shouldSendEmail = false,
    } = req.body;

    // Validation
    if (!subject || subject.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Subject is required (min 3 characters)",
      });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message is required (min 10 characters)",
      });
    }

    const validAudiences = ["all", "clients", "designers", "doctors", "labs"];
    if (!validAudiences.includes(targetAudience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target audience",
        validAudiences,
      });
    }

    const validPriorities = ["normal", "high", "urgent"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
        validPriorities,
      });
    }

    // Get target users based on audience
    let targetUsers = [];

    if (targetAudience === "all") {
      // All users
      const [clients, designers] = await Promise.all([
        prisma.user.findMany({
          where: {
            role: "client",
            accountStatus: "active",
            deletedAt: null,
          },
          select: { id: true, email: true },
        }),
        prisma.user.findMany({
          where: {
            role: "designer",
            accountStatus: "active",
            deletedAt: null,
          },
          select: { id: true, email: true },
        }),
      ]);
      targetUsers = [...clients, ...designers];
    } else if (targetAudience === "clients") {
      // All clients (doctors + labs)
      targetUsers = await prisma.user.findMany({
        where: {
          role: "client",
          accountStatus: "active",
          deletedAt: null,
        },
        select: { id: true, email: true },
      });
    } else if (targetAudience === "designers") {
      // All designers
      targetUsers = await prisma.user.findMany({
        where: {
          role: "designer",
          accountStatus: "active",
          deletedAt: null,
        },
        select: { id: true, email: true },
      });
    } else if (targetAudience === "doctors") {
      // Only doctors
      const clientProfiles = await prisma.clientProfile.findMany({
        where: {
          clientType: "doctor",
          deletedAt: null,
        },
        select: { userId: true },
      });
      targetUsers = await prisma.user.findMany({
        where: {
          id: { in: clientProfiles.map((cp) => cp.userId) },
          accountStatus: "active",
          deletedAt: null,
        },
        select: { id: true, email: true },
      });
    } else if (targetAudience === "labs") {
      // Only labs
      const clientProfiles = await prisma.clientProfile.findMany({
        where: {
          clientType: "lab",
          deletedAt: null,
        },
        select: { userId: true },
      });
      targetUsers = await prisma.user.findMany({
        where: {
          id: { in: clientProfiles.map((cp) => cp.userId) },
          accountStatus: "active",
          deletedAt: null,
        },
        select: { id: true, email: true },
      });
    }

    if (targetUsers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active users found for the selected audience",
      });
    }

    // Send emails if requested
    let emailsSent = 0;
    let emailsFailed = 0;

    if (shouldSendEmail) {
      const emailPromises = targetUsers.map(async (user) => {
        try {
          await sendEmail({
            to: user.email,
            subject: `[${priority.toUpperCase()}] ${subject}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: ${
                  priority === "urgent"
                    ? "#dc2626"
                    : priority === "high"
                      ? "#f59e0b"
                      : "#3b82f6"
                }; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin: 0;">${subject}</h2>
                  ${
                    priority !== "normal"
                      ? `<p style="margin: 5px 0 0; font-size: 12px;">Priority: ${priority.toUpperCase()}</p>`
                      : ""
                  }
                </div>
                <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
                  <div style="white-space: pre-wrap; line-height: 1.6;">${message}</div>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 12px; color: #6b7280; margin: 0;">
                    This is an official announcement from GuideMe platform.<br>
                    Sent by: ${req.user.profile.name} (Admin)
                  </p>
                </div>
              </div>
            `,
          });
          emailsSent++;
        } catch (error) {
          logger.error("Failed to send announcement email:", {
            userId: user.id,
            email: user.email,
            error: error.message,
          });
          emailsFailed++;
        }
      });

      await Promise.allSettled(emailPromises);
    }

    logger.info("Announcement sent", {
      subject,
      targetAudience,
      priority,
      recipientCount: targetUsers.length,
      emailsSent,
      emailsFailed,
      sentBy: req.user.id,
      sentByName: req.user.profile.name,
    });

    res.json({
      success: true,
      message: "Announcement sent successfully",
      data: {
        announcement: {
          subject,
          message,
          targetAudience,
          priority,
          recipientCount: targetUsers.length,
        },
        email: shouldSendEmail
          ? {
              sent: emailsSent,
              failed: emailsFailed,
              total: targetUsers.length,
            }
          : null,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "sendAnnouncement",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to send announcement",
    });
  }
};
