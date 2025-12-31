import crypto from "crypto";
import prisma from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH) || 6;
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS) || 3;
const OTP_RATE_LIMIT_MINUTES =
  parseInt(process.env.OTP_RATE_LIMIT_MINUTES) || 1;
const OTP_RATE_LIMIT_HOURLY = parseInt(process.env.OTP_RATE_LIMIT_HOURLY) || 5;

export const generateOtp = () => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return crypto.randomInt(min, max).toString();
};

export const checkRateLimit = async (identifier, channel) => {
  const oneMinuteAgo = new Date(
    Date.now() - OTP_RATE_LIMIT_MINUTES * 60 * 1000
  );
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentOtp = await prisma.otpCode.findFirst({
    where: {
      identifier,
      channel,
      createdAt: { gte: oneMinuteAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtp) {
    const waitSeconds = Math.ceil(
      (OTP_RATE_LIMIT_MINUTES * 60 * 1000 -
        (Date.now() - recentOtp.createdAt.getTime())) /
        1000
    );
    return {
      allowed: false,
      reason: "rate_limit_minute",
      waitSeconds,
      message: `Please wait ${waitSeconds} seconds before requesting another code`,
    };
  }

  const hourlyCount = await prisma.otpCode.count({
    where: {
      identifier,
      channel,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (hourlyCount >= OTP_RATE_LIMIT_HOURLY) {
    return {
      allowed: false,
      reason: "rate_limit_hourly",
      message: "Too many requests. Please try again later.",
    };
  }

  return { allowed: true };
};

export const createOtpRecord = async (identifier, channel, purpose, userId) => {
  await prisma.otpCode.updateMany({
    where: {
      identifier,
      channel,
      purpose,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
    data: { isUsed: true },
  });

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: {
      userId,
      identifier,
      code,
      channel,
      purpose,
      expiresAt,
      attempts: 0,
    },
  });

  return {
    code,
    expiresAt,
    expiresIn: OTP_EXPIRY_MINUTES * 60,
  };
};

export const verifyOtp = async (identifier, code, channel, purpose) => {
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      identifier,
      channel,
      purpose,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return {
      valid: false,
      reason: "not_found",
      message: "Invalid or expired verification code",
    };
  }

  if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    return {
      valid: false,
      reason: "max_attempts",
      message: "Too many failed attempts. Please request a new code.",
    };
  }

  if (otpRecord.code !== code) {
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    if (otpRecord.userId) {
      await prisma.user.update({
        where: { id: otpRecord.userId },
        data: {
          failedLoginAttempts: { increment: 1 },
          lastFailedLoginAt: new Date(),
        },
      });
    }

    const remainingAttempts = OTP_MAX_ATTEMPTS - otpRecord.attempts - 1;
    return {
      valid: false,
      reason: "invalid_code",
      message: `Invalid code. ${remainingAttempts} attempt${
        remainingAttempts !== 1 ? "s" : ""
      } remaining.`,
    };
  }

  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: {
      isUsed: true,
      usedAt: new Date(),
    },
  });

  if (otpRecord.userId) {
    await prisma.user.update({
      where: { id: otpRecord.userId },
      data: {
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
      },
    });
  }

  return { valid: true, otpRecord };
};

// TODO: Schedule this function to run periodically (e.g., daily)
export const cleanupExpiredOtps = async () => {
  const result = await prisma.otpCode.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
};
