import express from "express";

// Account creation
import { createLabAccount } from "../controllers/admin/create-lab.controller.js";
import {
  createDesignerAccount,
  updateDesignerAdminStatus,
} from "../controllers/admin/create-designer.controller.js";

// Dashboard & Analytics
import {
  getDashboard,
  getSystemStats,
} from "../controllers/admin/dashboard.controller.js";

// User Management
import {
  listAllClients,
  getClientDetails,
  listAllDesigners,
  updateAccountStatus,
} from "../controllers/admin/user-management.controller.js";

// Payment & Financial
import {
  getPendingVerifications,
  getRevenueReport,
} from "../controllers/admin/payment-financial.controller.js";

// Case Management
import {
  assignCaseToDesigner,
  overrideCaseStatus,
} from "../controllers/admin/case-management.controller.js";

// Notifications
import { sendAnnouncement } from "../controllers/admin/announcement.controller.js";

const router = express.Router();

/**
 * Admin Routes
 * All routes require admin role (designer with isAdmin=true)
 * Middleware check should be applied in main router
 */

// ===================================================================
// ACCOUNT CREATION
// ===================================================================

/**
 * POST /api/admin/labs
 * Create lab account (labs cannot self-register)
 */
router.post("/labs", createLabAccount);

/**
 * POST /api/admin/designers
 * Create designer account (designers cannot self-register)
 * Body: { isAdmin: true } to create as admin
 */
router.post("/designers", createDesignerAccount);

/**
 * PUT /api/admin/designers/:id/admin-status
 * Promote designer to admin or demote admin to designer
 * Body: { isAdmin: true/false }
 */
router.put("/designers/:id/admin-status", updateDesignerAdminStatus);

// ===================================================================
// DASHBOARD & ANALYTICS
// ===================================================================

/**
 * GET /api/admin/dashboard
 * Get admin dashboard with overview statistics
 */
router.get("/dashboard", getDashboard);

/**
 * GET /api/admin/stats
 * Get detailed system statistics
 * Query: ?period=30 (days)
 */
router.get("/stats", getSystemStats);

// ===================================================================
// USER MANAGEMENT
// ===================================================================

/**
 * GET /api/admin/clients
 * List all clients with filters and pagination
 * Query: ?page=1&limit=20&search=name&clientType=doctor
 */
router.get("/clients", listAllClients);

/**
 * GET /api/admin/clients/:id
 * Get full client details including contact info and case history
 */
router.get("/clients/:id", getClientDetails);

/**
 * GET /api/admin/designers
 * List all designers with filters
 * Query: ?page=1&limit=20&search=name&isAdmin=true
 */
router.get("/designers", listAllDesigners);

/**
 * PUT /api/admin/users/:id/status
 * Update user account status (active, suspended, banned)
 * Body: { status: "active|suspended|banned", reason: "..." }
 */
router.put("/users/:id/status", updateAccountStatus);

// ===================================================================
// PAYMENT & FINANCIAL
// ===================================================================

/**
 * GET /api/admin/payments/pending
 * Get pending payment verifications queue
 * Query: ?page=1&limit=20&paymentType=study|production
 */
router.get("/payments/pending", getPendingVerifications);

/**
 * GET /api/admin/reports/revenue
 * Get revenue report with breakdown
 * Query: ?startDate=2024-01-01&endDate=2024-12-31&groupBy=month
 */
router.get("/reports/revenue", getRevenueReport);

// ===================================================================
// CASE MANAGEMENT
// ===================================================================

/**
 * PUT /api/admin/cases/:id/assign
 * Assign case to specific designer
 * Body: { designerId: 123, notes: "..." }
 */
router.put("/cases/:id/assign", assignCaseToDesigner);

/**
 * PUT /api/admin/cases/:id/override-status
 * Override case status (bypass normal workflow)
 * Body: { status: "submitted|...", reason: "..." }
 */
router.put("/cases/:id/override-status", overrideCaseStatus);

// ===================================================================
// NOTIFICATIONS
// ===================================================================

/**
 * POST /api/admin/notifications/announcement
 * Send announcement to users
 * Body: {
 *   subject: "...",
 *   message: "...",
 *   targetAudience: "all|clients|designers|doctors|labs",
 *   priority: "normal|high|urgent",
 *   sendEmail: true|false
 * }
 */
router.post("/notifications/announcement", sendAnnouncement);

export default router;
