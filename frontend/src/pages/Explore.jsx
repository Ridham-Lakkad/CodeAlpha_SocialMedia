import { Clapperboard, Image, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";
import DemoMediaCard from "../components/DemoMediaCard";
import PostCard from "../components/PostCard";
import UserRow from "../components/UserRow";
import { demoMedia } from "../data/demoMedia";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/posts/explore").then(({ data }) => setPosts(data.data));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) api.get(`/users/search?q=${encodeURIComponent(query)}`).then(({ data }) => setUsers(data.data));
      else setUsers([]);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const replacePost = (nextPost) => setPosts((items) => items.map((item) => (item._id === nextPost._id ? nextPost : item)));
  const removePost = (postId) => setPosts((items) => items.filter((item) => item._id !== postId));
  const filteredPosts = posts.filter((post) => filter === "all" || (post.mediaType || "image") === filter);
  const filteredDemo = demoMedia.filter((post) => filter === "all" || post.type === filter);
  const imageCount = posts.filter((post) => (post.mediaType || "image") === "image").length || demoMedia.filter((post) => post.type === "image").length;
  const videoCount = posts.filter((post) => post.mediaType === "video").length || demoMedia.filter((post) => post.type === "video").length;
  const mosaicPosts = posts.length ? posts.slice(0, 6) : demoMedia;

  return (
    <div className="page-shell grid gap-6 xl:grid-cols-[380px_minmax(0,680px)]">
      <section className="space-y-5">
        <div className="panel overflow-hidden">
          <div className="bg-[#0b0f14] p-5 text-white">
            <p className="eyebrow text-pink-400">Discover</p>
            <h1 className="mt-3 text-3xl font-black">Explore media</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-100">Find people, photos, videos, repost-worthy moments, and ideas to save.</p>
          </div>
          <div className="p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-zinc-400" size={18} />
              <input className="input pl-10" placeholder="Search people" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
              {users.map((item) => <UserRow key={item._id} user={item} />)}
              {query && users.length === 0 ? <p className="p-4 text-sm text-zinc-500">No users found.</p> : null}
            </div>
          </div>
        </div>

        <div className="panel p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <button onClick={() => setFilter("all")} className={`rounded-xl p-3 text-sm font-bold ${filter === "all" ? "bg-white text-black" : "bg-white/10 text-white"}`}>
              <Sparkles className="mx-auto mb-2" size={18} />
              All
              <span className="block text-xs opacity-70">{posts.length || demoMedia.length}</span>
            </button>
            <button onClick={() => setFilter("image")} className={`rounded-xl p-3 text-sm font-bold ${filter === "image" ? "bg-white text-black" : "bg-white/10 text-white"}`}>
              <Image className="mx-auto mb-2" size={18} />
              Images
              <span className="block text-xs opacity-70">{imageCount}</span>
            </button>
            <button onClick={() => setFilter("video")} className={`rounded-xl p-3 text-sm font-bold ${filter === "video" ? "bg-white text-black" : "bg-white/10 text-white"}`}>
              <Clapperboard className="mx-auto mb-2" size={18} />
              Videos
              <span className="block text-xs opacity-70">{videoCount}</span>
            </button>
          </div>
        </div>

        <div className="panel p-4">
          <h2 className="text-sm font-black uppercase text-zinc-400">Trending wall</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {mosaicPosts.map((post) => (
              <div key={post._id || post.id} className="relative overflow-hidden rounded-xl bg-black">
                {(post.mediaType || post.type) === "video" ? (
                  <video src={post.image?.url || post.src} className="aspect-square w-full object-cover" muted />
                ) : (
                  <img src={post.image?.url || post.src} alt={post.caption || "Explore"} className="aspect-square w-full object-cover" />
                )}
                {(post.mediaType || post.type) === "video" ? <Clapperboard className="absolute right-2 top-2 text-white drop-shadow" size={18} /> : null}
              </div>
            ))}
            {mosaicPosts.length === 0 ? (
              <p className="col-span-3 rounded-xl bg-white/10 p-4 text-sm text-zinc-400">Upload images or videos to fill Explore.</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        {filteredPosts.map((post) => <PostCard key={post._id} post={post} onChange={replacePost} onDelete={removePost} />)}
        {filteredPosts.length === 0 ? filteredDemo.map((item) => <DemoMediaCard key={item.id} item={item} />) : null}
        {filteredPosts.length === 0 && filteredDemo.length === 0 ? (
          <div className="panel p-6 text-sm text-zinc-400">No posts found for this media type yet.</div>
        ) : null}
      </section>
    </div>
  );
};

export default Explore;
