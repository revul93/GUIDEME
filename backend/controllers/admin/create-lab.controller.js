import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";
import { sendWelcomeEmail } from "../../services/email.service.js";

/**
 * Create lab account (Admin only)
 * Labs cannot self-register, only admins can create their accounts
 */
export const createLabAccount = async (req, res) => {
  try {
    // Only admins can create lab accounts
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create lab accounts",
      });
    }

    const {
      email,
      phoneNumber,
      name,
      labName,
      sendCredentials = true, // Whether to send login credentials via email
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

    if (!labName || labName.trim().length < 2) {
      errors.push("Lab name is required");
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

    // Create user with client role
    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber,
        role: "client",
        emailVerified: false, // Will be verified on first login
        phoneVerified: false,
        accountStatus: "active",
      },
    });

    // Create lab profile
    const profile = await prisma.clientProfile.create({
      data: {
        userId: user.id,
        clientType: "lab",
        name: name.trim(),
        labName: labName.trim(),
      },
    });

    // Send welcome email with login instructions
    if (sendCredentials) {
      try {
        await sendWelcomeEmail(email, labName);

        logger.info("Lab welcome email sent", {
          labId: profile.id,
          email,
          createdBy: req.user.id,
        });
      } catch (emailError) {
        logger.error("Failed to send lab welcome email:", {
          error: emailError.message,
          labId: profile.id,
        });
        // Don't fail the request if email fails
      }
    }

    logger.info("Lab account created by admin", {
      labId: profile.id,
      labName,
      createdBy: req.user.id,
      createdByName: req.user.profile.name,
    });

    res.status(201).json({
      success: true,
      message: "Lab account created successfully",
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
          clientType: profile.clientType,
          name: profile.name,
          labName: profile.labName,
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "createLabAccount",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to create lab account",
    });
  }
};
