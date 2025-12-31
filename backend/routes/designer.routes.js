import express from "express";
import { getClientProfile } from "../controllers/designer/get-client-profile.controller.js";

const router = express.Router();

/**
 * Designer Routes
 * All routes require designer role (handled by role middleware in main router)
 */

// Get client profile (masked - no contact info)
router.get("/clients/:id", getClientProfile);

export default router;
