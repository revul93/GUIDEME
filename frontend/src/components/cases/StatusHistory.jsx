import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext.jsx";
import caseService from "../../services/caseService";
import { formatDate, getStatusColor } from "../../utils/formatters";

const StatusHistory = ({ caseId }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [caseId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await caseService.getStatusHistory(caseId);
      setHistory(data || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon for change type
  const getChangeIcon = (changedBy) => {
    const icons = {
      client: "👤",
      designer: "🎨",
      admin: "⚙️",
      system: "🤖",
    };
    return icons[changedBy] || "📝";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary dark:border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">
          {t("viewCase.noHistory")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-primary dark:text-light mb-6">
        {t("viewCase.statusHistory")}
      </h2>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        {/* Timeline items */}
        <div className="space-y-6">
          {history.map((item, index) => (
            <div key={item.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-12 h-12 rounded-full ${getStatusColor(item.toStatus).replace('text-', 'bg-').split(' ')[0]} flex items-center justify-center text-white text-lg shadow-lg`}>
                  {getChangeIcon(item.changedBy)}
                </div>
              </div>

              {/* Content card */}
              <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {item.fromStatus && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {t(`status.${item.fromStatus}`)}
                        </span>
                      )}
                      {item.fromStatus && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                      <span className="text-sm font-semibold text-primary dark:text-accent">
                        {t(`status.${item.toStatus}`)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.createdAt, language)}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                    {t(`changedBy.${item.changedBy}`)}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-sm text-charcoal dark:text-light mt-2">
                    {item.notes}
                  </p>
                )}

                {/* Changed by info */}
                {(item.client || item.designer) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("viewCase.changedBy")}:{" "}
                      <span className="font-medium text-charcoal dark:text-light">
                        {item.client?.name || item.designer?.name}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusHistory;
