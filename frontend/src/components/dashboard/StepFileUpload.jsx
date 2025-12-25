import { useState } from "react";
import { useTranslation } from "react-i18next";

const StepFileUpload = ({ formData, updateFormData }) => {
  const { t } = useTranslation();
  const [error, setError] = useState("");

  // File categories
  const fileCategories = [
    {
      value: "dicom",
      label: t("newCase.fileUpload.dicom") || "DICOM Files",
      desc: t("newCase.fileUpload.dicomDesc") || "CBCT or CT scans",
      accept: ".dcm,.dicom",
      icon: "🏥",
    },
    {
      value: "ct_scan",
      label: t("newCase.fileUpload.ctScan") || "CT Scan",
      desc: t("newCase.fileUpload.ctScanDesc") || "CT scan files",
      accept: ".dcm,.dicom",
      icon: "📊",
    },
    {
      value: "stl",
      label: t("newCase.fileUpload.stl") || "STL Files",
      desc: t("newCase.fileUpload.stlDesc") || "3D scan files",
      accept: ".stl",
      icon: "🦷",
    },
    {
      value: "clinical_photo",
      label: t("newCase.fileUpload.clinicalPhoto") || "Clinical Photos",
      desc: t("newCase.fileUpload.clinicalPhotoDesc") || "Patient photos",
      accept: "image/*",
      icon: "📷",
    },
    {
      value: "prescription",
      label: t("newCase.fileUpload.prescription") || "Prescription",
      desc: t("newCase.fileUpload.prescriptionDesc") || "Treatment plan/prescription",
      accept: ".pdf,image/*",
      icon: "📋",
    },
    {
      value: "other",
      label: t("newCase.fileUpload.other") || "Other Files",
      desc: t("newCase.fileUpload.otherDesc") || "ZIP, PDF, etc.",
      accept: ".zip,.rar,.7z,.pdf",
      icon: "📁",
    },
  ];

  // Validate file
  const validateFile = (file) => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: t("newCase.fileUpload.fileTooLarge") || "File size exceeds 100MB",
      };
    }

    return { valid: true };
  };

  // Handle file selection - store files locally, don't upload yet
  const handleFileSelect = (event, category) => {
    const files = Array.from(event.target.files);
    setError("");

    for (const file of files) {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error);
        continue;
      }

      // Create file object with File reference (will upload on submit)
      const fileId = `${Date.now()}-${Math.random()}-${file.name}`;
      const stagedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        category: category,
        file: file, // Store actual File object for later upload
      };

      updateFormData("stagedFiles", [
        ...(formData.stagedFiles || []),
        stagedFile,
      ]);
    }

    // Clear input
    event.target.value = "";
  };

  // Handle file delete
  const handleFileDelete = (fileId) => {
    updateFormData(
      "stagedFiles",
      (formData.stagedFiles || []).filter((f) => f.id !== fileId)
    );
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Get files by category
  const getFilesByCategory = (category) => {
    return (formData.stagedFiles || []).filter((f) => f.category === category);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary dark:text-light mb-2">
          {t("newCase.fileUpload.title") || "Upload Files"}
        </h2>
        <p className="text-charcoal dark:text-gray-400">
          {t("newCase.fileUpload.subtitle") || "Select files to upload with your case"}
        </p>
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            {t("newCase.fileUpload.stageNotice") || "Files will be uploaded when you submit the case"}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* File Categories - Compact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fileCategories.map((category) => {
          const categoryFiles = getFilesByCategory(category.value);
          
          return (
            <div
              key={category.value}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-primary dark:text-light">
                      {category.label}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {category.desc}
                    </p>
                  </div>
                </div>
                {categoryFiles.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                    {categoryFiles.length}
                  </span>
                )}
              </div>

              {/* Upload Button */}
              <label className="block cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept={category.accept}
                  onChange={(e) => handleFileSelect(e, category.value)}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-primary dark:hover:border-accent hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                  <svg
                    className="w-8 h-8 text-gray-400 mx-auto mb-2"
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
                  <p className="text-xs font-medium text-charcoal dark:text-light">
                    {t("newCase.fileUpload.selectFiles") || "Select files"}
                  </p>
                </div>
              </label>

              {/* Selected Files - Compact List */}
              {categoryFiles.length > 0 && (
                <div className="mt-3 space-y-1">
                  {categoryFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg
                          className="w-4 h-4 text-blue-500 flex-shrink-0"
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
                          <p className="font-medium text-charcoal dark:text-light truncate">
                            {file.name}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFileDelete(file.id)}
                        className="ml-2 p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {(formData.stagedFiles || []).length > 0 && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-800 dark:text-green-400">
              {(formData.stagedFiles || []).length} {t("newCase.fileUpload.filesReady") || "files ready to upload"}
            </p>
          </div>
        </div>
      )}

      {/* Info Notice */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-amber-800 dark:text-amber-400">
            {t("newCase.fileUpload.notice") || "Maximum file size is 100MB. Supported formats: DICOM, STL, images, PDF, ZIP."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepFileUpload;
