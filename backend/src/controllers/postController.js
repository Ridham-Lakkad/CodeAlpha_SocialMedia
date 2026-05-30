import cloudinary from "../config/cloudinary.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { sendResponse } from "../utils/apiResponse.js";
import { createNotification } from "../utils/createNotification.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";

const populatePost = (query) =>
  query
    .populate("author", "name username avatar")
    .populate("comments.user", "name username avatar");

export const createPost = async (req, res, next) => {
  try {
    if (!req.file) return sendResponse(res, 400, "Post media is required");

    const mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
    const contentType = req.body.contentType === "story" ? "story" : "post";
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, "socialconnect/posts", "auto");
    const post = await Post.create({
      author: req.user._id,
      image: {
        url: uploaded.secure_url,
        publicId: uploaded.public_id
      },
      mediaType,
      contentType,
      caption: req.body.caption || ""
    });

    const populated = await populatePost(Post.findById(post._id));
    sendResponse(res, 201, contentType === "story" ? "Story created" : "Post created", populated);
  } catch (error) {
    next(error);
  }
};

export const getFeed = async (req, res, next) => {
  try {
    const followedIds = req.user.following;
    const primaryPosts = await populatePost(
      Post.find({ author: { $in: [...followedIds, req.user._id] }, contentType: "post" }).sort({ createdAt: -1 }).limit(40)
    );

    const fallbackPosts = await populatePost(
      Post.find({ author: { $nin: [...followedIds, req.user._id] }, contentType: "post" }).sort({ createdAt: -1 }).limit(20)
    );

    sendResponse(res, 200, "Feed loaded", [...primaryPosts, ...fallbackPosts]);
  } catch (error) {
    next(error);
  }
};

export const getStories = async (req, res, next) => {
  try {
    const storyPosts = await populatePost(Post.find({ contentType: "story" }).sort({ createdAt: -1 }).limit(30));
    sendResponse(res, 200, "Stories loaded", storyPosts);
  } catch (error) {
    next(error);
  }
};

export const explorePosts = async (req, res, next) => {
  try {
    const posts = await populatePost(Post.find({ contentType: "post" }).sort({ createdAt: -1 }).limit(60));
    sendResponse(res, 200, "Explore posts loaded", posts);
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const post = await populatePost(Post.findById(req.params.id));
    if (!post) return sendResponse(res, 404, "Post not found");

    sendResponse(res, 200, "Post loaded", post);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return sendResponse(res, 404, "Post not found");
    if (!post.author.equals(req.user._id)) return sendResponse(res, 403, "You can edit only your posts");

    post.caption = req.body.caption ?? post.caption;
    await post.save();

    const populated = await populatePost(Post.findById(post._id));
    sendResponse(res, 200, "Post updated", populated);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return sendResponse(res, 404, "Post not found");
    if (!post.author.equals(req.user._id)) return sendResponse(res, 403, "You can delete only your posts");

    await cloudinary.uploader.destroy(post.image.publicId, { resource_type: post.mediaType === "video" ? "video" : "image" });
    await User.updateMany({}, { $pull: { savedPosts: post._id } });
    await post.deleteOne();

    sendResponse(res, 200, "Post deleted");
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return sendResponse(res, 404, "Post not found");

    const hasLiked = post.likes.some((id) => id.equals(req.user._id));
    if (hasLiked) {
      post.likes = post.likes.filter((id) => !id.equals(req.user._id));
    } else {
      post.likes.push(req.user._id);
      await createNotification(
        {
          receiver: post.author,
          sender: req.user._id,
          type: "like",
          post: post._id,
          text: "liked your post"
        },
        req.app.get("io")
      );
    }

    await post.save();
    const populated = await populatePost(Post.findById(post._id));
    sendResponse(res, 200, hasLiked ? "Post unliked" : "Post liked", populated);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return sendResponse(res, 400, "Comment text is required");

    const post = await Post.findById(req.params.id);
    if (!post) return sendResponse(res, 404, "Post not found");

    post.comments.push({ user: req.user._id, text });
    await post.save();

    await createNotification(
      {
        receiver: post.author,
        sender: req.user._id,
        type: "comment",
        post: post._id,
        text: "commented on your post"
      },
      req.app.get("io")
    );

    const populated = await populatePost(Post.findById(post._id));
    sendResponse(res, 201, "Comment added", populated);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return sendResponse(res, 404, "Post not found");

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return sendResponse(res, 404, "Comment not found");

    if (!comment.user.equals(req.user._id) && !post.author.equals(req.user._id)) {
      return sendResponse(res, 403, "You cannot delete this comment");
    }

    comment.deleteOne();
    await post.save();

    const populated = await populatePost(Post.findById(post._id));
    sendResponse(res, 200, "Comment deleted", populated);
  } catch (error) {
    next(error);
  }
};

export const toggleSave = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return sendResponse(res, 404, "Post not found");

    const isSaved = req.user.savedPosts.some((id) => id.equals(post._id));
    req.user.savedPosts = isSaved
      ? req.user.savedPosts.filter((id) => !id.equals(post._id))
      : [...req.user.savedPosts, post._id];
    await req.user.save();

    sendResponse(res, 200, isSaved ? "Post removed from saved" : "Post saved", {
      isSaved: !isSaved,
      postId: post._id,
      savedPosts: req.user.savedPosts.map((id) => id.toString())
    });
  } catch (error) {
    next(error);
  }
};

export const sharePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { shareCount: 1 } }, { new: true });
    if (!post) return sendResponse(res, 404, "Post not found");

    const clientUrl = process.env.CLIENT_URL || req.get("origin") || "";
    sendResponse(res, 200, "Share recorded", {
      shareUrl: clientUrl ? `${clientUrl}/post/${post._id}` : `/post/${post._id}`,
      shareCount: post.shareCount
    });
  } catch (error) {
    next(error);
  }
};

export const repostPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return sendResponse(res, 404, "Post not found");

    const hasReposted = post.reposts?.some((id) => id.equals(req.user._id));
    if (hasReposted) {
      post.reposts = post.reposts.filter((id) => !id.equals(req.user._id));
    } else {
      post.reposts.push(req.user._id);
    }

    post.repostCount = post.reposts.length;
    await post.save();

    const populated = await populatePost(Post.findById(post._id));
    sendResponse(res, 200, hasReposted ? "Repost removed" : "Repost recorded", populated);
  } catch (error) {
    next(error);
  }
};
