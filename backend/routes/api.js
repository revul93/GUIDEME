import express from "express";
import authRoutes from "./auth.routes.js";
import caseRoutes from "./case.routes.js";
import profileRoutes from "./profile.routes.js";
import commentRoutes from "./comment.routes.js";
import fileRoutes from "./file.routes.js";
import notificationRoutes from "./notification.routes.js";
import discountRoutes from "./discount.routes.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import adminRoutes from "./admin.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);

router.use("/admin", authenticate, requireAdmin, adminRoutes);
router.use("/profile", profileRoutes);
router.use("/cases", caseRoutes);
router.use("/comments", commentRoutes);
router.use("/files", fileRoutes);
router.use("/notifications", notificationRoutes);
router.use("/discount-codes", authenticate, discountRoutes);

export default router;
