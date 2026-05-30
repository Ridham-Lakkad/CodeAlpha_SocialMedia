import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMemo, useState } from "react";
import StoryViewer from "./StoryViewer";

const StoryRail = ({ stories = [] }) => {
  const { user } = useAuth();
  const [activeStory, setActiveStory] = useState(null);
  const [open, setOpen] = useState(false);

  const authors = useMemo(() => {
    return [
      user,
      ...stories
        .map((post) => post.author)
        .filter((author, index, list) => author && list.findIndex((item) => item?._id === author._id) === index)
    ].slice(0, 10);
  }, [stories, user]);

  const openForAuthor = (author) => {
    const authorStories = stories.filter((s) => s.author?._id === author._id);
    if (authorStories.length === 0) return;
    const latest = authorStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    setActiveStory(latest);
    setOpen(true);
  };

  return (
    <>
      <div className="flex gap-6 overflow-x-auto px-2 py-4">
        <Link to="/create" className="flex w-20 shrink-0 flex-col items-center gap-2 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full border-2 border-dashed border-[var(--story-create-border)] bg-[var(--story-create-bg)] text-[var(--story-create-text)]">
            <Plus size={22} />
          </span>
          <span className="w-full truncate text-xs font-bold text-[var(--text)]">Create</span>
        </Link>
        {authors.map((author) => (
          <button key={author._id} onClick={() => openForAuthor(author)} className="flex w-20 shrink-0 flex-col items-center gap-2 text-center">
            <span className="rounded-full p-1" style={{ background: "var(--story-gradient)" }}>
              <img src={author.avatar?.url} alt={author.username} className="h-20 w-20 rounded-full border-2 border-[var(--avatar-ring-border)] object-cover" />
            </span>
            <span className="w-full truncate text-xs font-bold text-[var(--text)]">{author.username}</span>
          </button>
        ))}
      </div>

      <StoryViewer story={activeStory} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default StoryRail;
