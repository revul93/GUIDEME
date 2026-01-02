// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
};

// File Categories
export const FILE_CATEGORIES = {
  DICOM: "dicom",
  STL: "stl",
  PLY: "ply",
  ZIP: "zip",
  CLINICAL_PHOTO: "clinical_photo",
  PRESCRIPTION: "prescription",
  STUDY_FILE: "study_file",
  DESIGN_FILE: "design_file",
  PRODUCTION_FILE: "production_file",
  OTHER: "other",
};

// Case Statuses
export const CASE_STATUS = {
  SUBMITTED: "submitted",
  PENDING_STUDY_PAYMENT: "pending_study_payment_verification",
  STUDY_IN_PROGRESS: "study_in_progress",
  STUDY_COMPLETED: "study_completed",
  QUOTE_PENDING: "quote_pending",
  QUOTE_SENT: "quote_sent",
  QUOTE_ACCEPTED: "quote_accepted",
  QUOTE_REJECTED: "quote_rejected",
  PENDING_PRODUCTION_PAYMENT: "pending_production_payment_verification",
  IN_PRODUCTION: "in_production",
  PENDING_RESPONSE: "pending_response",
  PRODUCTION_COMPLETED: "production_completed",
  READY_FOR_PICKUP: "ready_for_pickup",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUND_REQUESTED: "refund_requested",
  REFUNDED: "refunded",
};

// Procedure Categories
export const PROCEDURE_CATEGORY = {
  SINGLE_IMPLANT: "single_implant",
  MULTIPLE_IMPLANT: "multiple_implant",
  FULL_ARCH: "full_arch",
  GBR: "gbr",
  OTHER: "other",
};

// Guide Types
export const GUIDE_TYPE = {
  TOOTH_SUPPORT: "tooth_support",
  TISSUE_SUPPORT: "tissue_support",
  BONE_SUPPORT: "bone_support",
  STACKABLE: "stackable",
  HYBRID: "hybrid",
  OTHER: "other",
};

// Required Services
export const REQUIRED_SERVICE = {
  STUDY_ONLY: "study_only",
  FULL_SOLUTION: "full_solution",
};

// Implant Systems
export const IMPLANT_SYSTEM = {
  NOBEL_BIOCARE: "nobel_biocare",
  STRAUMANN: "straumann",
  ZIMMER_BIOMET: "zimmer_biomet",
  OSSTEM: "osstem",
  HIOSSEN: "hiossen",
  DENTIUM: "dentium",
  MEGAGEN: "megagen",
  BICON: "bicon",
  NEODENT: "neodent",
  OTHER: "other",
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  FAILED: "failed",
  REFUNDED: "refunded",
};

// Payment Method
export const PAYMENT_METHOD = {
  BANK_TRANSFER: "bank_transfer",
  CASH: "cash",
  HYPERPAY: "hyperpay",
};

// Payment Type
export const PAYMENT_TYPE = {
  STUDY_FEE: "study_fee",
  PRODUCTION_FEE: "production_fee",
  DELIVERY_FEE: "delivery_fee",
};

// Discount Type
export const DISCOUNT_TYPE = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
};

// Client Types
export const CLIENT_TYPE = {
  DOCTOR: "doctor",
  LAB: "lab",
};

// Account Status
export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DELETED: "deleted",
  PENDING_APPROVAL: "pending_approval",
};

// Delivery Methods
export const DELIVERY_METHOD = {
  DELIVERY: "delivery",
  PICKUP: "pickup",
};

// User Roles
export const USER_ROLE = {
  CLIENT: "client",
  DESIGNER: "designer",
  ADMIN: "admin",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// OTP Configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 5,
  RESEND_COOLDOWN: 60, // seconds
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_TYPES: {
    IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    DOCUMENT: ["application/pdf"],
    ARCHIVE: ["application/zip", "application/x-rar-compressed"],
    DICOM: [".dcm", ".dicom"],
    STL: [".stl"],
  },
};

// Notification Types
export const NOTIFICATION_TYPE = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "language",
};

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  CASES: "/dashboard/cases",
  VIEW_CASE: "/dashboard/cases/:id",
  SUBMIT_CASE: "/dashboard/cases/new",
  PROFILE: "/dashboard/profile",
  ADMIN: "/admin",
};

// Date Formats
export const DATE_FORMATS = {
  LONG: {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  SHORT: {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  TIME_ONLY: {
    hour: "2-digit",
    minute: "2-digit",
  },
};

// Supported Languages
export const LANGUAGES = {
  EN: "en",
  AR: "ar",
};

// Theme Modes
export const THEME = {
  LIGHT: "light",
  DARK: "dark",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNAUTHORIZED: "Session expired. Please login again.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "Resource not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CASE_CREATED: "Case created successfully",
  CASE_UPDATED: "Case updated successfully",
  STATUS_UPDATED: "Status updated successfully",
  COMMENT_ADDED: "Comment added successfully",
  FILE_UPLOADED: "File uploaded successfully",
};

export default {
  API_CONFIG,
  FILE_CATEGORIES,
  CASE_STATUS,
  PROCEDURE_CATEGORY,
  GUIDE_TYPE,
  REQUIRED_SERVICE,
  IMPLANT_SYSTEM,
  DELIVERY_METHOD,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_TYPE,
  DISCOUNT_TYPE,
  CLIENT_TYPE,
  ACCOUNT_STATUS,
  USER_ROLE,
  PAGINATION,
  OTP_CONFIG,
  FILE_UPLOAD,
  NOTIFICATION_TYPE,
  STORAGE_KEYS,
  ROUTES,
  DATE_FORMATS,
  LANGUAGES,
  THEME,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
