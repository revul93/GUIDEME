import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add notification
  const addNotification = useCallback(
    (message, type = "info", duration = 5000) => {
      const id = Date.now() + Math.random();
      const notification = { id, message, type, duration };

      setNotifications((prev) => [...prev, notification]);

      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    []
  );

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Shorthand methods
  const success = useCallback(
    (message, duration) => {
      return addNotification(message, "success", duration);
    },
    [addNotification]
  );

  const error = useCallback(
    (message, duration) => {
      return addNotification(message, "error", duration);
    },
    [addNotification]
  );

  const warning = useCallback(
    (message, duration) => {
      return addNotification(message, "warning", duration);
    },
    [addNotification]
  );

  const info = useCallback(
    (message, duration) => {
      return addNotification(message, "info", duration);
    },
    [addNotification]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg animate-slide-in-right flex items-start gap-3 ${
                notification.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  : notification.type === "error"
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  : notification.type === "warning"
                  ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                  : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === "success" && (
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {notification.type === "error" && (
                  <svg
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {notification.type === "warning" && (
                  <svg
                    className="w-5 h-5 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                )}
                {notification.type === "info" && (
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>

              {/* Message */}
              <p
                className={`text-sm flex-1 ${
                  notification.type === "success"
                    ? "text-green-800 dark:text-green-300"
                    : notification.type === "error"
                    ? "text-red-800 dark:text-red-300"
                    : notification.type === "warning"
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-blue-800 dark:text-blue-300"
                }`}
              >
                {notification.message}
              </p>

              {/* Close Button */}
              <button
                onClick={() => removeNotification(notification.id)}
                className={`flex-shrink-0 ${
                  notification.type === "success"
                    ? "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    : notification.type === "error"
                    ? "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                    : notification.type === "warning"
                    ? "text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
                    : "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};
