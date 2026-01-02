import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const publicPaths = ["/", "/about", "/contact"];

      // Only clear and redirect if not already on public page
      if (!publicPaths.includes(currentPath)) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        // Redirect to home with return URL
        const returnUrl = encodeURIComponent(currentPath);
        window.location.href = `/?returnUrl=${returnUrl}`;
      }
    }

    // Handle 403 Forbidden - Account locked/suspended
    if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response.data);

      // If account is locked, clear session
      if (
        error.response.data.message?.includes("locked") ||
        error.response.data.message?.includes("suspended")
      ) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      error.message = "Network error. Please check your connection.";
    }

    // Handle timeout
    if (error.code === "ECONNABORTED") {
      error.message = "Request timeout. Please try again.";
    }

    return Promise.reject(error);
  }
);

export default api;
