import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import { sendWelcomeEmail } from "../../services/email.service.js";

/**
 * Create designer account (Admin only)
 * Designers cannot self-register, only admins can create their accounts
 * First admin is created manually in database, subsequent admins promoted by existing admins
 */
export const createDesignerAccount = async (req, res) => {
  try {
    // Only admins can create designer accounts
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create designer accounts",
      });
    }

    const {
      email,
      phoneNumber,
      name,
      specialization,
      experienceYears,
      bio,
      isAdmin = false, // Whether to create as admin (default: regular designer)
      sendCredentials = true,
    } = req.body;

    // Validation
    const errors = [];

    if (!name || name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    if (!email) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Invalid email format");
      }
    }

    if (!phoneNumber) {
      errors.push("Phone number is required");
    } else {
      const phoneRegex = /^\+966[0-9]{9}$/;
      if (!phoneRegex.test(phoneNumber)) {
        errors.push("Phone number must be in format: +966XXXXXXXXX");
      }
    }

    if (experienceYears !== undefined) {
      const years = parseInt(experienceYears);
      if (isNaN(years) || years < 0 || years > 50) {
        errors.push("Experience years must be between 0 and 50");
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    // Create user with designer role
    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber,
        role: "designer",
        emailVerified: false, // Will be verified on first login
        phoneVerified: false,
        accountStatus: "active",
      },
    });

    // Create designer profile
    const profile = await prisma.designerProfile.create({
      data: {
        userId: user.id,
        name: name.trim(),
        specialization: specialization?.trim() || null,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        bio: bio?.trim() || null,
        isAdmin: isAdmin === true,
      },
    });

    // Send welcome email with login instructions
    if (sendCredentials) {
      try {
        await sendWelcomeEmail(email, name);

        logger.info("Designer welcome email sent", {
          designerId: profile.id,
          email,
          isAdmin,
          createdBy: req.user.id,
        });
      } catch (emailError) {
        logger.error("Failed to send designer welcome email:", {
          error: emailError.message,
          designerId: profile.id,
        });
        // Don't fail the request if email fails
      }
    }

    logger.info("Designer account created by admin", {
      designerId: profile.id,
      designerName: name,
      isAdmin,
      createdBy: req.user.id,
      createdByName: req.user.profile.name,
    });

    res.status(201).json({
      success: true,
      message: `${isAdmin ? "Admin designer" : "Designer"} account created successfully`,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          accountStatus: user.accountStatus,
        },
        profile: {
          id: profile.id,
          name: profile.name,
          specialization: profile.specialization,
          experienceYears: profile.experienceYears,
          bio: profile.bio,
          isAdmin: profile.isAdmin,
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "createDesignerAccount",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to create designer account",
    });
  }
};

/**
 * Promote designer to admin or demote admin to designer
 */
export const updateDesignerAdminStatus = async (req, res) => {
  try {
    // Only admins can promote/demote
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can change admin status",
      });
    }

    const { id } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAdmin must be true or false",
      });
    }

    const designerProfileId = parseInt(id);

    // Get designer profile
    const designerProfile = await prisma.designerProfile.findUnique({
      where: { id: designerProfileId },
      include: {
        user: true,
      },
    });

    if (!designerProfile || designerProfile.user.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Designer not found",
      });
    }

    // Prevent demoting yourself if you're the only admin
    if (!isAdmin && designerProfile.id === req.user.profile.id) {
      const adminCount = await prisma.designerProfile.count({
        where: {
          isAdmin: true,
          deletedAt: null,
        },
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot demote yourself. At least one admin must remain in the system",
        });
      }
    }

    // Update admin status
    const updatedProfile = await prisma.designerProfile.update({
      where: { id: designerProfileId },
      data: { isAdmin },
    });

    // Send notification email
    try {
      await sendEmail({
        to: designerProfile.user.email,
        subject: isAdmin
          ? "You've been promoted to Admin"
          : "Admin privileges removed",
        html: `
          <h2>Account Status Update</h2>
          <p>Dear ${designerProfile.name},</p>
          <p>${
            isAdmin
              ? "Congratulations! You have been promoted to Admin on GuideMe platform."
              : "Your admin privileges have been removed. You will continue to work as a Designer."
          }</p>
          
          ${
            isAdmin
              ? `
          <h3>Admin Privileges:</h3>
          <ul>
            <li>Verify payments</li>
            <li>Create and revise quotes</li>
            <li>Process refunds</li>
            <li>Create lab and designer accounts</li>
            <li>Manage users</li>
          </ul>
          `
              : `
          <h3>Designer Capabilities:</h3>
          <ul>
            <li>View all cases</li>
            <li>Update case status</li>
            <li>Add comments to cases</li>
          </ul>
          `
          }
          
          <p>This change was made by: ${req.user.profile.name}</p>
          
          <p>Best regards,<br>GuideMe Team</p>
        `,
      });
    } catch (emailError) {
      logger.error("Failed to send admin status change email:", {
        error: emailError.message,
        designerId: designerProfile.id,
      });
    }

    logger.info("Designer admin status updated", {
      designerId: designerProfile.id,
      designerName: designerProfile.name,
      isAdmin,
      updatedBy: req.user.id,
      updatedByName: req.user.profile.name,
    });

    res.json({
      success: true,
      message: isAdmin
        ? "Designer promoted to admin successfully"
        : "Designer demoted to regular designer",
      data: {
        profile: {
          id: updatedProfile.id,
          name: updatedProfile.name,
          isAdmin: updatedProfile.isAdmin,
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "updateDesignerAdminStatus",
      userId: req.user?.id,
      designerId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to update admin status",
    });
  }
};
