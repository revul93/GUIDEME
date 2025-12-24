import express from "express";
import {
  createCase,
  listCases,
  getCase,
  updateCase,
  submitCase,
  getCaseStats,
} from "../controllers/case/index.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Case routes
router.get("/stats", getCaseStats); // Must be before /:id to avoid conflicts
router.post("/", createCase);
router.get("/", listCases);
router.get("/:id", getCase);
router.put("/:id", updateCase);
router.post("/:id/submit", submitCase);

export default router;
