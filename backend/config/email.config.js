import { createTransport } from "nodemailer";
import logger from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();
const createTransporter = () => {
  if (
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT
  ) {
    logger.error(
      "Email service is not configured. Set SMTP_USER in environment variables."
    );
    return null;
  }

  const emailConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  try {
    const transporter = createTransport(emailConfig);

    transporter.verify((error, success) => {
      if (error) {
        logger.error("Email configuration error:", error);
      } else {
        logger.info("Email server is ready to send messages");
      }
    });

    return transporter;
  } catch (error) {
    logger.error("Failed to create email transporter:", error);
    return null;
  }
};

const transporter = createTransporter();

export default transporter;
