import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createCase,
  getCase,
  getCases,
  getCaseStatusHistory,
  getCaseStats,
  updateCase,
} from "../controllers/case/index.js";

const router = express.Router();

// Stats endpoint
router.get("/stats", authenticate, getCaseStats);

// List and create cases
router.get("/", authenticate, getCases);
router.post("/", authenticate, createCase);

// Specific case operations
router.get("/:id", authenticate, getCase);
router.put("/:id", authenticate, updateCase);

// Case status history
router.get("/:id/status-history", authenticate, getCaseStatusHistory);

export default router;
