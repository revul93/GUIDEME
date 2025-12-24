import express from "express";
import {
  addComment,
  listComments,
  markCommentAsRead,
  markAllCommentsAsRead,
} from "../controllers/comment/index.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Comment routes
router.post("/cases/:id/comments", addComment);
router.get("/cases/:id/comments", listComments);
router.put("/:id/read", markCommentAsRead);
router.put("/cases/:id/read-all", markAllCommentsAsRead);

export default router;
