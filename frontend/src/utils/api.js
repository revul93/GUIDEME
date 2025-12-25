import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      // You could show a toast notification here
    }

    return Promise.reject(error);
  }
);

export default api;
