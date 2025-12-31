export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Admin privileges required",
    });
  }

  next();
};
