import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    image: {
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: true
      }
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image"
    },
    contentType: {
      type: String,
      enum: ["post", "story"],
      default: "post"
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 2200,
      default: ""
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    comments: [commentSchema],
    shareCount: {
      type: Number,
      default: 0
    },
    reposts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    repostCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ caption: "text" });

const Post = mongoose.model("Post", postSchema);

export default Post;
