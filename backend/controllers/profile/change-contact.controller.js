import prisma from "../../config/db.js";
import {
  checkRateLimit,
  createOtpRecord,
  verifyOtp,
} from "../../services/otp.service.js";
import { sendOtp, isChannelConfigured } from "../../services/twilio.service.js";
import logger from "../../utils/logger.js";

export const requestContactChange = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const { contactType, newContact } = req.body;

    if (!contactType || !newContact) {
      return res.status(400).json({
        success: false,
        message: "Please provide contactType and newContact",
      });
    }

    if (!["email", "phone"].includes(contactType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contactType. Use 'email' or 'phone'",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const oldContact = contactType === "email" ? user.email : user.phoneNumber;

    if (!oldContact) {
      return res.status(400).json({
        success: false,
        message: `No existing ${contactType} to verify`,
      });
    }

    if (oldContact === newContact) {
      return res.status(400).json({
        success: false,
        message: `New ${contactType} must be different from current ${contactType}`,
      });
    }

    if (contactType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newContact)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      const existingEmail = await prisma.user.findUnique({
        where: { email: newContact },
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "This email is already in use",
        });
      }
    }

    if (contactType === "phone") {
      const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber: newContact },
      });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "This phone number is already in use",
        });
      }
    }

    const channel = contactType === "email" ? "email" : "whatsapp";

    if (!isChannelConfigured(channel)) {
      return res.status(503).json({
        success: false,
        message: `${channel} service is not configured`,
      });
    }

    const oldRateLimit = await checkRateLimit(oldContact, channel);
    if (!oldRateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: oldRateLimit.message,
        waitSeconds: oldRateLimit.waitSeconds,
      });
    }

    const { code: oldCode, expiresIn } = await createOtpRecord(
      oldContact,
      channel,
      "login",
      user.id
    );

    const oldSendResult = await sendOtp(oldContact, oldCode, channel, "login");

    if (!oldSendResult.success) {
      return res.status(500).json({
        success: false,
        message: `Failed to send verification code to current ${contactType}`,
        error: oldSendResult.error,
      });
    }

    res.status(200).json({
      success: true,
      message: `Verification code sent to your current ${contactType}`,
      data: {
        step: "verify_old",
        contactType,
        channel,
        expiresIn,
        maskedContact:
          contactType === "email"
            ? oldContact.replace(/(.{2})(.*)(@.*)/, "$1***$3")
            : oldContact.replace(/(\+\d{3})(\d+)(\d{4})/, "$1****$3"),
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "requestContactChange",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to request contact change",
    });
  }
};

export const verifyOldContact = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const { contactType, code, newContact } = req.body;

    if (!contactType || !code || !newContact) {
      return res.status(400).json({
        success: false,
        message: "Please provide contactType, code, and newContact",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const oldContact = contactType === "email" ? user.email : user.phoneNumber;
    const channel = contactType === "email" ? "email" : "whatsapp";

    const verification = await verifyOtp(oldContact, code, channel, "login");

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
        reason: verification.reason,
      });
    }

    const newRateLimit = await checkRateLimit(newContact, channel);
    if (!newRateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: newRateLimit.message,
        waitSeconds: newRateLimit.waitSeconds,
      });
    }

    const { code: newCode, expiresIn } = await createOtpRecord(
      newContact,
      channel,
      "login",
      user.id
    );

    const newSendResult = await sendOtp(newContact, newCode, channel, "login");

    if (!newSendResult.success) {
      return res.status(500).json({
        success: false,
        message: `Failed to send verification code to new ${contactType}`,
        error: newSendResult.error,
      });
    }

    res.status(200).json({
      success: true,
      message: `Verification code sent to your new ${contactType}`,
      data: {
        step: "verify_new",
        contactType,
        channel,
        expiresIn,
        maskedContact:
          contactType === "email"
            ? newContact.replace(/(.{2})(.*)(@.*)/, "$1***$3")
            : newContact.replace(/(\+\d{3})(\d+)(\d{4})/, "$1****$3"),
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "verifyOldContact",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to verify old contact",
    });
  }
};

export const verifyNewContact = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const { contactType, code, newContact } = req.body;

    if (!contactType || !code || !newContact) {
      return res.status(400).json({
        success: false,
        message: "Please provide contactType, code, and newContact",
      });
    }

    const channel = contactType === "email" ? "email" : "whatsapp";

    const verification = await verifyOtp(newContact, code, channel, "login");

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
        reason: verification.reason,
      });
    }

    const updateData = {};
    if (contactType === "email") {
      updateData.email = newContact;
      updateData.emailVerified = true;
    } else {
      updateData.phoneNumber = newContact;
      updateData.phoneVerified = true;
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: `${contactType === "email" ? "Email" : "Phone number"} updated successfully`,
      data: {
        [contactType]: newContact,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "verifyNewContact",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to verify new contact",
    });
  }
};
