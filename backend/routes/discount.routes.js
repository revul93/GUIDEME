import express from "express";
import { createDiscountCode } from "../controllers/admin/create-discount-code.controller.js";
import { listDiscountCodes } from "../controllers/admin/list-discount-codes.controller.js";
import { getDiscountCode } from "../controllers/admin/get-discount-code.controller.js";
import {
  updateDiscountCode,
  deleteDiscountCode,
} from "../controllers/admin/update-delete-discount-code.controller.js";
import { validateDiscountCodeForClient } from "../controllers/client/validate-discount-code.controller.js";
import {
  applyDiscountCode,
  removeDiscountCode,
} from "../controllers/client/apply-remove-discount-code.controller.js";

const router = express.Router();

/**
 * Discount Code Routes
 * 
 * Admin routes: Require admin role (designer with isAdmin=true)
 * Client routes: Require client role
 */

// ===================================================================
// ADMIN ROUTES (require admin middleware)
// ===================================================================

/**
 * POST /api/discount-codes
 * Create new discount code
 */
router.post("/", createDiscountCode);

/**
 * GET /api/discount-codes
 * List all discount codes with filters
 * Query params: page, limit, active, expired, search
 */
router.get("/", listDiscountCodes);

/**
 * GET /api/discount-codes/:id
 * Get discount code details with statistics
 */
router.get("/:id", getDiscountCode);

/**
 * PUT /api/discount-codes/:id
 * Update discount code
 */
router.put("/:id", updateDiscountCode);

/**
 * DELETE /api/discount-codes/:id
 * Delete discount code (soft delete)
 */
router.delete("/:id", deleteDiscountCode);

// ===================================================================
// CLIENT ROUTES
// ===================================================================

/**
 * POST /api/discount-codes/validate
 * Validate discount code and preview discount
 */
router.post("/validate", validateDiscountCodeForClient);

/**
 * POST /api/discount-codes/apply
 * Apply discount code to quote
 */
router.post("/apply", applyDiscountCode);

/**
 * DELETE /api/discount-codes/quotes/:quoteId
 * Remove discount code from quote
 */
router.delete("/quotes/:quoteId", removeDiscountCode);

export default router;
