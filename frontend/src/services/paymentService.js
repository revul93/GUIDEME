import api from "../utils/api";

/**
 * Payment Service - Handles all payment-related API operations
 */
class PaymentService {
  /**
   * Get all payments with filters
   * @param {Object} params - Query parameters
   */
  async getPayments(params = {}) {
    try {
      const response = await api.get("/api/payments", { params });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Get payments error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch payments",
      };
    }
  }

  /**
   * Get single payment by ID
   * @param {string|number} paymentId - Payment ID
   */
  async getPayment(paymentId) {
    try {
      const response = await api.get(`/api/payments/${paymentId}`);
      return {
        success: true,
        data: response.data.data.payment,
      };
    } catch (error) {
      console.error("Get payment error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch payment",
      };
    }
  }

  /**
   * Upload study fee payment proof
   * @param {Object} paymentData - Payment data
   */
  async uploadStudyPayment(paymentData) {
    try {
      const response = await api.post("/api/payments/study-fee", paymentData);
      return {
        success: true,
        data: response.data.data.payment,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Upload study payment error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to upload payment proof",
      };
    }
  }

  /**
   * Upload production fee payment proof
   * @param {Object} paymentData - Payment data
   */
  async uploadProductionPayment(paymentData) {
    try {
      const response = await api.post(
        "/api/payments/production-fee",
        paymentData
      );
      return {
        success: true,
        data: response.data.data.payment,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Upload production payment error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to upload payment proof",
      };
    }
  }

  /**
   * Verify payment (Admin only)
   * @param {string|number} paymentId - Payment ID
   * @param {string} verificationNotes - Optional notes
   */
  async verifyPayment(paymentId, verificationNotes = null) {
    try {
      const response = await api.put(`/api/payments/${paymentId}/verify`, {
        verificationNotes,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Verify payment error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to verify payment",
      };
    }
  }

  /**
   * Reject payment (Admin only)
   * @param {string|number} paymentId - Payment ID
   * @param {string} rejectionReason - Rejection reason
   */
  async rejectPayment(paymentId, rejectionReason) {
    try {
      const response = await api.put(`/api/payments/${paymentId}/reject`, {
        rejectionReason,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Reject payment error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject payment",
      };
    }
  }

  /**
   * Request refund (Client only)
   * @param {string|number} paymentId - Payment ID
   * @param {string} refundReason - Refund reason
   */
  async requestRefund(paymentId, refundReason) {
    try {
      const response = await api.post(
        `/api/payments/${paymentId}/refund-request`,
        {
          refundReason,
        }
      );
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Request refund error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to request refund",
      };
    }
  }

  /**
   * Approve refund (Admin only)
   * @param {string|number} paymentId - Payment ID
   * @param {number} refundAmount - Refund amount
   * @param {string} refundNotes - Optional notes
   */
  async approveRefund(paymentId, refundAmount, refundNotes = null) {
    try {
      const response = await api.put(
        `/api/payments/${paymentId}/refund-approve`,
        {
          refundAmount,
          refundNotes,
        }
      );
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Approve refund error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to approve refund",
      };
    }
  }

  /**
   * Reject refund (Admin only)
   * @param {string|number} paymentId - Payment ID
   * @param {string} rejectionReason - Rejection reason
   */
  async rejectRefund(paymentId, rejectionReason) {
    try {
      const response = await api.put(
        `/api/payments/${paymentId}/refund-reject`,
        {
          rejectionReason,
        }
      );
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Reject refund error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject refund",
      };
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
