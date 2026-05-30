import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bell, Bookmark, Camera, Clapperboard, Plus, Users } from "lucide-react";
import api from "../api/client";
import DemoMediaCard from "../components/DemoMediaCard";
import EmptyState from "../components/EmptyState";
import PostCard from "../components/PostCard";
import StoryRail from "../components/StoryRail";
import { useAuth } from "../context/AuthContext";
import { demoMedia } from "../data/demoMedia";

const suggestions = [
  { name: "Rai Monani", handle: "rai.monani", color: "bg-lime-500", reason: "Followed by your circle" },
  { name: "Arpit Patel", handle: "arpit.design", color: "bg-sky-500", reason: "Suggested for you" },
  { name: "Nikit Bassi", handle: "nikit.codes", color: "bg-indigo-500", reason: "New on SocialConnect" },
  { name: "Shourya Sharma", handle: "shourya.media", color: "bg-rose-500", reason: "Followed by creators" }
];

const websiteDetails = [
  { label: "Photo posts", value: "Share image updates", icon: Camera },
  { label: "Short videos", value: "Upload motion moments", icon: Clapperboard },
  { label: "Follow people", value: "Build your circle", icon: Users },
  { label: "Save ideas", value: "Keep posts for later", icon: Bookmark },
  { label: "Notifications", value: "Track likes and follows", icon: Bell }
];

const Home = () => {
  const { user, accounts, switchAccount, addAccount } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const loadContent = () => {
    setLoading(true);
    Promise.all([api.get("/posts/feed"), api.get("/posts/stories")])
      .then(([feedResponse, storiesResponse]) => {
        setPosts(feedResponse.data.data);
        setStories(storiesResponse.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadContent();

    const handlePublished = () => loadContent();
    window.addEventListener("content:published", handlePublished);

    return () => window.removeEventListener("content:published", handlePublished);
  }, []);

  const replacePost = (nextPost) => setPosts((items) => items.map((item) => (item._id === nextPost._id ? nextPost : item)));
  const removePost = (postId) => setPosts((items) => items.filter((item) => item._id !== postId));
  const otherAccounts = accounts.filter((account) => account.user?._id !== user._id);

  const handleSwitchAccount = (accountId) => {
    if (switchAccount(accountId)) {
      setSwitcherOpen(false);
      loadContent();
    }
  };

  const handleAddAccount = () => {
    addAccount();
    navigate("/login");
  };

  return (
    <div className="page-shell grid gap-8 xl:grid-cols-[minmax(0,760px)_360px]">
      <section className="mx-auto w-full max-w-[760px] space-y-6">
        <StoryRail stories={stories} />
        {loading ? <div className="panel p-6 text-sm text-[var(--muted)]">Loading feed...</div> : null}
        {!loading && posts.length === 0 ? (
          <>
            <EmptyState
              title="Your feed is ready"
              text="Browse the sample feed below, then upload your first photo or video when you are ready."
              action={<Link to="/explore" className="btn-primary">Open Explore</Link>}
            />

            <section className="panel p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow">SocialConnect</p>
                  <h2 className="mt-2 text-2xl font-black text-[var(--text)]">Photos, videos, stories, and people in one feed.</h2>
                </div>
                <Link to="/create" className="btn-secondary shrink-0">Create Post</Link>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {websiteDetails.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-[var(--border)] bg-[var(--btn-secondary-bg)] p-3">
                      <Icon className="text-[var(--link)]" size={20} />
                      <p className="mt-3 text-sm font-bold text-[var(--text)]">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="space-y-5">
              {demoMedia.map((item) => (
                <DemoMediaCard key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : null}
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onChange={replacePost} onDelete={removePost} />
        ))}
      </section>

      <aside className="hidden xl:block">
        <div className="sticky top-8 p-2">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-full p-0.5" style={{ background: "var(--story-gradient)" }}>
                <img src={user.avatar?.url} alt={user.username} className="h-14 w-14 rounded-full border-2 border-[var(--avatar-ring-border)] object-cover" />
              </span>
              <div>
                <p className="font-bold text-[var(--text)]">{user.username}</p>
                <p className="text-sm text-[var(--muted)]">{user.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSwitcherOpen((value) => !value)}
              className="text-sm font-bold text-[var(--link)] hover:text-[var(--link-hover)]"
            >
              Switch
            </button>

            {switcherOpen ? (
              <div className="absolute right-0 top-16 z-20 w-72 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-2xl">
                <div className="border-b border-[var(--border)] p-3">
                  <p className="text-xs font-black uppercase text-[var(--muted)]">Switch account</p>
                </div>

                <button type="button" className="flex w-full items-center gap-3 px-3 py-3 text-left">
                  <img src={user.avatar?.url} alt={user.username} className="h-10 w-10 rounded-full object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[var(--text)]">@{user.username}</span>
                    <span className="block truncate text-xs text-[var(--muted)]">Current account</span>
                  </span>
                </button>

                {otherAccounts.map((account) => (
                  <button
                    key={account.user._id}
                    type="button"
                    onClick={() => handleSwitchAccount(account.user._id)}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[var(--hover-bg)]"
                  >
                    <img src={account.user.avatar?.url} alt={account.user.username} className="h-10 w-10 rounded-full object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-[var(--text)]">@{account.user.username}</span>
                      <span className="block truncate text-xs text-[var(--muted)]">{account.user.name}</span>
                    </span>
                  </button>
                ))}

                {otherAccounts.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-[var(--muted)]">Login with another account once to show it here.</p>
                ) : null}

                <button
                  type="button"
                  onClick={handleAddAccount}
                  className="flex w-full items-center gap-3 border-t border-[var(--border)] px-3 py-3 text-left text-sm font-bold text-[var(--link)] hover:bg-[var(--hover-bg)]"
                >
                  <Plus size={18} />
                  Add account
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="font-bold text-[var(--text)]">Suggested for you</p>
            <Link to="/explore" className="text-xs font-bold text-[var(--muted)] hover:text-[var(--text)]">See all</Link>
          </div>

          <div className="mt-4 space-y-5">
            {suggestions.map((item) => (
              <div key={item.handle} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`h-12 w-12 shrink-0 rounded-full ${item.color}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--text)]">{item.name}</p>
                    <p className="truncate text-xs text-[var(--muted)]">{item.reason}</p>
                  </div>
                </div>
                <button className="text-sm font-bold text-[var(--link)] hover:text-[var(--link-hover)]">Follow</button>
              </div>
            ))}
          </div>

          <p className="mt-16 text-xs leading-6 text-[var(--muted)]">
            About - Help - Press - API - Jobs - Privacy - Terms - Locations - Language
          </p>
          <p className="mt-6 text-xs text-[var(--muted)]">&copy; 2026 SOCIALCONNECT</p>
        </div>
      </aside>
    </div>
  );
};

export default Home;
