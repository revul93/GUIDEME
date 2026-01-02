/**
 * Validation Utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 */
export const validateEmail = (email) => {
  if (!email?.trim()) {
    return { valid: false, error: "Email is required" };
  }

  if (email.length > 254) {
    return { valid: false, error: "Email is too long" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
};

/**
 * Validate phone number (Saudi format)
 * @param {string} phone - Phone number to validate
 * @param {string} countryCode - Country code (default: +966)
 */
export const validatePhone = (phone, countryCode = "+966") => {
  if (!phone?.trim()) {
    return { valid: false, error: "Phone number is required" };
  }

  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, "");

  // Check if only digits
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: "Phone number must contain only digits" };
  }

  // Saudi phone validation
  if (countryCode === "+966") {
    if (cleaned.length !== 9) {
      return { valid: false, error: "Phone number must be 9 digits" };
    }

    if (!cleaned.startsWith("5")) {
      return { valid: false, error: "Mobile number must start with 5" };
    }
  }

  return { valid: true };
};

/**
 * Validate name (first/last name)
 * @param {string} name - Name to validate
 * @param {string} field - Field name for error message
 */
export const validateName = (name, field = "Name") => {
  if (!name?.trim()) {
    return { valid: false, error: `${field} is required` };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: `${field} must be at least 2 characters` };
  }

  if (name.length > 50) {
    return { valid: false, error: `${field} must be less than 50 characters` };
  }

  // Allow letters (Arabic and English), spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\u0600-\u06FF\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { valid: false, error: `${field} contains invalid characters` };
  }

  return { valid: true };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 */
export const validateRequired = (value, fieldName = "Field") => {
  if (value === null || value === undefined || value === "") {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof value === "string" && !value.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
};

/**
 * Validate text length
 * @param {string} text - Text to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @param {string} fieldName - Field name for error message
 */
export const validateLength = (text, min, max, fieldName = "Field") => {
  if (!text) {
    return { valid: true }; // Allow empty if not required
  }

  const length = text.trim().length;

  if (length < min) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${min} characters`,
    };
  }

  if (length > max) {
    return {
      valid: false,
      error: `${fieldName} must be less than ${max} characters`,
    };
  }

  return { valid: true };
};

/**
 * Validate file
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB
    allowedTypes = null,
    allowedExtensions = null,
    required = false,
  } = options;

  if (!file) {
    if (required) {
      return { valid: false, error: "File is required" };
    }
    return { valid: true };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB` };
  }

  // Check file type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }

  // Check file extension
  if (allowedExtensions) {
    const extension = `.${file.name.split(".").pop().toLowerCase()}`;
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension ${extension} is not allowed`,
      };
    }
  }

  return { valid: true };
};

/**
 * Validate OTP code
 * @param {string} code - OTP code
 */
export const validateOtpCode = (code) => {
  if (!code?.trim()) {
    return { valid: false, error: "Verification code is required" };
  }

  if (!/^\d{6}$/.test(code)) {
    return { valid: false, error: "Code must be 6 digits" };
  }

  return { valid: true };
};

/**
 * Validate case data
 * @param {Object} caseData - Case data to validate
 */
export const validateCaseData = (caseData) => {
  const errors = {};

  // Required fields
  if (!caseData.procedureCategory) {
    errors.procedureCategory = "Procedure category is required";
  }

  if (!caseData.guideType) {
    errors.guideType = "Guide type is required";
  }

  if (!caseData.requiredService) {
    errors.requiredService = "Required service is required";
  }

  // Teeth selection for specific procedures
  if (
    ["single_implant", "multiple_implant"].includes(caseData.procedureCategory)
  ) {
    if (!caseData.teethNumbers || caseData.teethNumbers.length === 0) {
      errors.teethNumbers = "Teeth selection is required for this procedure";
    }
  }

  // Delivery validation for full solution
  if (caseData.requiredService === "full_solution") {
    if (!caseData.deliveryMethod) {
      errors.deliveryMethod = "Delivery method is required for full solution";
    }

    if (caseData.deliveryMethod === "delivery" && !caseData.deliveryAddressId) {
      errors.deliveryAddressId = "Delivery address is required";
    }

    if (caseData.deliveryMethod === "pickup" && !caseData.pickupBranchId) {
      errors.pickupBranchId = "Pickup branch is required";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate form data
 * @param {Object} formData - Form data
 * @param {Object} rules - Validation rules
 */
export const validateForm = (formData, rules) => {
  const errors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];

    // Required validation
    if (rule.required) {
      const validation = validateRequired(value, rule.label || field);
      if (!validation.valid) {
        errors[field] = validation.error;
        continue;
      }
    }

    // Skip other validations if value is empty and not required
    if (!value && !rule.required) continue;

    // Email validation
    if (rule.type === "email") {
      const validation = validateEmail(value);
      if (!validation.valid) {
        errors[field] = validation.error;
      }
    }

    // Phone validation
    if (rule.type === "phone") {
      const validation = validatePhone(value, rule.countryCode);
      if (!validation.valid) {
        errors[field] = validation.error;
      }
    }

    // Name validation
    if (rule.type === "name") {
      const validation = validateName(value, rule.label || field);
      if (!validation.valid) {
        errors[field] = validation.error;
      }
    }

    // Length validation
    if (rule.min || rule.max) {
      const validation = validateLength(
        value,
        rule.min || 0,
        rule.max || Infinity,
        rule.label || field
      );
      if (!validation.valid) {
        errors[field] = validation.error;
      }
    }

    // Custom validation
    if (rule.custom) {
      const validation = rule.custom(value);
      if (!validation.valid) {
        errors[field] = validation.error;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePhone,
  validateName,
  validateRequired,
  validateLength,
  validateFile,
  validateOtpCode,
  validateCaseData,
  validateForm,
};
