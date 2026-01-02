import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../config/db.js";
import logger from "../utils/logger.js";

dotenv.config();

/**
 * Generate access token for user
 * @param {string} userId - User ID
 * @param {string} role - User role (client, designer)
 * @param {string} profileId - Profile ID (clientProfile.id or designerProfile.id)
 */
export const generateAccessToken = (userId, role, profileId) => {
  return jwt.sign(
    {
      userId,
      role,
      profileId,
      type: "access",
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "8h" }
  );
};

/**
 * Verify access token
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token or null if invalid
 */
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate token type
    if (decoded.type !== "access") {
      logger.error("Invalid token type", { type: decoded.type });
      return null;
    }

    return decoded;
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

/**
 * Blacklist a token (for logout)
 * @param {string} token - JWT token to blacklist
 * @param {string} userId - User ID
 */
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

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token
 */
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

/**
 * Cleanup expired tokens from blacklist
 * Schedule this to run periodically (e.g., daily via cron)
 */
export const cleanupExpiredTokens = async () => {
  try {
    const now = new Date();

    const result = await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    logger.info(`Cleaned up ${result.count} expired tokens from blacklist`);
    return result.count;
  } catch (error) {
    logger.error("Service error:", {
      error: error.message,
      stack: error.stack,
      function: "cleanupExpiredTokens",
    });
    return false;
  }
};
