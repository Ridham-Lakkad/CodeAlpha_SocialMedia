import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { sendResponse } from "../utils/apiResponse.js";
import { createNotification } from "../utils/createNotification.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";

const userSelect = "name username avatar bio website location followers following savedPosts createdAt";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .select(userSelect)
      .populate("followers", "name username avatar")
      .populate("following", "name username avatar");

    if (!user) return sendResponse(res, 404, "User not found");

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "name username avatar");

    sendResponse(res, 200, "Profile loaded", { user, posts });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const fields = ["name", "bio", "website", "location"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });

    if (req.file) {
      if (req.user.avatar?.publicId) {
        await cloudinary.uploader.destroy(req.user.avatar.publicId);
      }

      const uploaded = await uploadBufferToCloudinary(req.file.buffer, "socialconnect/avatars");
      req.user.avatar = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id
      };
    }

    await req.user.save();
    const user = await User.findById(req.user._id).select("-password");
    sendResponse(res, 200, "Profile updated", user);
  } catch (error) {
    next(error);
  }
};

export const followUser = async (req, res, next) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return sendResponse(res, 404, "User not found");
    if (target._id.equals(req.user._id)) return sendResponse(res, 400, "You cannot follow yourself");

    const isFollowing = req.user.following.some((id) => id.equals(target._id));
    if (isFollowing) {
      return sendResponse(res, 200, "Already following user");
    }

    req.user.following.push(target._id);
    target.followers.push(req.user._id);
    await Promise.all([req.user.save(), target.save()]);

    await createNotification(
      {
        receiver: target._id,
        sender: req.user._id,
        type: "follow",
        text: "started following you"
      },
      req.app.get("io")
    );

    sendResponse(res, 200, "User followed", { following: req.user.following });
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return sendResponse(res, 404, "User not found");

    req.user.following = req.user.following.filter((id) => !id.equals(target._id));
    target.followers = target.followers.filter((id) => !id.equals(req.user._id));
    await Promise.all([req.user.save(), target.save()]);

    sendResponse(res, 200, "User unfollowed", { following: req.user.following });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q || "";
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ],
      _id: { $ne: req.user._id }
    })
      .select("name username avatar bio followers following")
      .limit(20);

    sendResponse(res, 200, "Users loaded", users);
  } catch (error) {
    next(error);
  }
};

export const getSavedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedPosts",
      options: { sort: { createdAt: -1 } },
      populate: [
        { path: "author", select: "name username avatar" },
        { path: "comments.user", select: "name username avatar" }
      ]
    });

    const posts = (user.savedPosts || []).filter(Boolean);
    sendResponse(res, 200, "Saved posts loaded", posts);
  } catch (error) {
    next(error);
  }
};
