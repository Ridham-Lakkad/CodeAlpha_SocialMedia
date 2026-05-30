import { Bookmark, Heart, MessageCircle, MoreHorizontal, Repeat2, Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { timeAgo } from "../utils/formatDate";

const PostCard = ({ post: initialPost, onChange, onDelete, onSaveChange }) => {
  const { user, setUser } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(initialPost.caption || "");
  const [saving, setSaving] = useState(false);
  const commentInputRef = useRef(null);

  useEffect(() => {
    setPost(initialPost);
    setCaption(initialPost.caption || "");
  }, [initialPost]);

  const liked = post.likes?.some((id) => id === user._id || id?._id === user._id);
  const saved = user.savedPosts?.some((id) => id === post._id || id?._id === post._id);
  const reposted = post.reposts?.some((id) => id === user._id || id?._id === user._id);
  const isOwner = post.author?._id === user._id;

  const updatePost = (nextPost) => {
    setPost(nextPost);
    onChange?.(nextPost);
  };

  const toggleLike = async () => {
    const { data } = await api.post(`/posts/${post._id}/like`);
    updatePost(data.data);
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;

    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { text: comment });
      setComment("");
      updatePost(data.data);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Could not add comment");
    }
  };

  const toggleSave = async () => {
    if (saving) return;

    setSaving(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/save`);
      const nextUser = { ...user, savedPosts: data.data.savedPosts };
      localStorage.setItem("socialconnect_user", JSON.stringify(nextUser));
      setUser(nextUser);
      onSaveChange?.(post._id, data.data.isSaved);
      window.dispatchEvent(new CustomEvent("saved-posts:changed", { detail: data.data }));
      toast.success(data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Could not update saved posts");
    } finally {
      setSaving(false);
    }
  };

  const focusComment = () => {
    commentInputRef.current?.focus();
  };

  const share = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/share`);
      const apiShareUrl = data.data.shareUrl;
      const shareUrl = apiShareUrl?.startsWith("http") ? apiShareUrl : `${window.location.origin}/post/${post._id}`;
      if (navigator.share) {
        await navigator.share({
          title: `${post.author?.username || "SocialConnect"} on SocialConnect`,
          text: post.caption || "Check out this post on SocialConnect.",
          url: shareUrl
        });
        toast.success("Share opened");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied");
    } catch (error) {
      console.error(error);
      toast.error("Could not share this post");
    }
  };

  const repost = async () => {
    try {
      const wasReposted = reposted;
      const { data } = await api.post(`/posts/${post._id}/repost`);
      updatePost(data.data);
      toast.success(wasReposted ? "Repost removed" : "Reposted");
    } catch (error) {
      console.error(error);
      toast.error("Could not update repost");
    }
  };

  const saveCaption = async () => {
    const { data } = await api.patch(`/posts/${post._id}`, { caption });
    updatePost(data.data);
    setEditing(false);
  };

  const remove = async () => {
    await api.delete(`/posts/${post._id}`);
    onDelete?.(post._id);
    toast.success("Post deleted");
  };

  return (
    <article className="overflow-hidden border-b border-white/10 pb-6">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/${post.author?.username}`} className="flex items-center gap-3">
          <img src={post.author?.avatar?.url} alt={post.author?.username} className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-sm font-bold text-white">{post.author?.name}</p>
            <p className="text-xs text-zinc-400">@{post.author?.username} - {timeAgo(post.createdAt)}</p>
          </div>
        </Link>
        {isOwner ? (
          <div className="flex items-center">
            <button className="icon-btn" onClick={() => setEditing((value) => !value)} title="Edit caption">
              <MoreHorizontal size={20} />
            </button>
            <button className="icon-btn text-coral" onClick={remove} title="Delete post">
              <Trash2 size={18} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded border border-white/10 bg-black">
        {post.mediaType === "video" ? (
          <video src={post.image?.url} className="aspect-[4/5] w-full object-cover" controls playsInline />
        ) : (
          <img src={post.image?.url} alt={post.caption || "Post"} className="aspect-square w-full object-cover" />
        )}
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="flex items-center justify-between px-0 py-1">
          <div className="flex items-center gap-1">
            <button className={`icon-btn ${liked ? "text-coral" : ""}`} onClick={toggleLike} title="Like">
              <Heart size={22} fill={liked ? "currentColor" : "none"} />
            </button>
            <button className="icon-btn" onClick={focusComment} title="Comment">
              <MessageCircle size={22} />
            </button>
            <button className="icon-btn" onClick={share} title="Share">
              <Send size={21} />
            </button>
            <button className={`icon-btn ${reposted ? "text-[var(--link)]" : ""}`} onClick={repost} title={reposted ? "Undo repost" : "Repost"}>
              <Repeat2 size={22} />
            </button>
          </div>
          <button className={`icon-btn ${saved ? "text-brand" : ""}`} onClick={toggleSave} title={saved ? "Remove from saved" : "Save"} disabled={saving}>
            <Bookmark size={22} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        <p className="text-sm font-bold text-white">
          {post.likes?.length || 0} likes
          <span className="mx-2 text-zinc-600">/</span>
          {post.repostCount || 0} reposts
        </p>

        {editing ? (
          <div className="flex gap-2">
            <input className="input" value={caption} onChange={(event) => setCaption(event.target.value)} />
            <button className="btn-primary" onClick={saveCaption}>Save</button>
          </div>
        ) : post.caption ? (
          <p className="text-sm text-zinc-100">
            <Link to={`/${post.author?.username}`} className="font-bold">
              {post.author?.username}
            </Link>{" "}
            {post.caption}
          </p>
        ) : null}

        <div className="space-y-2">
          {post.comments?.slice(-3).map((item) => (
            <p key={item._id} className="text-sm text-zinc-200">
              <Link to={`/${item.user?.username}`} className="font-bold">
                {item.user?.username}
              </Link>{" "}
              {item.text}
            </p>
          ))}
        </div>

        <form onSubmit={submitComment} className="flex items-center gap-2 border-t border-white/10 pt-3">
          <input
            ref={commentInputRef}
            className="flex-1 border-0 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
            placeholder="Add a comment..."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <button className="text-sm font-bold text-brand" type="submit">
            Post
          </button>
        </form>
      </div>
    </article>
  );
};

export default PostCard;
