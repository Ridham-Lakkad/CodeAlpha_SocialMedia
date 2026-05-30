import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client";
import { timeAgo } from "../utils/formatDate";

const StoryViewer = ({ story: initialStory, open, onClose }) => {
  const [story, setStory] = useState(initialStory);
  const [comment, setComment] = useState("");

  useEffect(() => setStory(initialStory), [initialStory]);

  if (!open || !story) return null;

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const { data } = await api.post(`/posts/${story._id}/comments`, { text: comment });
      setComment("");
      setStory(data.data);
      toast.success("Comment added");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Could not add comment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="mx-auto grid w-[92%] max-w-[1100px] grid-cols-2 overflow-hidden rounded bg-[#0b0d0f]">
        <div className="flex items-center justify-center bg-black">
          {story.mediaType === "video" ? (
            <video src={story.image?.url} controls playsInline className="max-h-[80vh] w-full object-contain" />
          ) : (
            <img src={story.image?.url} alt={story.caption || "Story"} className="max-h-[80vh] w-full object-contain" />
          )}
        </div>

        <div className="flex flex-col bg-[#0b0d0f] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={story.author?.avatar?.url} alt={story.author?.username} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="font-bold text-white">{story.author?.username}</p>
                <p className="text-xs text-zinc-500">{timeAgo(story.createdAt)}</p>
              </div>
            </div>
            <button className="icon-btn" onClick={onClose}><X /></button>
          </div>

          <div className="mb-3 flex-1 overflow-auto pr-2">
            {story.caption ? (
              <p className="mb-3 text-sm text-zinc-200"><span className="font-bold">{story.author?.username}</span> {story.caption}</p>
            ) : null}

            <div className="space-y-2">
              {story.comments?.map((c) => (
                <div key={c._id} className="text-sm text-zinc-200">
                  <span className="font-bold">{c.user?.username}</span> {c.text}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submitComment} className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 border-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              placeholder="Add a comment..."
            />
            <button className="text-sm font-bold text-brand" type="submit">Post</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
