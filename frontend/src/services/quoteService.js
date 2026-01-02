import api from "../utils/api";

/**
 * Quote Service - Handles all quote-related API operations
 */
class QuoteService {
  /**
   * Get all quotes for a case
   * @param {string|number} caseId - Case ID
   */
  async getQuotes(caseId) {
    try {
      const response = await api.get(`/api/quotes/cases/${caseId}/quotes`);
      return {
        success: true,
        data: response.data.data.quotes,
      };
    } catch (error) {
      console.error("Get quotes error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch quotes",
      };
    }
  }

  /**
   * Get single quote by ID
   * @param {string|number} quoteId - Quote ID
   */
  async getQuote(quoteId) {
    try {
      const response = await api.get(`/api/quotes/${quoteId}`);
      return {
        success: true,
        data: response.data.data.quote,
      };
    } catch (error) {
      console.error("Get quote error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch quote",
      };
    }
  }

  /**
   * Create quote (Admin only)
   * @param {Object} quoteData - Quote data
   */
  async createQuote(quoteData) {
    try {
      const response = await api.post("/api/quotes", quoteData);
      return {
        success: true,
        data: response.data.data.quote,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Create quote error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create quote",
      };
    }
  }

  /**
   * Revise quote (Admin only)
   * @param {string|number} quoteId - Quote ID
   * @param {Object} quoteData - Updated quote data
   */
  async reviseQuote(quoteId, quoteData) {
    try {
      const response = await api.put(
        `/api/quotes/${quoteId}/revise`,
        quoteData
      );
      return {
        success: true,
        data: response.data.data.quote,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Revise quote error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to revise quote",
      };
    }
  }

  /**
   * Accept quote (Client only)
   * @param {string|number} quoteId - Quote ID
   */
  async acceptQuote(quoteId) {
    try {
      const response = await api.put(`/api/quotes/${quoteId}/accept`);
      return {
        success: true,
        data: response.data.data.quote,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Accept quote error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to accept quote",
      };
    }
  }

  /**
   * Reject quote (Client only)
   * @param {string|number} quoteId - Quote ID
   * @param {string} rejectionReason - Rejection reason
   * @param {boolean} requestRevision - Whether to request revision
   */
  async rejectQuote(quoteId, rejectionReason, requestRevision = true) {
    try {
      const response = await api.put(`/api/quotes/${quoteId}/reject`, {
        rejectionReason,
        requestRevision,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Reject quote error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject quote",
      };
    }
  }
}

export const quoteService = new QuoteService();
export default quoteService;
