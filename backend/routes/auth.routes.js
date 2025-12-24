import express from "express";
import { sendOtpHandler, verifyOtpHandler, logout } from "../controllers/auth/index.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/request-otp", sendOtpHandler);
router.post("/verify-otp", verifyOtpHandler);

// Protected routes
router.post("/logout", authenticate, logout);

export default router;
