import prisma from "../../config/db.js";

export const validateOtpRequest = (identifier, channel, purpose) => {
  if (!identifier || !channel || !purpose) {
    return {
      valid: false,
      message: "Please provide identifier, channel, and purpose",
    };
  }

  if (!["email", "whatsapp"].includes(channel)) {
    return {
      valid: false,
      message: "Invalid channel. Use 'email' or 'whatsapp'",
    };
  }

  if (!["login", "register"].includes(purpose)) {
    return {
      valid: false,
      message: "Invalid purpose",
    };
  }

  return { valid: true };
};

export const checkUserExistsForLogin = async (identifier) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phoneNumber: identifier }],
    },
  });

  if (!user) {
    return {
      exists: false,
      statusCode: 404,
      message: "No account found with this email or phone number",
    };
  }

  if (user.accountStatus !== "active") {
    return {
      exists: false,
      statusCode: 403,
      message: `Account is ${user.accountStatus}`,
    };
  }

  if (user.isLocked) {
    if (user.lockedUntil && new Date() > user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isLocked: false,
          lockedAt: null,
          lockedUntil: null,
          lockReason: null,
          failedLoginAttempts: 0,
        },
      });
      return { exists: true, user };
    }

    return {
      exists: false,
      statusCode: 403,
      message: "Account is locked. Please contact support.",
    };
  }

  return { exists: true, user };
};

export const checkUserExistsForRegister = async (email, phoneNumber) => {
  if (email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return {
        exists: true,
        statusCode: 409,
        message: "An account already exists with this email",
      };
    }
  }

  if (phoneNumber) {
    const existingPhone = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (existingPhone) {
      return {
        exists: true,
        statusCode: 409,
        message: "An account already exists with this phone number",
      };
    }
  }

  return { exists: false };
};
