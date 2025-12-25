import { verifyAccessToken, isTokenBlacklisted } from "../utils/jwt.js";
import prisma from "../config/db.js";
import logger from "../utils/logger.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked",
      });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid token type",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        accountStatus: true,
        isLocked: true,
        deletedAt: true,
        clientProfile: {
          select: {
            id: true,
            name: true,
            clientType: true,
          },
        },
        designerProfile: {
          select: {
            id: true,
            name: true,
            isAdmin: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.accountStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.accountStatus}`,
      });
    }

    if (user.isLocked) {
      return res.status(403).json({
        success: false,
        message: "Account is locked",
      });
    }

    if (user.deletedAt) {
      return res.status(403).json({
        success: false,
        message: "Account has been deleted",
      });
    }

    if (user.role === "client") {
      req.user = { ...user, profile: user.clientProfile };
    } else if (user.role === "designer") {
      req.user = { ...user, profile: user.designerProfile };
    } else {
      req.user = user;
    }

    req.token = token;
    next();
  } catch (error) {
    logger.error("Middleware error:", {
      error: error.message,
      stack: error.stack,
      middleware: "authenticate",
      url: req.url,
      method: req.method,
    });
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};
