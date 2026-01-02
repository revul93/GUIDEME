/**
 * Notification Service
 * Handles in-app web notifications
 */

import api from "../utils/api";

const notificationService = {
  /**
   * Get notifications with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Notifications with pagination
   */
  async getNotifications(params = {}) {
    const { page = 1, limit = 20, unreadOnly = false, purpose } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(unreadOnly && { unreadOnly: "true" }),
      ...(purpose && { purpose }),
    });

    const response = await api.get(`/notifications?${queryParams}`);
    return response.data;
  },

  /**
   * Get unread notification count
   * @returns {Promise<Number>} Unread count
   */
  async getUnreadCount() {
    const response = await api.get("/notifications/unread-count");
    return response.data.data.unreadCount;
  },

  /**
   * Mark single notification as read
   * @param {Number} notificationId - Notification ID
   * @returns {Promise<Object>} Success response
   */
  async markAsRead(notificationId) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Success response with count
   */
  async markAllAsRead() {
    const response = await api.put("/notifications/mark-all-read");
    return response.data;
  },

  /**
   * Delete single notification
   * @param {Number} notificationId - Notification ID
   * @returns {Promise<Object>} Success response
   */
  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Clear all read notifications
   * @returns {Promise<Object>} Success response with count
   */
  async clearAllRead() {
    const response = await api.delete("/notifications/clear-read");
    return response.data;
  },
};

export default notificationService;
