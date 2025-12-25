import express from "express";
import {
  uploadFile,
  listFiles,
  deleteFile,
} from "../controllers/file/index.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  upload,
  handleFileUpload,
  handleMultipleFileUpload,
} from "../controllers/file/fileUpload.service.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// File upload endpoints
router.post("/upload", upload.single("file"), handleFileUpload);
router.post(
  "/upload-multiple",
  upload.array("files", 10),
  handleMultipleFileUpload
); // Max 10 files

// File metadata endpoints
router.post("/cases/:id/files", uploadFile); // Save file metadata to database
router.get("/cases/:id/files", listFiles);
router.delete("/:id", deleteFile);

export default router;
