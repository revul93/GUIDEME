import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import caseService from "../services/caseService";
import {
  formatDate,
  formatStatus,
  getStatusBadgeClass,
} from "../utils/formatters";

const MyCases = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [allCases, setAllCases] = useState([]);
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

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const statsData = await caseService.getCaseStats();
      setStats(statsData.data);

      const casesData = await caseService.getCases({
        page: 1,
        limit: 1000,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setAllCases(casesData.cases);
    } catch (err) {
      setError(err.message || t("errors.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort using useMemo
  const filteredCases = useMemo(() => {
    let result = [...allCases];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (caseItem) =>
          caseItem.caseNumber.toLowerCase().includes(searchLower) ||
          (caseItem.patientRef &&
            caseItem.patientRef.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((caseItem) => caseItem.status === filters.status);
    }

    // Apply procedure category filter
    if (filters.procedureCategory) {
      result = result.filter(
        (caseItem) => caseItem.procedureCategory === filters.procedureCategory
      );
    }

    // Sort results
    result.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (
        sortBy === "createdAt" ||
        sortBy === "submittedAt" ||
        sortBy === "updatedAt"
      ) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string sorting
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [allCases, filters, sortBy, sortOrder]);

  // Calculate pagination values
  const paginationValues = useMemo(() => {
    return {
      total: filteredCases.length,
      totalPages: Math.ceil(filteredCases.length / pagination.limit),
    };
  }, [filteredCases.length, pagination.limit]);

  // Get displayed cases for current page
  const displayedCases = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredCases.slice(startIndex, endIndex);
  }, [filteredCases, pagination.page, pagination.limit]);

  // Update pagination when filters change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
      total: paginationValues.total,
      totalPages: paginationValues.totalPages,
    }));
  }, [paginationValues.total, paginationValues.totalPages]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) {
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
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={fetchInitialData}
                className="mt-4 px-6 py-2 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg"
              >
                {t("common.retry")}
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary dark:text-light">
              {t("dashboard.title")}
            </h1>
            <p className="mt-1 text-charcoal dark:text-gray-400">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/cases/new")}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("dashboard.newCase")}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal dark:text-gray-400">
                    {t("dashboard.stats.total")}
                  </p>
                  <p className="text-3xl font-bold text-primary dark:text-light mt-1">
                    {stats.overview.totalCases}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal dark:text-gray-400">
                    {t("dashboard.stats.active")}
                  </p>
                  <p className="text-3xl font-bold text-primary dark:text-light mt-1">
                    {stats.overview.activeCases}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal dark:text-gray-400">
                    {t("dashboard.stats.completed")}
                  </p>
                  <p className="text-3xl font-bold text-primary dark:text-light mt-1">
                    {stats.overview.completedCases}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
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
                </div>
              </div>
            </div>

            <div className="bg-light dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal dark:text-gray-400">
                    {t("dashboard.stats.pending")}
                  </p>
                  <p className="text-3xl font-bold text-primary dark:text-light mt-1">
                    {stats.overview.pendingCases}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
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
                <option value="submitted">{t("status.submitted")}</option>
                <option value="study_in_progress">
                  {t("status.study_in_progress")}
                </option>
                <option value="quote_sent">{t("status.quote_sent")}</option>
                <option value="in_production">
                  {t("status.in_production")}
                </option>
                <option value="delivered">{t("status.delivered")}</option>
                <option value="completed">{t("status.completed")}</option>
              </select>
            </div>

            {/* Procedure Category Filter */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-2">
                {t("dashboard.filters.category")}
              </label>
              <select
                value={filters.procedureCategory}
                onChange={(e) =>
                  handleFilterChange("procedureCategory", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              >
                <option value="">{t("dashboard.filters.allCategories")}</option>
                <option value="single_implant">
                  {t("procedureCategory.single_implant")}
                </option>
                <option value="multiple_implant">
                  {t("procedureCategory.multiple_implant")}
                </option>
                <option value="full_arch">
                  {t("procedureCategory.full_arch")}
                </option>
                <option value="gbr">{t("procedureCategory.gbr")}</option>
                <option value="other">{t("procedureCategory.other")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-light dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                {displayedCases.map((caseItem) => (
                  <tr
                    key={caseItem.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/cases/${caseItem.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary dark:text-accent">
                        {caseItem.caseNumber}
                      </div>
                      {caseItem._count && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-charcoal dark:text-gray-400">
                          <span>
                            {caseItem._count.files} {t("dashboard.table.files")}
                          </span>
                          <span>•</span>
                          <span>
                            {caseItem._count.comments}{" "}
                            {t("dashboard.table.comments")}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-charcoal dark:text-light">
                        {t(`procedureCategory.${caseItem.procedureCategory}`)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                          caseItem.status
                        )}`}
                      >
                        {formatStatus(caseItem.status, t)}
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
                          navigate(`/dashboard/cases/${caseItem.id}`);
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
          {!loading && displayedCases.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-charcoal dark:text-light">
                {t("dashboard.empty.title")}
              </h3>
              <p className="mt-1 text-sm text-charcoal dark:text-gray-400">
                {t("dashboard.empty.description")}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/dashboard/cases/new")}
                  className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <svg
                    className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
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
                {t("pagination.showing")}{" "}
                {(pagination.page - 1) * pagination.limit + 1}{" "}
                {t("pagination.to")}{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                {t("pagination.of")} {pagination.total}{" "}
                {t("pagination.results")}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-charcoal dark:text-light rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("pagination.previous")}
                </button>
                <span className="px-4 py-2 text-charcoal dark:text-light">
                  {t("pagination.page")} {pagination.page} {t("pagination.of")}{" "}
                  {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
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
