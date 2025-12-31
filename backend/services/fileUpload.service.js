import multer from "multer";
import path from "path";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import logger from "../utils/logger.js";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure AWS S3 (optional - only if you want S3 support)
const useS3 = process.env.USE_S3 === "true";
let s3Client = null;

if (useS3) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// Configure local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, uniqueSuffix + "-" + sanitizedName);
  },
});

// File filter - allowed file types
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",

    // Documents
    "application/pdf",

    // Archives
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",

    // DICOM
    "application/dicom",
    "application/x-dicom",

    // 3D Models
    "model/stl",
    "application/sla",
    "application/vnd.ms-pki.stl",
    "application/octet-stream", // STL/PLY files sometimes come as this

    // PLY files
    "application/ply",
    "text/plain", // PLY files sometimes come as text
  ];

  // Additional extension check for files that come as octet-stream or text/plain
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [
    ".stl",
    ".ply",
    ".dcm",
    ".dicom",
    ".zip",
    ".rar",
    ".7z",
  ];

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: images, PDF, DICOM, STL, PLY, ZIP. Got: ${file.mimetype}`
      ),
      false
    );
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

// Upload file to S3 (if enabled)
const uploadToS3 = async (file) => {
  if (!useS3 || !s3Client) {
    throw new Error("S3 upload is not configured");
  }

  const fileStream = fs.createReadStream(file.path);
  const key = `uploads/${Date.now()}-${file.filename}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileStream,
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Delete local file after successful S3 upload
    fs.unlinkSync(file.path);

    // Return S3 URL
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    logger.error("S3 upload error:", error);
    throw error;
  }
};

// Determine file category based on MIME type and extension
// FIXED: Match schema FileCategory enum exactly
const determineFileCategory = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  // DICOM files
  if (mime.includes("dicom") || ext === ".dcm" || ext === ".dicom") {
    return "dicom";
  }

  // STL files
  if (mime.includes("stl") || ext === ".stl") {
    return "stl";
  }

  // PLY files
  if (mime.includes("ply") || ext === ".ply") {
    return "ply";
  }

  // ZIP archives
  if (
    mime.includes("zip") ||
    ext === ".zip" ||
    ext === ".rar" ||
    ext === ".7z"
  ) {
    return "zip";
  }

  // Images (clinical photos)
  if (mime.startsWith("image/")) {
    return "clinical_photo";
  }

  // PDF (default to other, let user specify)
  if (mime === "application/pdf" || ext === ".pdf") {
    return "other"; // Don't assume it's prescription, let user specify
  }

  return "other";
};

// Main file upload handler
export const handleFileUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    let fileUrl;

    // Upload to S3 if enabled, otherwise use local path
    if (useS3) {
      fileUrl = await uploadToS3(req.file);
    } else {
      // Local storage - return relative path
      fileUrl = `/uploads/${req.file.filename}`;
    }

    // Determine file category based on MIME type and extension
    const category = determineFileCategory(req.file);

    logger.info("File uploaded successfully", {
      fileName: req.file.originalname,
      fileSize: req.file.size,
      category,
      userId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileName: req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        category,
      },
    });
  } catch (error) {
    logger.error("File upload error:", {
      error: error.message,
      stack: error.stack,
      file: req.file?.originalname,
    });

    // Clean up file if upload failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: error.message || "File upload failed",
    });
  }
};

// Multiple files upload handler
export const handleMultipleFileUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of req.files) {
      try {
        let fileUrl;

        if (useS3) {
          fileUrl = await uploadToS3(file);
        } else {
          fileUrl = `/uploads/${file.filename}`;
        }

        const category = determineFileCategory(file);

        uploadedFiles.push({
          fileName: file.originalname,
          fileUrl,
          fileType: file.mimetype,
          fileSize: file.size,
          category,
        });
      } catch (error) {
        errors.push({
          fileName: file.originalname,
          error: error.message,
        });

        // Clean up failed file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(500).json({
        success: false,
        message: "All file uploads failed",
        errors,
      });
    }

    logger.info("Multiple files uploaded", {
      count: uploadedFiles.length,
      userId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: {
        files: uploadedFiles,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    logger.error("Multiple file upload error:", {
      error: error.message,
      stack: error.stack,
    });

    // Clean up all files
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    return res.status(500).json({
      success: false,
      message: "File upload failed",
    });
  }
};
