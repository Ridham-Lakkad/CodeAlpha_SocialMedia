import express from "express";
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  explorePosts,
  getFeed,
  getPost,
  getStories,
  repostPost,
  sharePost,
  toggleLike,
  toggleSave,
  updatePost
} from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/feed", protect, getFeed);
router.get("/stories", protect, getStories);
router.get("/explore", protect, explorePosts);
router.get("/:id", protect, getPost);
router.post("/", protect, upload.single("image"), createPost);
router.patch("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, addComment);
router.delete("/:postId/comments/:commentId", protect, deleteComment);
router.post("/:id/save", protect, toggleSave);
router.post("/:id/share", protect, sharePost);
router.post("/:id/repost", protect, repostPost);

export default router;
