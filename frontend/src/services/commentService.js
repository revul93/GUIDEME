import api from "../utils/api";

/**
 * Comment Service - Handles case comment operations
 */
class CommentService {
  /**
   * Get comments for a case
   * @param {string|number} caseId - Case ID
   */
  async getComments(caseId) {
    try {
      const response = await api.get(`/api/comments/cases/${caseId}/comments`);
      return {
        success: true,
        data: response.data.data.comments || [],
      };
    } catch (error) {
      console.error("Get comments error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch comments",
      };
    }
  }

  /**
   * Add comment to case
   * @param {string|number} caseId - Case ID
   * @param {Object} commentData - Comment data
   */
  async addComment(caseId, commentData) {
    try {
      const response = await api.post(
        `/api/comments/cases/${caseId}/comments`,
        commentData
      );
      return {
        success: true,
        data: response.data.data.comment,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Add comment error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add comment",
      };
    }
  }

  /**
   * Mark comment as read
   * @param {string|number} commentId - Comment ID
   */
  async markAsRead(commentId) {
    try {
      const response = await api.put(`/api/comments/${commentId}/read`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Mark comment as read error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to mark comment as read",
      };
    }
  }

  /**
   * Mark all comments as read for a case
   * @param {string|number} caseId - Case ID
   */
  async markAllAsRead(caseId) {
    try {
      const response = await api.put(`/api/comments/cases/${caseId}/read-all`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Mark all comments as read error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to mark all comments as read",
      };
    }
  }
}

export const commentService = new CommentService();
export default commentService;
