import {
  checkRateLimit,
  createOtpRecord,
  verifyOtp,
} from "../../services/otp.service.js";
import { sendOtpNotification } from "../../services/notification.service.js";
import { handleRegister } from "./register.controller.js";
import { handleLogin, handleFailedLogin } from "./login.controller.js";
import {
  validateOtpRequest,
  checkUserExistsForLogin,
  checkUserExistsForRegister,
} from "./validation.js";
import logger from "../../utils/logger.js";

// Check if channel is configured
const isChannelConfigured = (channel) => {
  if (channel === "email") {
    return !!(process.env.SMTP_HOST && process.env.SMTP_USER);
  }
  if (channel === "whatsapp") {
    return !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_NUMBER
    );
  }
  return false;
};

export const sendOtpHandler = async (req, res) => {
  try {
    const { identifier, channel, purpose, email, phoneNumber } = req.body;

    const validation = validateOtpRequest(identifier, channel, purpose);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    if (!isChannelConfigured(channel)) {
      return res.status(503).json({
        success: false,
        message: `${channel} service is not configured`,
      });
    }

    const rateLimit = await checkRateLimit(identifier, channel);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: rateLimit.message,
        waitSeconds: rateLimit.waitSeconds,
      });
    }

    let userId = null;
    let userName = "";
    let userLanguage = "en";

    if (purpose === "login") {
      const userCheck = await checkUserExistsForLogin(identifier);
      if (!userCheck.exists) {
        return res.status(userCheck.statusCode).json({
          success: false,
          message: userCheck.message,
        });
      }
      userId = userCheck.user.id;
      userName =
        userCheck.user.clientProfile?.name ||
        userCheck.user.designerProfile?.name ||
        "";
      userLanguage = userCheck.user.preferredLanguage || "en";
    }

    if (purpose === "register") {
      const userCheck = await checkUserExistsForRegister(email, phoneNumber);
      if (userCheck.exists) {
        return res.status(userCheck.statusCode).json({
          success: false,
          message: userCheck.message,
        });
      }
      userLanguage = "en";
    }

    const { code, expiresIn } = await createOtpRecord(
      identifier,
      channel,
      purpose,
      userId
    );

    const sendResult = await sendOtpNotification(
      userId,
      identifier,
      code,
      channel,
      purpose,
      userName,
      userLanguage
    );

    if (!sendResult.success) {
      return res.status(500).json({
        success: false,
        message: sendResult.message || `Failed to send OTP via ${channel}`,
        error: sendResult.error,
      });
    }

    res.status(200).json({
      success: true,
      message: `Verification code sent via ${channel}`,
      data: {
        channel,
        expiresIn,
        maskedIdentifier:
          channel === "email"
            ? identifier.replace(/(.{2})(.*)(@.*)/, "$1***$3")
            : identifier.replace(/(\+\d{3})(\d+)(\d{4})/, "$1****$3"),
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "sendOtpHandler",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

export const verifyOtpHandler = async (req, res) => {
  try {
    const {
      identifier,
      code,
      channel,
      purpose,
      name,
      email,
      phoneNumber,
      specialty,
      specialtyOther,
      clinicName,
    } = req.body;

    if (!identifier || !code || !channel || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Please provide identifier, code, channel, and purpose",
      });
    }

    const verification = await verifyOtp(identifier, code, channel, purpose);

    if (!verification.valid) {
      if (purpose === "login") {
        await handleFailedLogin(identifier, verification.reason, req);
      }

      return res.status(400).json({
        success: false,
        message: verification.message,
        reason: verification.reason,
      });
    }

    let result;

    if (purpose === "register") {
      result = await handleRegister(req, {
        email,
        phoneNumber,
        channel,
        name,
        specialty,
        specialtyOther,
        clinicName,
      });
    } else {
      result = await handleLogin(req, identifier, channel);
    }

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      ...(result.errors && { errors: result.errors }),
      ...(result.data && { data: result.data }),
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "verifyOtpHandler",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "OTP Verification failed",
    });
  }
};
