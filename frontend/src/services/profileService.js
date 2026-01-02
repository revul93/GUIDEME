/**
 * Profile Service
 * Handles user profile, addresses, preferences, and statistics
 */

import api from "../utils/api";

const profileService = {
  // ==================== PROFILE ====================

  /**
   * Get user profile with addresses
   * @returns {Promise<Object>} Profile data
   */
  async getProfile() {
    const response = await api.get("/profile");
    return response.data.data;
  },

  /**
   * Update profile information
   * @param {Object} profileData - Profile updates
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(profileData) {
    const response = await api.put("/profile", profileData);
    return response.data.data.profile;
  },

  /**
   * Upload profile image
   * @param {File} imageFile - Image file
   * @returns {Promise<Object>} Image URL
   */
  async uploadProfileImage(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await api.post("/profile/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.imageUrl;
  },

  /**
   * Delete profile image
   * @returns {Promise<Object>} Success response
   */
  async deleteProfileImage() {
    const response = await api.delete("/profile/image");
    return response.data;
  },

  // ==================== ADDRESSES ====================

  /**
   * List all addresses
   * @returns {Promise<Array>} List of addresses
   */
  async listAddresses() {
    const response = await api.get("/profile/addresses");
    return response.data.data.addresses;
  },

  /**
   * Add new address
   * @param {Object} addressData - Address information
   * @returns {Promise<Object>} Created address
   */
  async addAddress(addressData) {
    const response = await api.post("/profile/addresses", addressData);
    return response.data.data.address;
  },

  /**
   * Update address
   * @param {Number} addressId - Address ID
   * @param {Object} addressData - Updated address data
   * @returns {Promise<Object>} Updated address
   */
  async updateAddress(addressId, addressData) {
    const response = await api.put(
      `/profile/addresses/${addressId}`,
      addressData
    );
    return response.data.data.address;
  },

  /**
   * Delete address
   * @param {Number} addressId - Address ID
   * @returns {Promise<Object>} Success response
   */
  async deleteAddress(addressId) {
    const response = await api.delete(`/profile/addresses/${addressId}`);
    return response.data;
  },

  /**
   * Set default address
   * @param {Number} addressId - Address ID
   * @returns {Promise<Object>} Success response
   */
  async setDefaultAddress(addressId) {
    const response = await api.put(`/profile/addresses/${addressId}/default`);
    return response.data;
  },

  // ==================== CONTACT CHANGE ====================

  /**
   * Request contact change (Step 1)
   * @param {String} contactType - 'email' or 'phone'
   * @param {String} newContact - New email or phone number
   * @returns {Promise<Object>} Verification details
   */
  async requestContactChange(contactType, newContact) {
    const response = await api.post("/profile/contact/request", {
      contactType,
      newContact,
    });
    return response.data.data;
  },

  /**
   * Verify old contact (Step 2)
   * @param {String} contactType - 'email' or 'phone'
   * @param {String} code - OTP code
   * @param {String} newContact - New contact
   * @returns {Promise<Object>} Verification details
   */
  async verifyOldContact(contactType, code, newContact) {
    const response = await api.post("/profile/contact/verify-old", {
      contactType,
      code,
      newContact,
    });
    return response.data.data;
  },

  /**
   * Verify new contact (Step 3)
   * @param {String} contactType - 'email' or 'phone'
   * @param {String} code - OTP code
   * @param {String} newContact - New contact
   * @returns {Promise<Object>} Success response
   */
  async verifyNewContact(contactType, code, newContact) {
    const response = await api.post("/profile/contact/verify-new", {
      contactType,
      code,
      newContact,
    });
    return response.data.data;
  },

  // ==================== PREFERENCES ====================

  /**
   * Get user preferences
   * @returns {Promise<Object>} Preferences
   */
  async getPreferences() {
    const response = await api.get("/profile/preferences");
    return response.data.data;
  },

  /**
   * Update language preference
   * @param {String} language - 'en' or 'ar'
   * @returns {Promise<Object>} Updated preference
   */
  async updateLanguage(language) {
    const response = await api.put("/profile/preferences/language", {
      language,
    });
    return response.data.data;
  },

  /**
   * Update timezone preference
   * @param {String} timezone - IANA timezone (e.g., 'Asia/Riyadh')
   * @returns {Promise<Object>} Updated preference
   */
  async updateTimezone(timezone) {
    const response = await api.put("/profile/preferences/timezone", {
      timezone,
    });
    return response.data.data;
  },

  /**
   * Update notification preferences
   * @param {Object} preferences - { email, whatsapp, web }
   * @returns {Promise<Object>} Updated preferences
   */
  async updateNotificationPreferences(preferences) {
    const response = await api.put(
      "/profile/preferences/notifications",
      preferences
    );
    return response.data.data;
  },

  /**
   * Update all preferences at once
   * @param {Object} preferences - { language, timezone, notifications }
   * @returns {Promise<Object>} Updated preferences
   */
  async updateAllPreferences(preferences) {
    const response = await api.put("/profile/preferences", preferences);
    return response.data;
  },

  // ==================== STATISTICS ====================

  /**
   * Get account statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStats() {
    const response = await api.get("/profile/stats");
    return response.data.data;
  },

  /**
   * Get payment history
   * @param {Object} params - { year, month }
   * @returns {Promise<Object>} Payment history
   */
  async getPaymentHistory(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.year) queryParams.append("year", params.year);
    if (params.month) queryParams.append("month", params.month);

    const response = await api.get(`/profile/payment-history?${queryParams}`);
    return response.data.data;
  },
};

export default profileService;
