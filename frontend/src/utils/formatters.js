/**
 * Formatting Utilities
 */

/**
 * Format date to localized string
 * @param {string|Date} dateString - Date to format
 * @param {string} locale - Locale (en-US or ar-SA)
 * @param {Object} options - Intl.DateTimeFormat options
 */
export const formatDate = (dateString, locale = "en-US", options = {}) => {
  if (!dateString) return "-";

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return new Date(dateString).toLocaleDateString(locale, defaultOptions);
};

/**
 * Format date to short format
 * @param {string|Date} dateString - Date to format
 * @param {string} locale - Locale
 */
export const formatDateShort = (dateString, locale = "en-US") => {
  return formatDate(dateString, locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} dateString - Date to format
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (SAR, USD, etc.)
 * @param {string} locale - Locale
 */
export const formatCurrency = (amount, currency = "SAR", locale = "en-US") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Format phone number
 * @param {string} phoneNumber - Phone number to format
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "-";

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Format Saudi numbers (+966 5X XXX XXXX)
  if (cleaned.startsWith("966")) {
    return `+966 ${cleaned.slice(3, 4)}${cleaned.slice(4, 5)} ${cleaned.slice(
      5,
      8
    )} ${cleaned.slice(8)}`;
  }

  return phoneNumber;
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 */
export const capitalizeFirst = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Convert snake_case to Title Case
 * @param {string} text - Snake case text
 */
export const snakeToTitle = (text) => {
  if (!text) return "";
  return text
    .split("_")
    .map((word) => capitalizeFirst(word))
    .join(" ");
};

/**
 * Mask email (show first 2 and last part)
 * @param {string} email - Email to mask
 */
export const maskEmail = (email) => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return email;
  return `${local.slice(0, 2)}***@${domain}`;
};

/**
 * Mask phone number (show country code and last 4)
 * @param {string} phoneNumber - Phone number to mask
 */
export const maskPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber.replace(/\D/g, "");
  if (cleaned.length < 8) return phoneNumber;

  const countryCode = cleaned.slice(0, cleaned.length - 9);
  const lastFour = cleaned.slice(-4);
  return `+${countryCode}****${lastFour}`;
};

/**
 * Get initials from name
 * @param {string} name - Full name
 */
export const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
};

/**
 * Get color for status
 * @param {string} status - Status value
 */
export const getStatusColor = (status) => {
  const colors = {
    submitted: "blue",
    pending_study_payment_verification: "yellow",
    study_in_progress: "purple",
    study_completed: "indigo",
    quote_pending: "yellow",
    quote_sent: "blue",
    quote_accepted: "green",
    quote_rejected: "red",
    pending_production_payment_verification: "yellow",
    in_production: "purple",
    pending_response: "orange",
    production_completed: "indigo",
    ready_for_pickup: "blue",
    out_for_delivery: "blue",
    delivered: "green",
    completed: "green",
    cancelled: "gray",
    refund_requested: "orange",
    refunded: "gray",
  };

  return colors[status] || "gray";
};

/**
 * Get Tailwind CSS classes for status badge
 * @param {string} status - Status value
 */
export const getStatusBadgeClass = (status) => {
  const color = getStatusColor(status);

  const classes = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400",
    yellow:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400",
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400",
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400",
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400",
    orange:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400",
    gray: "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400",
  };

  return classes[color] || classes.gray;
};

/**
 * Format status text (convert snake_case to Title Case)
 * @param {string} status - Status value
 * @param {Function} t - Translation function (optional)
 */
export const formatStatus = (status, t = null) => {
  if (!status) return "";

  // If translation function provided, use it
  if (t && typeof t === "function") {
    return t(`status.${status}`);
  }

  // Otherwise, convert snake_case to Title Case
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Format price/currency (SAR by default)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: SAR)
 */
export const formatPrice = (amount, currency = "SAR") => {
  if (amount === null || amount === undefined) return "0 SAR";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default {
  formatDate,
  formatDateShort,
  formatRelativeTime,
  formatFileSize,
  formatCurrency,
  formatPhoneNumber,
  truncateText,
  capitalizeFirst,
  snakeToTitle,
  maskEmail,
  maskPhoneNumber,
  getInitials,
  getStatusColor,
  getStatusBadgeClass,
  formatStatus,
  formatPrice,
};
