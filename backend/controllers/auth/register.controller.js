import prisma from "../../config/db.js";
import { generateAccessToken } from "../../utils/jwt.js";
import { sendWelcomeNotification } from "../../services/notification.service.js";
import logger from "../../utils/logger.js";

export const handleRegister = async (req, data) => {
  const {
    email,
    phoneNumber,
    channel,
    name,
    specialty,
    specialtyOther,
    clinicName,
  } = data;

  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  } else if (name.trim().length > 100) {
    errors.push("Name must be less than 100 characters");
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
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    if (!phoneRegex.test(phoneNumber)) {
      errors.push("Invalid phone number format");
    }
  }

  const validSpecialties = [
    "GENERAL_DENTISTRY",
    "ORTHODONTICS",
    "PERIODONTICS",
    "ENDODONTICS",
    "PROSTHODONTICS",
    "ORAL_SURGERY",
    "PEDIATRIC_DENTISTRY",
    "COSMETIC_DENTISTRY",
    "IMPLANTOLOGY",
    "ORAL_PATHOLOGY",
    "OTHER",
  ];

  if (specialty && !validSpecialties.includes(specialty)) {
    errors.push("Invalid specialty");
  }

  if (specialty === "OTHER" && !specialtyOther) {
    errors.push("Please specify your specialty");
  }

  if (errors.length > 0) {
    return {
      success: false,
      statusCode: 400,
      message: "Validation failed",
      errors,
    };
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber,
        role: "client",
        emailVerified: channel === "email",
        phoneVerified: channel === "whatsapp",
        accountStatus: "active",
        preferredLanguage: "en",
        timezone: "Asia/Riyadh",
        notificationPreferences: {
          email: true,
          whatsapp: false,
          web: true,
        },
      },
    });

    const profile = await prisma.clientProfile.create({
      data: {
        userId: user.id,
        clientType: "doctor",
        name: name.trim(),
        specialty,
        specialtyOther,
        clinicName,
      },
    });

    const accessToken = generateAccessToken(user.id, user.role, profile.id);

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        success: true,
      },
    });

    sendWelcomeNotification(
      user.id,
      user.email,
      profile.name,
      user.preferredLanguage
    ).catch((error) => {
      logger.error("Failed to send welcome notification:", {
        error: error.message,
        userId: user.id,
        email: user.email,
      });
    });

    return {
      success: true,
      statusCode: 201,
      message: "Registration successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          preferredLanguage: user.preferredLanguage,
          profile,
        },
        accessToken,
      },
    };
  } catch (error) {
    logger.error("Registration error:", {
      error: error.message,
      stack: error.stack,
      email,
      phoneNumber,
    });

    return {
      success: false,
      statusCode: 500,
      message: "Registration failed",
      errors: ["An error occurred during registration. Please try again."],
    };
  }
};
