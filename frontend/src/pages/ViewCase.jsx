import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import caseService from "../services/caseService";
import { getStatusBadgeClass } from "../utils/formatters";

// Tab Components
import CaseDetails from "../components/dashboard/CaseDetails.jsx";
import StatusHistory from "../components/dashboard/StatusHistory.jsx";
import CaseComments from "../components/dashboard/CaseComments.jsx";

const ViewCase = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("details");
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch case data using service
  useEffect(() => {
    fetchCaseData();
  }, [id]);

  const fetchCaseData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await caseService.getCase(id);
      setCaseData(data);
    } catch (error) {
      console.error("Failed to fetch case:", error);
      setError(error.message || t("viewCase.errors.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "details", label: t("viewCase.tabs.details"), icon: "📋" },
    { id: "history", label: t("viewCase.tabs.history"), icon: "📊" },
    { id: "comments", label: t("viewCase.tabs.comments"), icon: "💬" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary dark:border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-charcoal dark:text-gray-400">
                {t("common.loading")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
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
              </div>
              <p className="text-charcoal dark:text-light font-medium mb-4">
                {error}
              </p>
              <button
                onClick={() => navigate("/dashboard/cases")}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all"
              >
                {t("viewCase.backToCases")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard/cases")}
            className="flex items-center gap-2 text-charcoal dark:text-gray-400 hover:text-primary dark:hover:text-accent mb-4 transition-colors"
          >
            <svg
              className="w-5 h-5 rtl:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>{t("viewCase.backToCases")}</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary dark:text-light mb-2">
                {caseData.caseNumber}
              </h1>
              {caseData.patientRef && (
                <p className="text-charcoal dark:text-gray-400">
                  {t("viewCase.patientRef")}: {caseData.patientRef}
                </p>
              )}
            </div>
            <span
              className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusBadgeClass(
                caseData.status
              )}`}
            >
              {t(`status.${caseData.status}`)}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-light dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "text-primary dark:text-accent border-b-2 border-primary dark:border-accent bg-primary/5 dark:bg-accent/5"
                      : "text-charcoal dark:text-gray-400 hover:text-primary dark:hover:text-accent hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "details" && (
              <CaseDetails caseData={caseData} refreshData={fetchCaseData} />
            )}
            {activeTab === "history" && <StatusHistory caseId={id} />}
            {activeTab === "comments" && <CaseComments caseId={id} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCase;
