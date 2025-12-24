import { blacklistToken } from "../../utils/jwt.js";
import logger from "../../utils/logger.js";

export const logout = async (req, res) => {
  try {
    if (req.token) {
      await blacklistToken(req.token, req.user.id);
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No token provided.",
      });
    }
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "logout",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
