import express from "express";
import {
  followUser,
  getProfile,
  getSavedPosts,
  searchUsers,
  unfollowUser,
  updateProfile
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/search", protect, searchUsers);
router.get("/saved", protect, getSavedPosts);
router.get("/:username", protect, getProfile);
router.patch("/profile", protect, upload.single("avatar"), updateProfile);
router.post("/:id/follow", protect, followUser);
router.delete("/:id/follow", protect, unfollowUser);

export default router;
