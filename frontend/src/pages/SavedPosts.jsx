import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import DemoMediaCard from "../components/DemoMediaCard";
import EmptyState from "../components/EmptyState";
import PostCard from "../components/PostCard";
import { demoMedia } from "../data/demoMedia";

const DEMO_SAVED_KEY = "socialconnect_demo_saved";

const getSavedDemoPosts = () => {
  try {
    const savedIds = JSON.parse(localStorage.getItem(DEMO_SAVED_KEY) || "[]");
    return demoMedia.filter((item) => savedIds.includes(item.id));
  } catch {
    return [];
  }
};

const SavedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [demoPosts, setDemoPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSavedPosts = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    setDemoPosts(getSavedDemoPosts());
    try {
      const { data } = await api.get("/users/saved");
      setPosts(data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedPosts({ showLoading: true });

    const refreshSavedPosts = () => loadSavedPosts();
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") loadSavedPosts();
    };

    window.addEventListener("saved-posts:changed", refreshSavedPosts);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      window.removeEventListener("saved-posts:changed", refreshSavedPosts);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [loadSavedPosts]);

  const replacePost = (nextPost) => setPosts((items) => items.map((item) => (item._id === nextPost._id ? nextPost : item)));
  const removePost = (postId) => setPosts((items) => items.filter((item) => item._id !== postId));
  const handleSaveChange = (postId, isSaved) => {
    if (!isSaved) removePost(postId);
  };
  const handleDemoSaveChange = (postId, isSaved) => {
    if (!isSaved) setDemoPosts((items) => items.filter((item) => item.id !== postId));
  };

  return (
    <div className="page-shell max-w-3xl">
      <h1 className="text-2xl font-black text-white">Saved Posts</h1>
      <section className="mt-5 space-y-5">
        {loading ? <div className="panel p-5 text-sm text-zinc-400">Loading saved posts...</div> : null}
        {!loading && posts.length === 0 && demoPosts.length === 0 ? <EmptyState title="Nothing saved yet" text="Tap the bookmark icon on posts you want to revisit." /> : null}
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onChange={replacePost}
            onDelete={removePost}
            onSaveChange={handleSaveChange}
          />
        ))}
        {demoPosts.map((post) => (
          <DemoMediaCard key={post.id} item={post} onSaveChange={handleDemoSaveChange} />
        ))}
      </section>
    </div>
  );
};

export default SavedPosts;
