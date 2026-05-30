import { Search, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const conversations = [
  { id: "1001", name: "Project Mentor", handle: "mentor.dev", text: "Send your latest project update.", color: "bg-teal-500" },
  { id: "1002", name: "UI Review", handle: "design.circle", text: "Loved the new Explore grid.", color: "bg-pink-500" },
  { id: "1003", name: "College Group", handle: "batch_2026", text: "Share the deployment link here.", color: "bg-indigo-500" }
];

const Messages = () => {
  const { user, socket } = useAuth();
  const [active, setActive] = useState(conversations[0]);
  const [messages, setMessages] = useState([
    { id: 1, from: active.id, text: active.text, incoming: true },
    { id: 2, from: user?._id || "me", text: `Hi, I am ${user?.name || "you"}. I can share posts, links, or project updates from SocialConnect.`, incoming: false }
  ]);
  const [input, setInput] = useState("");

  // listen for incoming socket messages
  useEffect(() => {
    if (!socket) return undefined;

    const handler = (msg) => {
      // only add messages relevant to current active conversation
      if (msg.from === active.id || msg.to === active.id) {
        setMessages((s) => [...s, { id: Date.now(), from: msg.from, text: msg.text, incoming: msg.to === user._id }]);
      }
    };

    socket.on("message:new", handler);
    return () => socket.off("message:new", handler);
  }, [socket, active.id, user?._id]);

  return (
    <div className="page-shell grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="panel overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h1 className="text-2xl font-black text-white">Messages</h1>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-2.5 text-zinc-500" size={18} />
            <input className="input border-white/10 bg-black pl-10 text-white" placeholder="Search chats" />
          </div>
        </div>
        {conversations.map((item) => (
          <button
            key={item.handle}
            onClick={() => setActive(item)}
            className={`flex w-full items-center gap-3 border-b border-white/5 px-5 py-4 text-left transition hover:bg-white/5 ${
              active.handle === item.handle ? "bg-white/10" : ""
            }`}
          >
            <span className={`h-12 w-12 rounded-full ${item.color}`} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-white">{item.name}</span>
              <span className="block truncate text-xs text-zinc-400">@{item.handle}</span>
            </span>
          </button>
        ))}
      </section>

      <section className="panel flex min-h-[70vh] flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/10 p-5">
          <span className={`h-12 w-12 rounded-full ${active.color}`} />
          <div>
            <p className="font-bold text-white">{active.name}</p>
            <p className="text-xs text-zinc-400">@{active.handle}</p>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-5 overflow-y-auto">
          {messages.map((m) => (
            <p
              key={m.id}
              className={`max-w-sm rounded-2xl px-4 py-3 text-sm ${m.incoming ? "bg-white/10 text-zinc-100" : "ml-auto bg-white text-black font-semibold"}`}
            >
              {m.text}
            </p>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-white/10 p-4">
          <input value={input} onChange={(e) => setInput(e.target.value)} className="input border-white/10 bg-black text-white" placeholder="Message..." />
          <button
            onClick={() => {
              if (!input.trim()) return;
              const payload = { from: user?._id || "me", to: active.id, text: input.trim(), ts: Date.now() };
              // show locally
              setMessages((s) => [...s, { id: Date.now(), from: payload.from, text: payload.text, incoming: false }]);
              // send over socket (best-effort)
              if (socket) socket.emit("message:send", payload);
              setInput("");
            }}
            className="icon-btn bg-white text-black hover:bg-zinc-200"
            title="Send message"
          >
            <Send size={19} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Messages;
