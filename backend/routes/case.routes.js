import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createCase,
  getCase,
  getCases,
  getCaseStatusHistory,
  getCaseComments,
  createCaseComment,
  getCaseStats,
} from "../controllers/case/index.js";

const router = express.Router();

// Stats (must be before /:id)
router.get("/stats", authenticate, getCaseStats);

// List cases (must be before /:id)
router.get("/", authenticate, getCases);

// Case CRUD
router.post("/", authenticate, createCase);
router.get("/:id", authenticate, getCase);

// Status History
router.get("/:id/status-history", authenticate, getCaseStatusHistory);

// Comments
router.get("/:id/comments", authenticate, getCaseComments);
router.post("/:id/comments", authenticate, createCaseComment);

export default router;
