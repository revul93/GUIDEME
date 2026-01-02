import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService.js";
import { useNotification } from "./NotificationContext.jsx";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const notification = useNotification();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
      setIsAuthenticated(false);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData, token) => {
    try {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      const navigateTo = getNavigationPath(userData.role);

      setTimeout(() => {
        navigate(navigateTo, { replace: true });
        notification?.success("Login successful!");
      }, 100);
    } catch (error) {
      console.error("Login error:", error);
      notification?.error("Login failed. Please try again.");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const getNavigationPath = (role) => {
    switch (role) {
      case "client":
        return "/dashboard/mycases";
      case "designer":
        return "/designer/cases";
      default:
        return "/";
    }
  };

  const logout = async () => {
    try {
      // Call backend to blacklist token
      await authService.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Always clear local state regardless of API response
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);

      // Navigate to home
      navigate("/", { replace: true });
      notification?.info("You have been logged out");
    }
  };

  /**
   * Update user data in state and localStorage
   */
  const updateUser = (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Update user error:", error);
      notification?.error("Failed to update user data");
    }
  };

  /**
   * Get current user role
   */
  const getUserRole = () => {
    return user?.role || null;
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return user?.role === "designer" && user?.profile?.isAdmin === true;
  };

  /**
   * Get profile ID
   */
  const getProfileId = () => {
    return user?.profile?.id || null;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    checkAuth,
    getUserRole,
    hasRole,
    isAdmin,
    getProfileId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
