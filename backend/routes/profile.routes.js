import express from "express";
import {
  getProfile,
  updateProfile,
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  requestContactChange,
  verifyOldContact,
  verifyNewContact,
} from "../controllers/profile/index.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get("/", getProfile);
router.put("/", updateProfile);

// Address routes
router.get("/addresses", listAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:id", updateAddress);
router.delete("/addresses/:id", deleteAddress);
router.put("/addresses/:id/default", setDefaultAddress);

// Contact change routes (3-step process)
router.post("/contact/request", requestContactChange);
router.post("/contact/verify-old", verifyOldContact);
router.post("/contact/verify-new", verifyNewContact);

export default router;
