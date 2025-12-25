import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext.jsx";
import api from "../../utils/api.js";

const CaseComments = ({ caseId }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchComments();
  }, [caseId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/cases/${caseId}/comments`);
      if (response.data.success) {
        setComments(response.data.data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
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

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(t("viewCase.comments.fileTooLarge"));
        return;
      }
      setSelectedFile(file);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  // Submit comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() && !selectedFile) {
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await api.post("/api/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        });

        if (uploadResponse.data.success) {
          fileUrl = uploadResponse.data.data.fileUrl;
          fileName = uploadResponse.data.data.fileName;
          fileSize = uploadResponse.data.data.fileSize;
        }
      }

      // Create comment
      const response = await api.post(`/api/cases/${caseId}/comments`, {
        comment: newComment.trim() || null,
        fileUrl,
        fileName,
        fileSize,
      });

      if (response.data.success) {
        setNewComment("");
        setSelectedFile(null);
        setUploadProgress(0);
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      alert(error.response?.data?.message || t("viewCase.comments.submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary dark:border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-primary dark:text-light mb-6">
        {t("viewCase.comments.title")}
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t("viewCase.comments.placeholder")}
            rows={4}
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-charcoal dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
          />

          {/* File Selection */}
          <div className="mt-3 flex items-center gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                onChange={handleFileSelect}
                disabled={isSubmitting}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.zip,.rar"
              />
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-charcoal dark:text-light rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-sm font-medium">
                  {t("viewCase.comments.attachFile")}
                </span>
              </div>
            </label>

            {selectedFile && (
              <div className="flex-1 flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  disabled={isSubmitting}
                  className="ml-2 p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {t("viewCase.comments.uploading")}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || (!newComment.trim() && !selectedFile)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-light rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t("viewCase.comments.submitting")}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>{t("viewCase.comments.submit")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">
            {t("viewCase.comments.noComments")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-accent/10 rounded-full flex items-center justify-center">
                    <span className="text-primary dark:text-accent font-semibold">
                      {comment.commentedBy === "client" ? "C" : "D"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal dark:text-light">
                      {comment.clientProfile?.name || comment.designerProfile?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                  {t(`commentedBy.${comment.commentedBy}`)}
                </span>
              </div>

              {/* Comment Text */}
              {comment.comment && (
                <p className="text-charcoal dark:text-light whitespace-pre-wrap mb-3">
                  {comment.comment}
                </p>
              )}

              {/* Attached File */}
              {comment.fileUrl && (
                <a
                  href={comment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-primary dark:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-charcoal dark:text-light">
                      {comment.fileName}
                    </p>
                    {comment.fileSize && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(comment.fileSize)}
                      </p>
                    )}
                  </div>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseComments;
