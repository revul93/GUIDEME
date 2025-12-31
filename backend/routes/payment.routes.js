import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  listPayments,
  getPayment,
} from "../controllers/payment/list-payments.controller.js";
import {
  uploadStudyPaymentProof,
  uploadProductionPaymentProof,
} from "../controllers/payment/upload-payment.controller.js";
import {
  verifyPayment,
  rejectPayment,
} from "../controllers/payment/verify-payment.controller.js";
import {
  requestRefund,
  approveRefund,
  rejectRefund,
} from "../controllers/payment/refund.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// List and get payments
router.get("/", listPayments);
router.get("/:id", getPayment);

// Upload payment proof (clients only)
router.post("/study-fee", uploadStudyPaymentProof);
router.post("/production-fee", uploadProductionPaymentProof);

// Verify/reject payments (admins only)
router.put("/:id/verify", verifyPayment);
router.put("/:id/reject", rejectPayment);

// Refund management
router.post("/:id/refund-request", requestRefund); // Client requests refund
router.put("/:id/refund-approve", approveRefund); // Admin approves refund
router.put("/:id/refund-reject", rejectRefund); // Admin rejects refund

export default router;
