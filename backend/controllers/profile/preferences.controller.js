import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

/**
 * Get user preferences
 */
export const getPreferences = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        preferredLanguage: true,
        timezone: true,
        notificationPreferences: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        preferredLanguage: user.preferredLanguage,
        timezone: user.timezone,
        notificationPreferences: user.notificationPreferences || {
          email: true,
          whatsapp: true,
          web: true,
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getPreferences",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to get preferences",
    });
  }
};

/**
 * Update language preference
 */
export const updateLanguage = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const { language } = req.body;

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Language is required",
      });
    }

    if (!["en", "ar"].includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Use 'en' or 'ar'",
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { preferredLanguage: language },
    });

    logger.info("Language updated", {
      userId: req.user.id,
      language,
    });

    res.status(200).json({
      success: true,
      message: "Language preference updated successfully",
      data: {
        preferredLanguage: language,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "updateLanguage",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to update language preference",
    });
  }
};

/**
 * Update timezone preference
 */
export const updateTimezone = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const { timezone } = req.body;

    if (!timezone) {
      return res.status(400).json({
        success: false,
        message: "Timezone is required",
      });
    }

    // Basic timezone validation (IANA timezone format)
    const timezoneRegex = /^[A-Za-z]+\/[A-Za-z_]+$/;
    if (!timezoneRegex.test(timezone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timezone format. Use IANA format (e.g., Asia/Riyadh)",
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { timezone },
    });

    logger.info("Timezone updated", {
      userId: req.user.id,
      timezone,
    });

    res.status(200).json({
      success: true,
      message: "Timezone preference updated successfully",
      data: {
        timezone,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "updateTimezone",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to update timezone preference",
    });
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const { email, whatsapp, web } = req.body;

    // Validate at least one channel is enabled
    if (email === false && whatsapp === false && web === false) {
      return res.status(400).json({
        success: false,
        message: "At least one notification channel must be enabled",
      });
    }

    // Get current preferences
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { notificationPreferences: true },
    });

    const currentPrefs = user.notificationPreferences || {
      email: true,
      whatsapp: true,
      web: true,
    };

    // Build new preferences
    const newPrefs = {
      email: email !== undefined ? email : currentPrefs.email,
      whatsapp: whatsapp !== undefined ? whatsapp : currentPrefs.whatsapp,
      web: web !== undefined ? web : currentPrefs.web,
    };

    await prisma.user.update({
      where: { id: req.user.id },
      data: { notificationPreferences: newPrefs },
    });

    logger.info("Notification preferences updated", {
      userId: req.user.id,
      preferences: newPrefs,
    });

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: {
        notificationPreferences: newPrefs,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "updateNotificationPreferences",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
    });
  }
};

/**
 * Update all preferences at once
 */
export const updateAllPreferences = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const { language, timezone, notifications } = req.body;

    const updateData = {};

    // Validate language
    if (language !== undefined) {
      if (!["en", "ar"].includes(language)) {
        return res.status(400).json({
          success: false,
          message: "Invalid language. Use 'en' or 'ar'",
        });
      }
      updateData.preferredLanguage = language;
    }

    // Validate timezone
    if (timezone !== undefined) {
      const timezoneRegex = /^[A-Za-z]+\/[A-Za-z_]+$/;
      if (!timezoneRegex.test(timezone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timezone format",
        });
      }
      updateData.timezone = timezone;
    }

    // Validate notifications
    if (notifications !== undefined) {
      if (
        notifications.email === false &&
        notifications.whatsapp === false &&
        notifications.web === false
      ) {
        return res.status(400).json({
          success: false,
          message: "At least one notification channel must be enabled",
        });
      }
      updateData.notificationPreferences = notifications;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        preferredLanguage: true,
        timezone: true,
        notificationPreferences: true,
      },
    });

    logger.info("All preferences updated", {
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "updateAllPreferences",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to update preferences",
    });
  }
};
