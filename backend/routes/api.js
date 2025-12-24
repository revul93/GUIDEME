import express from "express";
import authRoutes from "./auth.routes.js";
import caseRoutes from "./case.routes.js";
import profileRoutes from "./profile.routes.js";
import commentRoutes from "./comment.routes.js";
import fileRoutes from "./file.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/cases", caseRoutes);
router.use("/comments", commentRoutes);
router.use("/files", fileRoutes);

export default router;
