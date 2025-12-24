import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

const MyCases = () => {
  const { t } = useTranslation();
  
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters & Pagination
  const [filters, setFilters] = useState({
    status: "",
    procedureCategory: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch cases
  useEffect(() => {
    fetchCases();
  }, [filters, pagination.page, pagination.limit, sortBy, sortOrder]);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/cases/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (filters.status) params.status = filters.status;
      if (filters.procedureCategory) params.procedureCategory = filters.procedureCategory;

      const response = await axios.get("/api/cases", { params });
      
      if (response.data.success) {
        setCases(response.data.data.cases);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch cases");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status) => {
    const statusColors = {
      submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      pending_study_payment_verification: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      study_in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      study_completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      quote_pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      quote_sent: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      quote_accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      quote_rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      in_production: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      production_completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      ready_for_pickup: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading && !cases.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-light mb-2">
            {t("dashboard.myCases.title")}
          </h1>
          <p className="text-charcoal dark:text-gray-400">
            {t("dashboard.myCases.subtitle")}
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal dark:text-gray-400 mb-1">
                    {t("dashboard.stats.total")}
                  </p>
                  <p className="text-3xl font-bold text-primary dark:text-light">
                    {stats.overview.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 dark:bg-accent/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary dark:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal dark:text-gray-400 mb-1">
                    {t("dashboard.stats.pending")}
                  </p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.overview.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal dark:text-gray-400 mb-1">
                    {t("dashboard.stats.active")}
                  </p>
                  <p className="text-3xl font-bold text-accent dark:text-accent-secondary">
                    {stats.overview.active}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 dark:bg-accent/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent dark:text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal dark:text-gray-400 mb-1">
                    {t("dashboard.stats.delivered")}
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.overview.delivered}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal dark:text-gray-400 mb-1">
                    {t("dashboard.stats.cancelled")}
                  </p>
                  <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                    {stats.overview.cancelled}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                {t("dashboard.filters.search")}
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder={t("dashboard.filters.searchPlaceholder")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                {t("dashboard.filters.status")}
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              >
                <option value="">{t("dashboard.filters.allStatuses")}</option>
                <option value="submitted">Submitted</option>
                <option value="study_in_progress">Study In Progress</option>
                <option value="quote_sent">Quote Sent</option>
                <option value="in_production">In Production</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Procedure Category Filter */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                {t("dashboard.filters.category")}
              </label>
              <select
                value={filters.procedureCategory}
                onChange={(e) => handleFilterChange("procedureCategory", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              >
                <option value="">{t("dashboard.filters.allCategories")}</option>
                <option value="single_implant">Single Implant</option>
                <option value="multiple_implant">Multiple Implant</option>
                <option value="full_arch">Full Arch</option>
                <option value="gbr">GBR</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-light dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-charcoal dark:text-gray-400 uppercase tracking-wider">
                    {t("dashboard.table.caseNumber")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-charcoal dark:text-gray-400 uppercase tracking-wider">
                    {t("dashboard.table.category")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-charcoal dark:text-gray-400 uppercase tracking-wider">
                    {t("dashboard.table.status")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-charcoal dark:text-gray-400 uppercase tracking-wider">
                    {t("dashboard.table.submitted")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-charcoal dark:text-gray-400 uppercase tracking-wider">
                    {t("dashboard.table.updated")}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-charcoal dark:text-gray-400 uppercase tracking-wider">
                    {t("dashboard.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {cases.map((caseItem) => (
                  <tr
                    key={caseItem.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/cases/${caseItem.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary dark:text-accent">
                        {caseItem.caseNumber}
                      </div>
                      {caseItem._count && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-charcoal dark:text-gray-400">
                          <span>{caseItem._count.files} files</span>
                          <span>•</span>
                          <span>{caseItem._count.comments} comments</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-charcoal dark:text-light">
                        {caseItem.procedureCategory.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                        {formatStatus(caseItem.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal dark:text-gray-400">
                      {formatDate(caseItem.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal dark:text-gray-400">
                      {formatDate(caseItem.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/dashboard/cases/${caseItem.id}`;
                        }}
                        className="text-accent hover:text-accent-secondary transition-colors"
                      >
                        {t("dashboard.table.view")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!loading && cases.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-charcoal dark:text-light">
                {t("dashboard.empty.title")}
              </h3>
              <p className="mt-1 text-sm text-charcoal dark:text-gray-400">
                {t("dashboard.empty.description")}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => window.location.href = "/dashboard/cases/new"}
                  className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t("dashboard.empty.createCase")}
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-charcoal dark:text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-charcoal dark:text-light rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("pagination.previous")}
                </button>
                <span className="px-4 py-2 text-charcoal dark:text-light">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-charcoal dark:text-light rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("pagination.next")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCases;
