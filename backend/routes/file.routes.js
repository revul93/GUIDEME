import express from "express";
import {
  uploadFile,
  listFiles,
  deleteFile,
} from "../controllers/file/index.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { fileUpload, upload } from "../controllers/file/fileUpload.service.js";
const router = express.Router();

// All routes require authentication
router.use(authenticate);

// File routes
router.post("/cases/:id/files", uploadFile);
router.get("/cases/:id/files", listFiles);
router.delete("/:id", deleteFile);
router.post("/files/upload", authenticate, upload.single("file"));

export default router;
