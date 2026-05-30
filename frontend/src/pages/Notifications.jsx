import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import { timeAgo } from "../utils/formatDate";

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/notifications");
      setItems(data.data);
      await api.patch("/notifications/read");
      // let listeners (layout) know notifications were marked read
      window.dispatchEvent(new Event("notifications:read"));
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="page-shell max-w-3xl">
      <h1 className="text-2xl font-black">Notifications</h1>
      <section className="panel mt-5 overflow-hidden">
        {loading ? <p className="p-5 text-sm text-zinc-600">Loading notifications...</p> : null}
        {!loading && items.length === 0 ? <EmptyState title="No notifications" text="Likes, comments, and follows will appear here." /> : null}
        {items.map((item) => (
          <div key={item._id} className="flex items-center gap-3 border-b border-white/10 px-4 py-3 last:border-0">
            <Bell size={18} className={item.read ? "text-zinc-500" : "text-pink-400"} />
            <Link to={`/${item.sender?.username}`}>
              <img src={item.sender?.avatar?.url} alt={item.sender?.username} className="h-10 w-10 rounded-full object-cover" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-100">
                <Link to={`/${item.sender?.username}`} className="font-bold">{item.sender?.username}</Link>{" "}
                {item.text}
              </p>
              <p className="text-xs text-zinc-500">{timeAgo(item.createdAt)}</p>
            </div>
            {item.post?.image?.url ? <img src={item.post.image.url} alt="" className="h-12 w-12 rounded-md object-cover" /> : null}
          </div>
        ))}
      </section>
    </div>
  );
};

export default Notifications;
