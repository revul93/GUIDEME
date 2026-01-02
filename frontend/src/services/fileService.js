import api from "../utils/api";

/**
 * File Service - Handles file upload operations
 */
class FileService {
  /**
   * Upload single file with progress tracking
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback (0-100)
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
   * Upload multiple files
   * @param {Array} files - Array of File objects
   * @param {Function} onProgress - Progress callback
   */
  async uploadMultipleFiles(files, onProgress = null) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

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

      const response = await api.post(
        "/api/files/upload-multiple",
        formData,
        config
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Multiple file upload error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upload files",
      };
    }
  }

  /**
   * Link uploaded file to case
   * @param {string|number} caseId - Case ID
   * @param {Object} fileData - File metadata
   */
  async linkFileToCase(caseId, fileData) {
    try {
      const response = await api.post(
        `/api/files/cases/${caseId}/files`,
        fileData
      );
      return {
        success: true,
        data: response.data.data.file,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Link file to case error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to link file to case",
      };
    }
  }

  /**
   * Get files for a case
   * @param {string|number} caseId - Case ID
   * @param {string} category - Optional category filter
   */
  async getCaseFiles(caseId, category = null) {
    try {
      const params = category ? { category } : {};
      const response = await api.get(`/api/files/cases/${caseId}/files`, {
        params,
      });
      return {
        success: true,
        data: response.data.data.files,
      };
    } catch (error) {
      console.error("Get case files error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch case files",
      };
    }
  }

  /**
   * Batch upload and link files to case
   * @param {string|number} caseId - Case ID
   * @param {Array} stagedFiles - Array of files with metadata
   * @param {Function} onProgress - Progress callback
   */
  async batchUploadAndLink(caseId, stagedFiles, onProgress = null) {
    const linkedFiles = [];
    const totalFiles = stagedFiles.length;
    let completedFiles = 0;

    for (const stagedFile of stagedFiles) {
      try {
        // Upload file
        const uploadResult = await this.uploadFile(
          stagedFile.file,
          (fileProgress) => {
            const overallProgress = Math.round(
              ((completedFiles + fileProgress / 100) / totalFiles) * 100
            );
            if (onProgress) {
              onProgress(
                overallProgress,
                stagedFile.name || stagedFile.file.name
              );
            }
          }
        );

        if (uploadResult.success) {
          // Link to case
          const linkResult = await this.linkFileToCase(caseId, {
            fileName: uploadResult.data.fileName,
            fileUrl: uploadResult.data.fileUrl,
            fileType: uploadResult.data.fileType,
            fileSize: uploadResult.data.fileSize,
            category: stagedFile.category,
            description: stagedFile.description,
          });

          if (linkResult.success) {
            linkedFiles.push(linkResult.data);
          }
        }

        completedFiles++;
      } catch (error) {
        console.error(`Failed to upload/link ${stagedFile.name}:`, error);
        completedFiles++;
      }
    }

    return {
      success: linkedFiles.length > 0,
      data: linkedFiles,
      totalLinked: linkedFiles.length,
      totalFiles: totalFiles,
    };
  }

  /**
   * Delete file
   * @param {string} fileId - File ID
   */
  async deleteFile(fileId) {
    try {
      const response = await api.delete(`/api/files/${fileId}`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Delete file error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete file",
      };
    }
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 100 * 1024 * 1024, // 100MB default
      allowedTypes = null,
      allowedExtensions = null,
    } = options;

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${this.formatFileSize(maxSize)}`,
      };
    }

    // Check file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    // Check file extension
    if (allowedExtensions) {
      const extension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(`.${extension}`)) {
        return {
          valid: false,
          error: `File extension .${extension} is not allowed`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Format file size to human readable format
   * @param {number} bytes - File size in bytes
   */
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  /**
   * Get file extension
   * @param {string} filename - File name
   */
  getFileExtension(filename) {
    return filename.split(".").pop().toLowerCase();
  }

  /**
   * Get file category icon
   * @param {string} category - File category
   */
  getCategoryIcon(category) {
    const icons = {
      dicom: "🏥",
      stl: "🦷",
      ply: "🔷",
      zip: "📦",
      clinical_photo: "📷",
      prescription: "📋",
      study_file: "📊",
      design_file: "🎨",
      production_file: "⚙️",
      other: "📄",
    };
    return icons[category] || "📄";
  }

  /**
   * Group files by category
   * @param {Array} files - Array of file objects
   */
  groupFilesByCategory(files) {
    return files.reduce((acc, file) => {
      if (!acc[file.category]) {
        acc[file.category] = [];
      }
      acc[file.category].push(file);
      return acc;
    }, {});
  }
}

export const fileService = new FileService();
export default fileService;
