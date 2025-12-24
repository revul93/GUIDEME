import prisma from "../../config/db.js";
import { generateAccessToken } from "../../utils/jwt.js";

export const handleLogin = async (req, identifier, channel) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phoneNumber: identifier }],
    },
    include: {
      clientProfile: true,
      designerProfile: true,
    },
  });

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found",
    };
  }

  if (user.accountStatus !== "active") {
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        success: false,
        failureReason: "Account is not active",
      },
    });
    return {
      success: false,
      statusCode: 403,
      message: `Account is ${user.accountStatus}`,
    };
  }

  if (user.isLocked) {
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        success: false,
        failureReason: "Account is locked",
      },
    });
    return {
      success: false,
      statusCode: 403,
      message: "Account is locked. Please contact support.",
    };
  }

  const updateData = {
    lastLoginAt: new Date(),
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
  };
  if (channel === "email") updateData.emailVerified = true;
  if (channel === "whatsapp") updateData.phoneVerified = true;

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  const profile =
    user.role === "client" ? user.clientProfile : user.designerProfile;

  const accessToken = generateAccessToken(
    user.id,
    user.email,
    user.role,
    profile.id
  );

  await prisma.loginHistory.create({
    data: {
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      success: true,
    },
  });

  return {
    success: true,
    statusCode: 200,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        profile,
      },
      accessToken,
    },
  };
};

export const handleFailedLogin = async (identifier, failureReason, req) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phoneNumber: identifier }],
    },
  });

  if (!user) {
    return;
  }

  const failedAttempts = user.failedLoginAttempts + 1;
  const maxAttempts = 5;
  const lockoutDuration = 30 * 60 * 1000;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: failedAttempts,
      lastFailedLoginAt: new Date(),
      ...(failedAttempts >= maxAttempts && {
        isLocked: true,
        lockedAt: new Date(),
        lockedUntil: new Date(Date.now() + lockoutDuration),
        lockReason: "Too many failed login attempts",
      }),
    },
  });

  await prisma.loginHistory.create({
    data: {
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      success: false,
      failureReason,
    },
  });
};
