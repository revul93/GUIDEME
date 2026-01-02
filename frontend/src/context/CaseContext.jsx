import { createContext, useContext, useState, useCallback } from "react";
import caseService from "../services/caseService.js";
import { useNotification } from "./NotificationContext.jsx";

const CaseContext = createContext();

export const useCase = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error("useCase must be used within CaseProvider");
  }
  return context;
};

export const CaseProvider = ({ children }) => {
  const [cases, setCases] = useState([]);
  const [currentCase, setCurrentCase] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const notification = useNotification();

  /**
   * Fetch all cases with optional filters
   */
  const fetchCases = useCallback(
    async (params = {}) => {
      setIsLoading(true);
      setError(null);

      const result = await caseService.getCases(params);

      if (result.success) {
        setCases(result.data.cases);
        return result.data;
      } else {
        setError(result.message);
        notification?.error(result.message);
        return null;
      }

      setIsLoading(false);
    },
    [notification]
  );

  /**
   * Fetch single case by ID
   */
  const fetchCase = useCallback(
    async (caseId) => {
      setIsLoading(true);
      setError(null);

      const result = await caseService.getCase(caseId);

      if (result.success) {
        setCurrentCase(result.data);
        return result.data;
      } else {
        setError(result.message);
        notification?.error(result.message);
        return null;
      }

      setIsLoading(false);
    },
    [notification]
  );

  /**
   * Create new case
   */
  const createCase = useCallback(
    async (caseData) => {
      setIsLoading(true);
      setError(null);

      const result = await caseService.createCase(caseData);

      setIsLoading(false);

      if (result.success) {
        notification?.success(result.message || "Case created successfully");
        // Add new case to list optimistically
        setCases((prev) => [result.data, ...prev]);
        return result.data;
      } else {
        setError(result.message);
        notification?.error(result.message);
        return null;
      }
    },
    [notification]
  );

  /**
   * Update case
   */
  const updateCase = useCallback(
    async (caseId, updates) => {
      setIsLoading(true);
      setError(null);

      const result = await caseService.updateCase(caseId, updates);

      setIsLoading(false);

      if (result.success) {
        notification?.success(result.message || "Case updated successfully");

        // Update case in list
        setCases((prev) =>
          prev.map((c) => (c.id === caseId ? result.data : c))
        );

        // Update current case if viewing
        if (currentCase?.id === caseId) {
          setCurrentCase(result.data);
        }

        return result.data;
      } else {
        setError(result.message);
        notification?.error(result.message);
        return null;
      }
    },
    [currentCase, notification]
  );

  /**
   * Update case status
   */
  const updateCaseStatus = useCallback(
    async (caseId, status, notes = null) => {
      setIsLoading(true);
      setError(null);

      const result = await caseService.updateCaseStatus(caseId, status, notes);

      setIsLoading(false);

      if (result.success) {
        notification?.success(result.message || "Status updated successfully");

        // Update case in list
        setCases((prev) =>
          prev.map((c) => (c.id === caseId ? { ...c, status } : c))
        );

        // Update current case if viewing
        if (currentCase?.id === caseId) {
          setCurrentCase((prev) => ({ ...prev, status }));
        }

        return result.data;
      } else {
        setError(result.message);
        notification?.error(result.message);
        return null;
      }
    },
    [currentCase, notification]
  );

  /**
   * Fetch case statistics
   */
  const fetchStats = useCallback(async () => {
    const result = await caseService.getCaseStats();

    if (result.success) {
      setStats(result.data);
      return result.data;
    } else {
      notification?.error(result.message);
      return null;
    }
  }, [notification]);

  /**
   * Refresh current case data
   */
  const refreshCurrentCase = useCallback(async () => {
    if (currentCase?.id) {
      return await fetchCase(currentCase.id);
    }
  }, [currentCase, fetchCase]);

  /**
   * Clear current case
   */
  const clearCurrentCase = useCallback(() => {
    setCurrentCase(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // State
    cases,
    currentCase,
    stats,
    isLoading,
    error,

    // Actions
    fetchCases,
    fetchCase,
    createCase,
    updateCase,
    updateCaseStatus,
    fetchStats,
    refreshCurrentCase,
    clearCurrentCase,
    clearError,
  };

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
};
