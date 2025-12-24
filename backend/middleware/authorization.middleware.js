// Check if user is a designer (including admins)
export const requireDesigner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "designer") {
    return res.status(403).json({
      success: false,
      message: "Designer access required",
    });
  }

  next();
};

// Check if user is an admin (designer with admin flag)
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "designer" || !req.user.designerProfile?.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};
