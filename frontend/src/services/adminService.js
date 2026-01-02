/**
 * Admin Service
 * Handles admin operations (requires admin role)
 */

import api from "../utils/api";

const adminService = {
  // ==================== DASHBOARD ====================

  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard() {
    const response = await api.get("/admin/dashboard");
    return response.data.data;
  },

  /**
   * Get system statistics
   * @param {Number} period - Days to include (default: 30)
   * @returns {Promise<Object>} System stats
   */
  async getSystemStats(period = 30) {
    const response = await api.get(`/admin/stats?period=${period}`);
    return response.data.data;
  },

  // ==================== USER MANAGEMENT ====================

  /**
   * List all clients
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Clients with pagination
   */
  async listClients(params = {}) {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
      ...(params.search && { search: params.search }),
      ...(params.clientType && { clientType: params.clientType }),
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
    });

    const response = await api.get(`/admin/clients?${queryParams}`);
    return response.data.data;
  },

  /**
   * Get client details
   * @param {Number} clientId - Client profile ID
   * @returns {Promise<Object>} Client details
   */
  async getClientDetails(clientId) {
    const response = await api.get(`/admin/clients/${clientId}`);
    return response.data.data;
  },

  /**
   * List all designers
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Designers with pagination
   */
  async listDesigners(params = {}) {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
      ...(params.search && { search: params.search }),
      ...(params.isAdmin !== undefined && {
        isAdmin: params.isAdmin.toString(),
      }),
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
    });

    const response = await api.get(`/admin/designers?${queryParams}`);
    return response.data.data;
  },

  /**
   * Update account status
   * @param {Number} userId - User ID
   * @param {String} status - 'active', 'suspended', or 'banned'
   * @param {String} reason - Reason for status change
   * @returns {Promise<Object>} Updated user
   */
  async updateAccountStatus(userId, status, reason) {
    const response = await api.put(`/admin/users/${userId}/status`, {
      status,
      reason,
    });
    return response.data.data;
  },

  // ==================== ACCOUNT CREATION ====================

  /**
   * Create lab account
   * @param {Object} labData - Lab account information
   * @returns {Promise<Object>} Created lab account
   */
  async createLabAccount(labData) {
    const response = await api.post("/admin/labs", labData);
    return response.data.data;
  },

  /**
   * Create designer account
   * @param {Object} designerData - Designer account information
   * @returns {Promise<Object>} Created designer account
   */
  async createDesignerAccount(designerData) {
    const response = await api.post("/admin/designers", designerData);
    return response.data.data;
  },

  /**
   * Update designer admin status
   * @param {Number} designerId - Designer profile ID
   * @param {Boolean} isAdmin - Admin status
   * @returns {Promise<Object>} Updated designer
   */
  async updateDesignerAdminStatus(designerId, isAdmin) {
    const response = await api.put(
      `/admin/designers/${designerId}/admin-status`,
      { isAdmin }
    );
    return response.data.data;
  },

  // ==================== PAYMENT MANAGEMENT ====================

  /**
   * Get pending payment verifications
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Pending payments with pagination
   */
  async getPendingVerifications(params = {}) {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
      ...(params.paymentType && { paymentType: params.paymentType }),
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "asc",
    });

    const response = await api.get(`/admin/payments/pending?${queryParams}`);
    return response.data.data;
  },

  /**
   * Get revenue report
   * @param {Object} params - { startDate, endDate, groupBy }
   * @returns {Promise<Object>} Revenue report
   */
  async getRevenueReport(params = {}) {
    const queryParams = new URLSearchParams({
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      groupBy: params.groupBy || "month",
    });

    const response = await api.get(`/admin/reports/revenue?${queryParams}`);
    return response.data.data;
  },

  // ==================== CASE MANAGEMENT ====================

  /**
   * Assign case to designer
   * @param {Number} caseId - Case ID
   * @param {Number} designerId - Designer profile ID
   * @param {String} notes - Optional notes
   * @returns {Promise<Object>} Success response
   */
  async assignCaseToDesigner(caseId, designerId, notes) {
    const response = await api.put(`/admin/cases/${caseId}/assign`, {
      designerId,
      notes,
    });
    return response.data.data;
  },

  /**
   * Override case status
   * @param {Number} caseId - Case ID
   * @param {String} status - New status
   * @param {String} reason - Reason for override
   * @returns {Promise<Object>} Updated case
   */
  async overrideCaseStatus(caseId, status, reason) {
    const response = await api.put(`/admin/cases/${caseId}/override-status`, {
      status,
      reason,
    });
    return response.data.data;
  },

  // ==================== DISCOUNT CODES ====================

  /**
   * Create discount code
   * @param {Object} codeData - Discount code information
   * @returns {Promise<Object>} Created discount code
   */
  async createDiscountCode(codeData) {
    const response = await api.post("/discount-codes", codeData);
    return response.data.data.discountCode;
  },

  /**
   * List discount codes
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Discount codes with pagination
   */
  async listDiscountCodes(params = {}) {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
      ...(params.active !== undefined && { active: params.active.toString() }),
      ...(params.expired !== undefined && {
        expired: params.expired.toString(),
      }),
      ...(params.search && { search: params.search }),
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
    });

    const response = await api.get(`/discount-codes?${queryParams}`);
    return response.data.data;
  },

  /**
   * Get discount code details
   * @param {Number} codeId - Discount code ID
   * @returns {Promise<Object>} Discount code details
   */
  async getDiscountCode(codeId) {
    const response = await api.get(`/discount-codes/${codeId}`);
    return response.data.data;
  },

  /**
   * Update discount code
   * @param {Number} codeId - Discount code ID
   * @param {Object} updates - Updated data
   * @returns {Promise<Object>} Updated discount code
   */
  async updateDiscountCode(codeId, updates) {
    const response = await api.put(`/discount-codes/${codeId}`, updates);
    return response.data.data.discountCode;
  },

  /**
   * Delete discount code
   * @param {Number} codeId - Discount code ID
   * @returns {Promise<Object>} Success response
   */
  async deleteDiscountCode(codeId) {
    const response = await api.delete(`/discount-codes/${codeId}`);
    return response.data;
  },

  // ==================== ANNOUNCEMENTS ====================

  /**
   * Send announcement
   * @param {Object} announcementData - Announcement information
   * @returns {Promise<Object>} Announcement details
   */
  async sendAnnouncement(announcementData) {
    const response = await api.post(
      "/admin/notifications/announcement",
      announcementData
    );
    return response.data.data;
  },
};

export default adminService;
