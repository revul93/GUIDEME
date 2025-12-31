import express from "express";
import multer from "multer";
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
import {
  uploadProfileImage,
  deleteProfileImage,
} from "../controllers/profile/profile-image.controller.js";
import {
  getPreferences,
  updateLanguage,
  updateTimezone,
  updateNotificationPreferences,
  updateAllPreferences,
} from "../controllers/profile/preferences.controller.js";
import {
  getStats,
  getPaymentHistory,
} from "../controllers/profile/stats.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Configure multer for image uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed"));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get("/", getProfile);
router.put("/", updateProfile);

// Profile image routes
router.post("/image", upload.single("image"), uploadProfileImage);
router.delete("/image", deleteProfileImage);

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

// Preferences routes
router.get("/preferences", getPreferences);
router.put("/preferences", updateAllPreferences); // Update all at once
router.put("/preferences/language", updateLanguage);
router.put("/preferences/timezone", updateTimezone);
router.put("/preferences/notifications", updateNotificationPreferences);

// Statistics routes
router.get("/stats", getStats);
router.get("/payment-history", getPaymentHistory);

export default router;
