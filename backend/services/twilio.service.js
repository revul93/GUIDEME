import twilio from "twilio";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient && accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
};

const whatsappMessages = {
  en: {
    otp: (code) =>
      `Your GuideMe verification code is: ${code}\n\nExpires in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes. Do not share this code.`,
  },
  ar: {
    otp: (code) =>
      `رمز التحقق الخاص بك في GuideMe هو: ${code}\n\nينتهي خلال ${process.env.OTP_EXPIRY_MINUTES || 5} دقائق. لا تشارك هذا الرمز.`,
  },
};

export const sendWhatsAppOtp = async (phoneNumber, code, language = "en") => {
  try {
    const client = getTwilioClient();
    if (!client) {
      return {
        success: false,
        error: "not_configured",
        message: "Whatsapp service is not configured",
      };
    }

    const messageTemplate =
      whatsappMessages[language]?.otp || whatsappMessages.en.otp;
    const messageText = messageTemplate(code);

    const message = await client.messages.create({
      body: messageText,
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${phoneNumber}`,
    });

    logger.info("WhatsApp OTP sent:", {
      to: phoneNumber,
      messageId: message.sid,
      status: message.status,
    });

    return { success: true, messageId: message.sid, status: message.status };
  } catch (error) {
    logger.error("Twilio WhatsApp error:", {
      code: error.code,
      message: error.message,
      to: phoneNumber,
    });

    // Handle specific Twilio errors
    if (error.code === 21211) {
      return {
        success: false,
        error: "invalid_phone",
        message: "Invalid phone number format",
      };
    }
    if (error.code === 21608) {
      return {
        success: false,
        error: "unverified_number",
        message: "Number not registered on WhatsApp",
      };
    }
    if (error.code === 21614) {
      return {
        success: false,
        error: "not_valid_whatsapp",
        message: "Not a valid WhatsApp number",
      };
    }

    return {
      success: false,
      error: "send_failed",
      message: "Failed to send WhatsApp message",
    };
  }
};

export const isChannelConfigured = (channel) => {
  if (channel === "whatsapp") {
    return !!(accountSid && authToken && whatsappNumber);
  }
  return false;
};

export default {
  sendWhatsAppOtp,
  isChannelConfigured,
};
