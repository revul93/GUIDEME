import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../config/db.js";
import logger from "../utils/logger.js";

dotenv.config();

export const generateAccessToken = (userId, role, profileId) => {
  return jwt.sign(
    {
      userId,
      role,
      profileId,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "8h" }
  );
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error("Service error:", {
      message: "JWT verification failed",
      error: error.message,
      stack: error.stack,
      function: "verifyAccessToken",
      token: token?.substring(0, 20),
    });
    return null;
  }
};

export const blacklistToken = async (token, userId) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return false;
    }

    const expiresAt = new Date(decoded.exp * 1000);

    await prisma.tokenBlacklist.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return true;
  } catch (error) {
    logger.error("Service error:", {
      error: error.message,
      stack: error.stack,
      function: "blacklistToken",
      token: token?.substring(0, 20),
      userId,
    });
    return false;
  }
};

export const isTokenBlacklisted = async (token) => {
  try {
    const blacklisted = await prisma.tokenBlacklist.findUnique({
      where: { token },
    });

    return !!blacklisted;
  } catch (error) {
    logger.error("Service error:", {
      error: error.message,
      stack: error.stack,
      function: "isTokenBlacklisted",
      token: token?.substring(0, 20),
    });
    return false;
  }
};

// TODO: Schedule this function to run periodically (e.g., daily) to clean up expired tokens
export const cleanupExpiredTokens = async () => {
  try {
    const now = new Date();

    await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    return true;
  } catch (error) {
    logger.error("Service error:", {
      error: error.message,
      stack: error.stack,
      function: "cleanupExpiredTokens",
    });
    return false;
  }
};
