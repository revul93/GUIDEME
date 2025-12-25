import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext.jsx";

const CaseDetails = ({ caseData, refreshData }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      dicom: "🏥",
      ct_scan: "📊",
      stl: "🦷",
      clinical_photo: "📷",
      prescription: "📋",
      other: "📁",
    };
    return icons[category] || "📄";
  };

  // Group files by category
  const filesByCategory = (caseData.files || []).reduce((acc, file) => {
    if (!acc[file.category]) {
      acc[file.category] = [];
    }
    acc[file.category].push(file);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Case Information */}
      <div>
        <h2 className="text-xl font-bold text-primary dark:text-light mb-4">
          {t("viewCase.caseInformation")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t("viewCase.fields.caseNumber")}
            </label>
            <p className="text-charcoal dark:text-light font-medium">
              {caseData.caseNumber}
            </p>
          </div>

          {caseData.patientRef && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t("viewCase.fields.patientRef")}
              </label>
              <p className="text-charcoal dark:text-light font-medium">
                {caseData.patientRef}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t("viewCase.fields.procedureCategory")}
            </label>
            <p className="text-charcoal dark:text-light font-medium">
              {t(`procedureCategory.${caseData.procedureCategory}`)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t("viewCase.fields.guideType")}
            </label>
            <p className="text-charcoal dark:text-light font-medium">
              {t(`guideType.${caseData.guideType}`)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t("viewCase.fields.requiredService")}
            </label>
            <p className="text-charcoal dark:text-light font-medium">
              {t(`requiredService.${caseData.requiredService}`)}
            </p>
          </div>

          {caseData.implantSystem && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t("viewCase.fields.implantSystem")}
              </label>
              <p className="text-charcoal dark:text-light font-medium">
                {caseData.implantSystem}
              </p>
            </div>
          )}

          {caseData.teethNumbers && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t("viewCase.fields.teethNumbers")}
              </label>
              <p className="text-charcoal dark:text-light font-medium">
                {JSON.parse(caseData.teethNumbers).join(", ")}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t("viewCase.fields.submittedAt")}
            </label>
            <p className="text-charcoal dark:text-light font-medium">
              {formatDate(caseData.submittedAt)}
            </p>
          </div>

          {caseData.deliveryMethod && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t("viewCase.fields.deliveryMethod")}
              </label>
              <p className="text-charcoal dark:text-light font-medium">
                {t(`deliveryMethod.${caseData.deliveryMethod}`)}
              </p>
            </div>
          )}
        </div>

        {caseData.clinicalNotes && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t("viewCase.fields.clinicalNotes")}
            </label>
            <p className="text-charcoal dark:text-light whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              {caseData.clinicalNotes}
            </p>
          </div>
        )}
      </div>

      {/* Files Section */}
      {caseData.files && caseData.files.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-primary dark:text-light mb-4">
            {t("viewCase.uploadedFiles")}
          </h2>
          <div className="space-y-4">
            {Object.entries(filesByCategory).map(([category, files]) => (
              <div
                key={category}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{getCategoryIcon(category)}</span>
                  <h3 className="text-sm font-semibold text-primary dark:text-light">
                    {t(`fileCategory.${category}`)}
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                    {files.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <svg
                          className="w-5 h-5 text-primary dark:text-accent flex-shrink-0"
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-charcoal dark:text-light truncate">
                            {file.fileName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.fileSize)} • {formatDate(file.createdAt)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 p-2 text-primary dark:text-accent hover:bg-primary/10 dark:hover:bg-accent/10 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Information */}
      {caseData.clientProfile && (
        <div>
          <h2 className="text-xl font-bold text-primary dark:text-light mb-4">
            {t("viewCase.clientInformation")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t("viewCase.fields.clientName")}
              </label>
              <p className="text-charcoal dark:text-light font-medium">
                {caseData.clientProfile.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t("viewCase.fields.clientType")}
              </label>
              <p className="text-charcoal dark:text-light font-medium">
                {t(`clientType.${caseData.clientProfile.clientType}`)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;
