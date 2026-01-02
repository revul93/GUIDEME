import api from "../utils/api";

/**
 * Case Service - Handles all case-related API operations
 */
class CaseService {
  /**
   * Get all cases with filters
   * @param {Object} params - Query parameters
   */
  async getCases(params = {}) {
    try {
      const response = await api.get("/api/cases", { params });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Get cases error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch cases",
      };
    }
  }

  /**
   * Get single case by ID
   * @param {string|number} caseId - Case ID
   */
  async getCase(caseId) {
    try {
      const response = await api.get(`/api/cases/${caseId}`);
      return {
        success: true,
        data: response.data.data.case,
      };
    } catch (error) {
      console.error("Get case error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch case",
      };
    }
  }

  /**
   * Create new case
   * @param {Object} caseData - Case data
   */
  async createCase(caseData) {
    try {
      const response = await api.post("/api/cases", caseData);
      return {
        success: true,
        data: response.data.data.case,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Create case error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create case",
        errors: error.response?.data?.errors,
      };
    }
  }

  /**
   * Update existing case
   * @param {string|number} caseId - Case ID
   * @param {Object} updates - Updated data
   */
  async updateCase(caseId, updates) {
    try {
      const response = await api.put(`/api/cases/${caseId}`, updates);
      return {
        success: true,
        data: response.data.data.case,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Update case error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update case",
        errors: error.response?.data?.errors,
      };
    }
  }

  /**
   * Update case status
   * @param {string|number} caseId - Case ID
   * @param {string} status - New status
   * @param {string} notes - Optional notes
   */
  async updateCaseStatus(caseId, status, notes = null) {
    try {
      const response = await api.patch(`/api/cases/${caseId}/status`, {
        status,
        notes,
      });
      return {
        success: true,
        data: response.data.data.case,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Update case status error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update status",
        allowedStatuses: error.response?.data?.allowedStatuses,
      };
    }
  }

  /**
   * Get allowed statuses for a case
   * @param {string|number} caseId - Case ID
   */
  async getAllowedStatuses(caseId) {
    try {
      const response = await api.get(`/api/cases/${caseId}/allowed-statuses`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Get allowed statuses error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch allowed statuses",
      };
    }
  }

  /**
   * Get case status history
   * @param {string|number} caseId - Case ID
   */
  async getStatusHistory(caseId) {
    try {
      const response = await api.get(`/api/cases/${caseId}/status-history`);
      return {
        success: true,
        data: response.data.data.history,
      };
    } catch (error) {
      console.error("Get status history error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch status history",
      };
    }
  }

  /**
   * Get case statistics (for client dashboard)
   */
  async getCaseStats() {
    try {
      const response = await api.get("/api/cases/stats");
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Get case stats error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch statistics",
      };
    }
  }

  /**
   * Add comment to case
   * @param {string|number} caseId - Case ID
   * @param {Object} commentData - Comment data
   */
  async addComment(caseId, commentData) {
    try {
      const response = await api.post(
        `/api/cases/${caseId}/comments`,
        commentData
      );
      return {
        success: true,
        data: response.data.data.comment,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Add comment error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add comment",
      };
    }
  }

  /**
   * Get case comments
   * @param {string|number} caseId - Case ID
   */
  async getComments(caseId) {
    try {
      const response = await api.get(`/api/cases/${caseId}/comments`);
      return {
        success: true,
        data: response.data.data.comments,
      };
    } catch (error) {
      console.error("Get comments error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch comments",
      };
    }
  }

  /**
   * Upload file
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback
   */
  async uploadFile(file, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        };
      }

      const response = await api.post("/api/files/upload", formData, config);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("File upload error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upload file",
      };
    }
  }

  /**
   * Link uploaded files to case
   * @param {string|number} caseId - Case ID
   * @param {Array} files - Array of file objects
   */
  async linkFilesToCase(caseId, files) {
    try {
      const response = await api.post(`/api/cases/${caseId}/files`, { files });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Link files error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to link files",
      };
    }
  }

  /**
   * Batch upload files for case creation
   * @param {Array} stagedFiles - Array of files with metadata
   * @param {Function} onProgress - Progress callback
   */
  async batchUploadFiles(stagedFiles, onProgress = null) {
    const uploadedFiles = [];
    const totalFiles = stagedFiles.length;
    let completedFiles = 0;

    for (const stagedFile of stagedFiles) {
      try {
        const result = await this.uploadFile(
          stagedFile.file,
          (fileProgress) => {
            // Calculate overall progress
            const overallProgress = Math.round(
              ((completedFiles + fileProgress / 100) / totalFiles) * 100
            );
            if (onProgress) {
              onProgress(overallProgress, stagedFile.name);
            }
          }
        );

        if (result.success) {
          uploadedFiles.push({
            fileUrl: result.data.fileUrl,
            fileName: result.data.fileName,
            fileSize: result.data.fileSize,
            fileType: result.data.fileType,
            category: stagedFile.category,
          });
        }

        completedFiles++;
      } catch (error) {
        console.error(`Failed to upload ${stagedFile.name}:`, error);
      }
    }

    return {
      success: uploadedFiles.length > 0,
      data: uploadedFiles,
      totalUploaded: uploadedFiles.length,
      totalFiles: totalFiles,
    };
  }
}

export const caseService = new CaseService();
export default caseService;
