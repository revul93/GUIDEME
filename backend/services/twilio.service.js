import twilio from "twilio";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;
const fromName = process.env.SENDGRID_FROM_NAME || "GuideMe";

let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient && accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
};

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

const whatsappMessages = {
  en: (code) =>
    `Your GuideMe verification code is: ${code}\n\nExpires in 5 minutes. Do not share this code.`,
  ar: (code) =>
    `رمز التحقق الخاص بك في GuideMe هو: ${code}\n\nينتهي خلال 5 دقائق. لا تشارك هذا الرمز.`,
};

export const sendWhatsAppOtp = async (phoneNumber, code, language = "en") => {
  try {
    const client = getTwilioClient();
    if (!client) {
      return {
        success: false,
        error: "not_configured",
        message: "Twilio not configured",
      };
    }

    const messageText = whatsappMessages[language] || whatsappMessages.en;

    const message = await client.messages.create({
      body: messageText(code),
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${phoneNumber}`,
    });

    return { success: true, messageId: message.sid, status: message.status };
  } catch (error) {
    logger.error("Twilio WhatsApp error:", error.code);

    if (error.code === 21211) {
      return {
        success: false,
        error: "invalid_phone",
        message: "Invalid phone number",
      };
    }
    if (error.code === 21608) {
      return {
        success: false,
        error: "unverified_number",
        message: "Number not registered on WhatsApp",
      };
    }

    return {
      success: false,
      error: "send_failed",
      message: "Failed to send WhatsApp message",
    };
  }
};

const emailContent = {
  en: {
    subjects: {
      login: "Your GuideMe Login Code",
      register: "Welcome to GuideMe - Verify Your Email",
    },
    purposeText: {
      login: "sign in to your account",
      register: "complete your registration",
    },
    title: "Verification Code",
    useCode: "Use the following code to",
    expiresIn: "This code expires in <strong>5 minutes</strong>.",
    didntRequest: "If you didn't request this code, please ignore this email.",
    copyright: "All rights reserved.",
  },
  ar: {
    subjects: {
      login: "رمز تسجيل الدخول إلى GuideMe",
      register: "مرحباً بك في GuideMe - تحقق من بريدك الإلكتروني",
    },
    purposeText: {
      login: "تسجيل الدخول إلى حسابك",
      register: "إكمال التسجيل",
    },
    title: "رمز التحقق",
    useCode: "استخدم الرمز التالي لـ",
    expiresIn: "ينتهي هذا الرمز خلال <strong>5 دقائق</strong>.",
    didntRequest: "إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.",
    copyright: "جميع الحقوق محفوظة.",
  },
};

const buildOtpEmailTemplate = (code, purpose, language = "en") => {
  const content = emailContent[language] || emailContent.en;
  const action = content.purposeText[purpose] || content.purposeText.login;
  const dir = language === "ar" ? "rtl" : "ltr";
  const align = language === "ar" ? "right" : "left";

  return `
<!DOCTYPE html>
<html dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f4f4;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <tr>
      <td style="padding:40px 30px;text-align:center;background-color:#1a365d;">
        <h1 style="color:#ffffff;margin:0;font-size:28px;">GuideMe</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:40px 30px;text-align:${align};">
        <h2 style="color:#333333;margin:0 0 20px;font-size:24px;">${
          content.title
        }</h2>
        <p style="color:#666666;font-size:16px;line-height:1.6;margin:0 0 30px;">
          ${content.useCode} ${action}:
        </p>
        <div style="background-color:#f8f9fa;border-radius:8px;padding:25px;text-align:center;margin-bottom:30px;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a365d;">${code}</span>
        </div>
        <p style="color:#666666;font-size:14px;line-height:1.6;margin:0 0 10px;">
          ${content.expiresIn}
        </p>
        <p style="color:#999999;font-size:14px;line-height:1.6;margin:0;">
          ${content.didntRequest}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:30px;text-align:center;background-color:#f8f9fa;border-top:1px solid #eeeeee;">
        <p style="color:#999999;font-size:12px;margin:0;">
          © ${new Date().getFullYear()} GuideMe. ${content.copyright}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendEmailOtp = async (
  email,
  code,
  purpose = "login",
  language = "en"
) => {
  try {
    if (!sendgridApiKey || !fromEmail) {
      return {
        success: false,
        error: "not_configured",
        message: "Email service not configured",
      };
    }

    const content = emailContent[language] || emailContent.en;

    const msg = {
      to: email,
      from: { email: fromEmail, name: fromName },
      subject: content.subjects[purpose] || content.subjects.login,
      text: whatsappMessages[language](code),
      html: buildOtpEmailTemplate(code, purpose, language),
    };

    const response = await sgMail.send(msg);
    return {
      success: true,
      messageId: response[0]?.headers?.["x-message-id"],
      status: "sent",
    };
  } catch (error) {
    logger.error("SendGrid error:", error.code);

    if (error.response?.body?.errors) {
      const sgError = error.response.body.errors[0];
      return {
        success: false,
        error: sgError.field || "send_failed",
        message: sgError.message,
      };
    }

    return {
      success: false,
      error: "send_failed",
      message: "Failed to send email",
    };
  }
};

export const sendOtp = async (
  identifier,
  code,
  channel,
  purpose,
  language = "en"
) => {
  if (channel === "whatsapp") {
    return sendWhatsAppOtp(identifier, code, language);
  } else if (channel === "email") {
    return sendEmailOtp(identifier, code, purpose, language);
  }

  return {
    success: false,
    error: "invalid_channel",
    message: "Invalid channel",
  };
};

export const isChannelConfigured = (channel) => {
  if (channel === "whatsapp") {
    return !!(accountSid && authToken && whatsappNumber);
  }
  if (channel === "email") {
    return !!(sendgridApiKey && fromEmail);
  }
  return false;
};
