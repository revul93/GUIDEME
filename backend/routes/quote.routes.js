import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  listQuotes,
  getQuote,
} from "../controllers/quote/list-quotes.controller.js";
import { createQuote } from "../controllers/quote/create-quote.controller.js";
import { reviseQuote } from "../controllers/quote/revise-quote.controller.js";
import {
  acceptQuote,
  rejectQuote,
} from "../controllers/quote/accept-reject-quote.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// List quotes for a case
router.get("/cases/:id/quotes", listQuotes);

// Get single quote
router.get("/:id", getQuote);

// Create quote (admins only)
router.post("/", createQuote);

// Revise quote (admins only)
router.put("/:id/revise", reviseQuote);

// Accept/reject quote (clients only)
router.put("/:id/accept", acceptQuote);
router.put("/:id/reject", rejectQuote);

export default router;
