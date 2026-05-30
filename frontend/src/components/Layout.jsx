import { Bookmark, Compass, Grid3X3, Heart, Home, LogOut, Plus, Send, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UploadModal from "./UploadModal";
import api from "../api/client";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/notifications", label: "Notifications", icon: Heart },
  { to: "/messages", label: "Messages", icon: Send },
  { to: "/saved", label: "Saved", icon: Bookmark }
];

const railClassName = (expanded) =>
  `relative flex h-12 items-center rounded-2xl transition hover:bg-[var(--hover-bg)] ${expanded ? "w-full gap-4 px-3" : "w-12 justify-center"}`;

const RailLink = ({ item, expanded }) => {
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <button type="button" className={`${railClassName(expanded)} text-[var(--nav-text)]`} title={item.label}>
        <Icon size={28} />
        {expanded ? <span className="text-sm font-semibold">{item.label}</span> : null}
      </button>
    );
  }

  return (
    <div className="relative w-full group">
      <NavLink
        to={item.to}
        title={item.label}
        className={({ isActive }) => `${railClassName(expanded)} ${isActive ? "text-[var(--nav-active)]" : "text-[var(--nav-text)]"}`}
      >
        <Icon size={28} fill={item.label === "Notifications" ? "currentColor" : "none"} />
        {expanded ? <span className="text-sm font-semibold">{item.label}</span> : null}
        {item.badge ? (
          <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-black text-white">
            {item.badge}
          </span>
        ) : null}
      </NavLink>
    </div>
  );
};

const Layout = () => {
  const { user, logout } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem("socialconnect_theme") || "dark");

  useEffect(() => {
    if (!user?._id) return;

    let mounted = true;
    api.get("/notifications").then(({ data }) => {
      if (!mounted) return;
      const notifications = data.data || [];
      const unread = notifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    });

    const handleNotificationsRead = () => setUnreadCount(0);
    const handleNew = () => setUnreadCount((c) => c + 1);

    window.addEventListener("notifications:read", handleNotificationsRead);
    window.addEventListener("notification:new", handleNew);

    return () => {
      mounted = false;
      window.removeEventListener("notifications:read", handleNotificationsRead);
      window.removeEventListener("notification:new", handleNew);
    };
  }, [user?._id]);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme === "light" ? "light" : "dark");
    localStorage.setItem("socialconnect_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`fixed left-0 top-0 z-30 hidden h-screen flex-col border-r bg-[var(--bg)] py-6 transition-all duration-300 lg:flex ${
          sidebarExpanded ? "w-[244px] items-start px-4" : "w-[76px] items-center px-0"
        }`}
      >
        <div className={`mb-12 flex h-10 items-center justify-center rounded-lg ${sidebarExpanded ? "w-full justify-start px-3" : "w-10 px-0"}`} style={{ background: 'var(--btn-secondary-bg)' }}>
          <span className="text-sm font-black">SC</span>
          {sidebarExpanded ? <span className="ml-3 text-sm font-bold text-[var(--text)]">SocialConnect</span> : null}
          <button onClick={toggleTheme} className="ml-3 hidden rounded-full p-1 hover:bg-[var(--hover-bg)] lg:inline-flex" title="Toggle theme">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <nav className={`flex flex-1 flex-col gap-4 ${sidebarExpanded ? "w-full items-stretch" : "items-center"}`}>
          {navItems.slice(0, 4).map((item) => (
            <div key={`${item.label}-${item.to}`} className="w-full">
              <RailLink
                item={
                  item.label === "Notifications" && unreadCount > 0
                    ? { ...item, badge: String(unreadCount) }
                    : item
                }
                expanded={sidebarExpanded}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className={`${railClassName(sidebarExpanded)} text-[var(--nav-text)]`}
            title="Create post or story"
          >
            <Plus size={32} />
            {sidebarExpanded ? <span className="text-sm font-semibold">Create</span> : null}
          </button>

          {navItems.slice(4).map((item) => (
            <div key={`${item.label}-${item.to}`} className="w-full">
              <RailLink item={item} expanded={sidebarExpanded} />
            </div>
          ))}

          <NavLink
            to={`/${user.username}`}
            title="Profile"
            className={({ isActive }) => `${railClassName(sidebarExpanded)} ${isActive ? "text-[var(--nav-active)]" : "text-[var(--nav-text)]"}`}
          >
            <img src={user.avatar?.url} alt={user.username} className="h-8 w-8 rounded-full object-cover" />
            {sidebarExpanded ? <span className="text-sm font-semibold">Profile</span> : null}
          </NavLink>
        </nav>

        <div className="flex flex-col items-center gap-4">
          <button type="button" onClick={logout} className={`${railClassName(sidebarExpanded)} text-[var(--nav-text)]`} title="Logout">
            <LogOut size={26} />
            {sidebarExpanded ? <span className="text-sm font-semibold">Logout</span> : null}
          </button>
          <Grid3X3 size={23} className="text-[var(--muted)]" />
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b px-4 py-3 backdrop-blur lg:hidden" style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg) 95%, transparent)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xl font-black">SocialConnect</span>
          <button type="button" onClick={() => setUploadOpen(true)} className="icon-btn" title="Create">
            <Plus size={25} />
          </button>
        </div>
      </header>

      <main className="lg:ml-[76px]">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-6 px-2 py-2 lg:hidden" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
        <NavLink to="/" className={({ isActive }) => `grid place-items-center rounded-xl py-2 ${isActive ? "text-[var(--nav-active)]" : "text-[var(--nav-text)]"}`}>
          <Home size={24} />
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => `grid place-items-center rounded-xl py-2 ${isActive ? "text-[var(--nav-active)]" : "text-[var(--nav-text)]"}`}>
          <Compass size={24} />
        </NavLink>
        <button type="button" onClick={() => setUploadOpen(true)} className="grid place-items-center rounded-xl py-2 text-[var(--nav-text)]">
          <Plus size={28} />
        </button>
        <NavLink to="/notifications" className={({ isActive }) => `grid place-items-center rounded-xl py-2 ${isActive ? "text-[var(--nav-active)]" : "text-[var(--nav-text)]"}`}>
          <Heart size={24} fill="currentColor" />
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => `grid place-items-center rounded-xl py-2 ${isActive ? "text-[var(--nav-active)]" : "text-[var(--nav-text)]"}`}>
          <Send size={24} />
        </NavLink>
        <NavLink to={`/${user.username}`} className="grid place-items-center rounded-xl py-2">
          <img src={user.avatar?.url} alt={user.username} className="h-7 w-7 rounded-full object-cover" />
        </NavLink>
      </nav>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
};

export default Layout;
