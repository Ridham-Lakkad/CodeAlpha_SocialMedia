import { Bookmark, Heart, MessageCircle, Repeat2, Send } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const DEMO_SAVED_KEY = "socialconnect_demo_saved";

const readSavedDemoIds = () => {
  try {
    return JSON.parse(localStorage.getItem(DEMO_SAVED_KEY) || "[]");
  } catch {
    return [];
  }
};

const DemoMediaCard = ({ item, onSaveChange }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(() => readSavedDemoIds().includes(item.id));
  const [reposted, setReposted] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const commentInputRef = useRef(null);

  const repostCount = item.reposts + (reposted ? 1 : 0);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${item.author} on SocialConnect`,
          text: item.caption,
          url: item.src
        });
        toast.success("Share opened");
        return;
      }

      await navigator.clipboard.writeText(item.src);
      toast.success("Demo media link copied");
    } catch (error) {
      console.error(error);
      toast.error("Could not share this media");
    }
  };

  const addComment = (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    setComments((items) => [...items, comment.trim()]);
    setComment("");
    toast.success("Comment added");
  };

  const toggleRepost = () => {
    setReposted((value) => !value);
    toast.success(reposted ? "Repost removed" : "Reposted");
  };

  const toggleSave = () => {
    const savedIds = readSavedDemoIds();
    const nextSaved = !saved;
    const nextIds = nextSaved
      ? Array.from(new Set([...savedIds, item.id]))
      : savedIds.filter((id) => id !== item.id);

    localStorage.setItem(DEMO_SAVED_KEY, JSON.stringify(nextIds));
    setSaved(nextSaved);
    onSaveChange?.(item.id, nextSaved);
    window.dispatchEvent(new CustomEvent("saved-posts:changed", { detail: { demo: true, id: item.id, isSaved: nextSaved } }));
    toast.success(nextSaved ? "Saved" : "Removed from saved");
  };

  return (
    <article className="overflow-hidden border-b border-[var(--border)] pb-6">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className={`h-10 w-10 rounded-full ${item.avatar}`} />
        <div>
          <p className="text-sm font-bold text-[var(--text)]">{item.author}</p>
          <p className="text-xs text-[var(--muted)]">{item.type === "video" ? "Video" : "Photo"} - suggested</p>
        </div>
      </div>

      <div className="overflow-hidden rounded border border-[var(--border)] bg-black">
        {item.type === "video" ? (
          <video src={item.src} className="aspect-[4/5] w-full object-cover" controls playsInline />
        ) : (
          <img src={item.src} alt={item.caption} className="aspect-square w-full object-cover" />
        )}
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button className={`icon-btn ${liked ? "text-rose-500" : ""}`} onClick={() => setLiked((value) => !value)} title="Like">
              <Heart size={23} fill={liked ? "currentColor" : "none"} />
            </button>
            <button className="icon-btn" onClick={() => commentInputRef.current?.focus()} title="Comment">
              <MessageCircle size={23} />
            </button>
            <button className="icon-btn" onClick={share} title="Share">
              <Send size={22} />
            </button>
            <button className={`icon-btn ${reposted ? "text-[var(--link)]" : ""}`} onClick={toggleRepost} title={reposted ? "Undo repost" : "Repost"}>
              <Repeat2 size={23} />
            </button>
          </div>
          <button className={`icon-btn ${saved ? "text-pink-400" : ""}`} onClick={toggleSave} title={saved ? "Remove from saved" : "Save"}>
            <Bookmark size={23} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        <p className="text-sm font-bold text-[var(--text)]">
          {item.likes + (liked ? 1 : 0)} likes <span className="mx-2 text-[var(--muted)]">/</span> {repostCount} reposts
        </p>
        <p className="text-sm text-[var(--text)]">
          <span className="font-bold">{item.author}</span> {item.caption}
        </p>
        <div className="space-y-2">
          <p className="text-xs text-[var(--muted)]">View all {item.comments + comments.length} comments</p>
          {comments.slice(-3).map((text, index) => (
            <p key={`${text}-${index}`} className="text-sm text-[var(--text)]">
              <span className="font-bold">you</span> {text}
            </p>
          ))}
        </div>

        <form onSubmit={addComment} className="flex items-center gap-2 border-t border-[var(--border)] pt-3">
          <input
            ref={commentInputRef}
            className="flex-1 border-0 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
            placeholder="Add a comment..."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <button className="text-sm font-bold text-[var(--link)]" type="submit">
            Post
          </button>
        </form>
      </div>
    </article>
  );
};

export default DemoMediaCard;
