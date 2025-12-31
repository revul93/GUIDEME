import api from "../utils/api";

export const authService = {
  // Step 1: Request OTP for registration
  requestRegistrationOTP: async (userData) => {
    try {
      const identifier =
        userData.channel === "email"
          ? userData.email
          : `${userData.countryCode}${userData.phone}`;

      const response = await api.post("/api/auth/request-otp", {
        identifier,
        channel: userData.channel, // "email" or "whatsapp"
        purpose: "register",
        email: userData.email,
        phoneNumber: `${userData.countryCode}${userData.phone}`,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Step 2: Verify OTP and complete registration
  verifyRegistrationOTP: async (userData, code) => {
    try {
      const identifier =
        userData.channel === "email"
          ? userData.email
          : `${userData.countryCode}${userData.phone}`;

      const response = await api.post("/api/auth/verify-otp", {
        identifier,
        code,
        channel: userData.channel,
        purpose: "register",
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email,
        phoneNumber: `${userData.countryCode}${userData.phone}`,
        specialty: userData.specialty,
        specialtyOther:
          userData.specialty === "OTHER" ? userData.specialtyOther : null,
        clinicName: userData.clinicName,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Step 1: Request OTP for login
  requestLoginOTP: async (identifier, channel) => {
    try {
      const response = await api.post("/api/auth/request-otp", {
        identifier, // email or full phone (+966501234567)
        channel, // "email" or "whatsapp"
        purpose: "login",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Step 2: Verify OTP and complete login
  verifyLoginOTP: async (identifier, code, channel) => {
    try {
      const response = await api.post("/api/auth/verify-otp", {
        identifier,
        code,
        channel,
        purpose: "login",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await api.post("/api/auth/logout");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get("/api/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
