import api from "../utils/api";

class AuthService {
  async requestOTP(identifier, channel, purpose = "login", extraData = {}) {
    try {
      const payload = {
        identifier,
        channel,
        purpose,
        ...extraData,
      };

      const response = await api.post("/api/auth/request-otp", payload);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Request OTP error:", error.response?.data || error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
        error: error.response?.data?.error,
        waitSeconds: error.response?.data?.waitSeconds,
      };
    }
  }

  /**
   * Verify OTP and authenticate user
   * @param {string} identifier - Email or phone number
   * @param {string} code - OTP code
   * @param {string} channel - 'email' or 'whatsapp'
   * @param {string} purpose - 'login' or 'register'
   * @param {object} userData - User data for registration
   */
  async verifyOTP(identifier, code, channel, purpose = "login", userData = {}) {
    try {
      const payload = {
        identifier,
        code,
        channel,
        purpose,
        ...userData,
      };

      const response = await api.post("/api/auth/verify-otp", payload);

      console.log("Verify OTP Response:", response.data);

      if (response.data && response.data.success) {
        // Return data WITHOUT storing tokens
        // Let AuthContext handle token storage
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }

      return {
        success: false,
        message: response.data.message || "Verification failed",
      };
    } catch (error) {
      console.error("Verify OTP error:", error.response?.data || error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Verification failed. Please try again.",
        errors: error.response?.data?.errors,
      };
    }
  }

  /**
   * Logout user and blacklist token
   */
  async logout() {
    try {
      const token = this.getAccessToken();

      if (token) {
        await api.post("/api/auth/logout");
      }

      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      console.error("Logout error:", error);

      // Still clear local storage even if API call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      return {
        success: true,
        message: "Logged out locally",
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    return !!(token && user);
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
      return null;
    }
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken() {
    return localStorage.getItem("accessToken");
  }
}

export const authService = new AuthService();
export default authService;
