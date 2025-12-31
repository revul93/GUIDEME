import transporter from "../config/email.config.js";
import logger from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES);
const FRONTEND_URL = process.env.FRONTEND_URL;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME;
const SMTP_USER = process.env.SMTP_USER;

export const isEmailConfigured = () => {
  return !!transporter;
};

const baseEmailOptions = {
  from: `${EMAIL_FROM_NAME} <${SMTP_USER}>`,
};

export const sendEmail = async (mailOptions) => {
  if (!isEmailConfigured()) {
    logger.error("Email transporter not configured. Email content:", {
      to: mailOptions.to,
      subject: mailOptions.subject,
    });
    return { success: false, error: "Email service not configured" };
  }

  try {
    const info = await transporter.sendMail({
      ...baseEmailOptions,
      ...mailOptions,
    });

    logger.info("Email sent successfully:", {
      to: mailOptions.to,
      subject: mailOptions.subject,
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error("Failed to send email:", {
      error: error.message,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    return { success: false, error: error.message };
  }
};

const buildEmailTemplate = (content, language = "en") => {
  const dir = language === "ar" ? "rtl" : "ltr";
  const align = language === "ar" ? "right" : "left";
  const fontFamily =
    language === "ar"
      ? "'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif"
      : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

  return `
<!DOCTYPE html>
<html dir="${dir}" lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: ${fontFamily};
      background-color: #f4f4f4;
      direction: ${dir};
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: #02172B;
      color: #FFFBF5;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: #FFFBF5;
      padding: 30px;
      text-align: ${align};
    }
    .content h2 {
      color: #333;
      margin: 0 0 20px;
      font-size: 24px;
    }
    .content p {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 15px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #4CAF6E;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 500;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
      background: #f8f9fa;
      border-top: 1px solid #eeeeee;
    }
    .otp-box {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 25px;
      text-align: center;
      margin: 20px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #02172B;
    }
    .info-box {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
    }
    .warning {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 20px;
    }
    ul {
      text-align: ${align};
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
    <tr>
      <td>
        <div class="container">
          <div class="header">
            <h1>GuideMe</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} GuideMe. ${
              language === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"
            }.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const messages = {
  en: {
    welcome: {
      subject: "Welcome to GuideMe - Your Dental Guide Platform",
      greeting: (name) => `Hello ${name},`,
      intro:
        "Thank you for joining GuideMe - your trusted platform for dental surgical guide design.",
      excited: "We're excited to have you on board! Here's what you can do:",
      features: [
        "Submit new cases with ease",
        "Track your case progress in real-time",
        "Communicate with our expert designers",
        "Manage your payments and invoices",
      ],
      buttonText: "Go to Dashboard",
      outro:
        "If you have any questions, feel free to reach out to our support team.",
      signature: "Best regards,<br>The GuideMe Team",
    },
    otp: {
      subject: (purpose) =>
        purpose === "register"
          ? "Welcome to GuideMe - Verify Your Email"
          : "GuideMe Verification Code",
      title: "Verification Code",
      greeting: (name) => `Hello ${name || ""},`,
      body: "Your verification code is:",
      expiry: `This code will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
      warning:
        "⚠️ Never share this code with anyone. GuideMe will never ask for your verification code.",
    },
    caseStatus: {
      subject: (caseNumber) => `Case ${caseNumber} - Status Update`,
      greeting: (name) => `Hello ${name},`,
      statusMessages: {
        submitted: "Your case has been submitted and is pending review.",
        study_in_progress:
          "Great news! Our designer has started working on your case study.",
        study_completed:
          "Your case study has been completed. Please review the quote.",
        quote_sent: "A quote has been sent for your case. Please review it.",
        in_production: "Your case is now in production.",
        production_completed: "Your case production has been completed.",
        ready_for_pickup: "Your case is ready for pickup.",
        delivered: "Your case has been delivered.",
        completed: "Your case has been completed successfully.",
      },
      caseInfo: "Case Information:",
      buttonText: "View Case Details",
      outro:
        "You can view the full case details and any comments from our design team in your dashboard.",
      signature: "Best regards,<br>The GuideMe Team",
    },
    comment: {
      subject: (caseNumber) => `New Comment on Case ${caseNumber}`,
      title: "New Comment",
      body: (commenterName, caseNumber) =>
        `<strong>${commenterName}</strong> has added a comment to case <strong>${caseNumber}</strong>:`,
      buttonText: "View & Reply",
    },
  },
  ar: {
    welcome: {
      subject: "مرحباً بك في GuideMe - منصة الأدلة الجراحية للأسنان",
      greeting: (name) => `مرحباً ${name}،`,
      intro:
        "شكراً لانضمامك إلى GuideMe - منصتك الموثوقة لتصميم الأدلة الجراحية للأسنان.",
      excited: "نحن متحمسون لوجودك معنا! إليك ما يمكنك القيام به:",
      features: [
        "إرسال حالات جديدة بسهولة",
        "تتبع تقدم حالتك في الوقت الفعلي",
        "التواصل مع مصممينا الخبراء",
        "إدارة مدفوعاتك وفواتيرك",
      ],
      buttonText: "الذهاب إلى لوحة التحكم",
      outro: "إذا كان لديك أي أسئلة، لا تتردد في التواصل مع فريق الدعم لدينا.",
      signature: "مع أطيب التحيات،<br>فريق GuideMe",
    },
    otp: {
      subject: (purpose) =>
        purpose === "register"
          ? "مرحباً بك في GuideMe - تحقق من بريدك الإلكتروني"
          : "رمز التحقق من GuideMe",
      title: "رمز التحقق",
      greeting: (name) => `مرحباً ${name || ""},`,
      body: "رمز التحقق الخاص بك هو:",
      expiry: `ينتهي هذا الرمز خلال ${OTP_EXPIRY_MINUTES} دقائق.`,
      warning:
        "⚠️ لا تشارك هذا الرمز مع أي شخص. لن يطلب منك GuideMe أبداً رمز التحقق الخاص بك.",
    },
    caseStatus: {
      subject: (caseNumber) => `الحالة ${caseNumber} - تحديث الحالة`,
      greeting: (name) => `مرحباً ${name}،`,
      statusMessages: {
        submitted: "تم إرسال حالتك وهي في انتظار المراجعة.",
        study_in_progress: "أخبار رائعة! بدأ مصممنا العمل على دراسة حالتك.",
        study_completed: "تم الانتهاء من دراسة حالتك. يرجى مراجعة العرض.",
        quote_sent: "تم إرسال عرض سعر لحالتك. يرجى مراجعته.",
        in_production: "حالتك قيد الإنتاج الآن.",
        production_completed: "تم الانتهاء من إنتاج حالتك.",
        ready_for_pickup: "حالتك جاهزة للاستلام.",
        delivered: "تم تسليم حالتك.",
        completed: "تم إكمال حالتك بنجاح.",
      },
      caseInfo: "معلومات الحالة:",
      buttonText: "عرض تفاصيل الحالة",
      outro:
        "يمكنك عرض تفاصيل الحالة الكاملة وأي تعليقات من فريق التصميم لدينا في لوحة التحكم.",
      signature: "مع أطيب التحيات،<br>فريق GuideMe",
    },
    comment: {
      subject: (caseNumber) => `تعليق جديد على الحالة ${caseNumber}`,
      title: "تعليق جديد",
      body: (commenterName, caseNumber) =>
        `<strong>${commenterName}</strong> أضاف تعليقاً على الحالة <strong>${caseNumber}</strong>:`,
      buttonText: "عرض والرد",
    },
  },
};

export const sendWelcomeEmail = async (to, name, language = "en") => {
  const msg = messages[language]?.welcome || messages.en.welcome;

  const content = `
    <h2>${msg.greeting(name)}</h2>
    <p>${msg.intro}</p>
    <p>${msg.excited}</p>
    <ul>
      ${msg.features.map((feature) => `<li>${feature}</li>`).join("")}
    </ul>
    <a href="${FRONTEND_URL}/dashboard" class="button">${msg.buttonText}</a>
    <p>${msg.outro}</p>
    <p>${msg.signature}</p>
  `;

  const mailOptions = {
    to,
    subject: msg.subject,
    html: buildEmailTemplate(content, language),
  };

  return await sendEmail(mailOptions);
};

// 2. OTP Email
export const sendOTPEmail = async (
  to,
  otp,
  purpose = "login",
  userName = "",
  language = "en"
) => {
  const msg = messages[language]?.otp || messages.en.otp;

  const content = `
    <h2>${msg.title}</h2>
    <p>${msg.greeting(userName)}</p>
    <p>${msg.body}</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
    </div>
    <p>${msg.expiry}</p>
    <p class="warning">${msg.warning}</p>
  `;

  const mailOptions = {
    to,
    subject: msg.subject(purpose),
    html: buildEmailTemplate(content, language),
  };

  return await sendEmail(mailOptions);
};

// 3. Case Status Update Email
export const sendCaseStatusEmail = async (
  to,
  caseData,
  newStatus,
  language = "en"
) => {
  const msg = messages[language]?.caseStatus || messages.en.caseStatus;
  const statusMessage =
    msg.statusMessages[newStatus] || "Your case status has been updated.";

  const content = `
    <h2>${msg.greeting(caseData.clientProfile?.name || "")}</h2>
    <p>${statusMessage}</p>
    <div class="info-box">
      <strong>${msg.caseInfo}</strong><br><br>
      <strong>${language === "ar" ? "رقم الحالة" : "Case Number"}:</strong> ${
        caseData.caseNumber
      }<br>
      <strong>${language === "ar" ? "الحالة" : "Status"}:</strong> ${newStatus
        .replace(/_/g, " ")
        .toUpperCase()}<br>
      <strong>${language === "ar" ? "الإجراء" : "Procedure"}:</strong> ${
        caseData.procedureCategory
      }
    </div>
    <a href="${FRONTEND_URL}/dashboard/cases/${
      caseData.id
    }" class="button">${msg.buttonText}</a>
    <p>${msg.outro}</p>
    <p>${msg.signature}</p>
  `;

  const mailOptions = {
    to,
    subject: msg.subject(caseData.caseNumber),
    html: buildEmailTemplate(content, language),
  };

  return await sendEmail(mailOptions);
};

// 4. New Comment Notification
export const sendNewCommentEmail = async (
  to,
  caseData,
  comment,
  commenterName,
  language = "en"
) => {
  const msg = messages[language]?.comment || messages.en.comment;

  const content = `
    <h2>${msg.title}</h2>
    <p>${msg.body(commenterName, caseData.caseNumber)}</p>
    <div class="info-box" style="border-left: 4px solid #4CAF6E;">
      ${comment}
    </div>
    <a href="${FRONTEND_URL}/dashboard/cases/${caseData.id}" class="button">${msg.buttonText}</a>
  `;

  const mailOptions = {
    to,
    subject: msg.subject(caseData.caseNumber),
    html: buildEmailTemplate(content, language),
  };

  return await sendEmail(mailOptions);
};

// 5. Payment Receipt Email (keeping for future frontend implementation)
export const sendPaymentReceiptEmail = async (
  to,
  paymentData,
  language = "en"
) => {
  const content = `
    <h2>${language === "ar" ? "إيصال الدفع" : "Payment Receipt"}</h2>
    <p>${
      language === "ar" ? "شكراً لك على دفعتك!" : "Thank you for your payment!"
    }</p>
    <div class="info-box">
      <strong>${language === "ar" ? "رقم الإيصال" : "Receipt Number"}:</strong> ${
        paymentData.paymentNumber
      }<br>
      <strong>${language === "ar" ? "رقم الحالة" : "Case Number"}:</strong> ${
        paymentData.case?.caseNumber
      }<br>
      <strong>${language === "ar" ? "التاريخ" : "Date"}:</strong> ${new Date(
        paymentData.createdAt
      ).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}<br>
      <strong>${language === "ar" ? "طريقة الدفع" : "Payment Method"}:</strong> ${
        paymentData.paymentMethod
      }<br>
      <strong>${language === "ar" ? "المبلغ" : "Amount"}:</strong> ${
        paymentData.amount
      } ${paymentData.currency || "SAR"}
    </div>
    <p style="font-size: 14px; color: #666;">
      ${
        language === "ar"
          ? "سيتم مراجعة دفعتك من قبل فريقنا وستتلقى تأكيداً قريباً."
          : "Your payment will be reviewed by our team and you will receive confirmation shortly."
      }
    </p>
  `;

  const mailOptions = {
    to,
    subject:
      language === "ar"
        ? `إيصال الدفع - الحالة ${paymentData.case?.caseNumber}`
        : `Payment Receipt - Case ${paymentData.case?.caseNumber}`,
    html: buildEmailTemplate(content, language),
  };

  return await sendEmail(mailOptions);
};

// 6. Case Submission Notification (for designers)
export const sendCaseSubmissionEmail = async (
  to,
  caseData,
  designerName,
  language = "en"
) => {
  const content = `
    <h2>${
      language === "ar" ? `مرحباً ${designerName},` : `Hello ${designerName},`
    }</h2>
    <p>${
      language === "ar"
        ? "تم إرسال حالة جديدة"
        : "A new case has been submitted"
    }</p>
    <div class="info-box">
      <strong>${language === "ar" ? "رقم الحالة" : "Case Number"}:</strong> ${
        caseData.caseNumber
      }<br>
      <strong>${language === "ar" ? "العميل" : "Client"}:</strong> ${
        caseData.clientProfile?.name
      }<br>
      <strong>${language === "ar" ? "الإجراء" : "Procedure"}:</strong> ${
        caseData.procedureCategory
      }<br>
      <strong>${language === "ar" ? "نوع الخدمة" : "Service Type"}:</strong> ${
        caseData.requiredService
      }<br>
      <strong>${language === "ar" ? "تاريخ الإرسال" : "Submitted"}:</strong> ${new Date(
        caseData.submittedAt
      ).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
    </div>
    <a href="${FRONTEND_URL}/designer/cases/${caseData.id}" class="button">${
      language === "ar" ? "مراجعة الحالة" : "Review Case"
    }</a>
    <p>${
      language === "ar"
        ? "يرجى مراجعة تفاصيل الحالة وقبول أو رفض المهمة."
        : "Please review the case details and accept or reject the assignment."
    }</p>
  `;

  const mailOptions = {
    to,
    subject:
      language === "ar"
        ? `حالة جديدة - ${caseData.caseNumber}`
        : `New Case Submission - ${caseData.caseNumber}`,
    html: buildEmailTemplate(content, language),
  };

  return await sendEmail(mailOptions);
};

export default {
  isEmailConfigured,
  sendWelcomeEmail,
  sendOTPEmail,
  sendCaseStatusEmail,
  sendNewCommentEmail,
  sendPaymentReceiptEmail,
  sendCaseSubmissionEmail,
};
