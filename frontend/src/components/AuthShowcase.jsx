import { Bell, Heart, MessageCircle, Sparkles, UserPlus } from "lucide-react";
import BrandLogo from "./BrandLogo";

const tiles = [
  "bg-[linear-gradient(135deg,#0f766e,#56b6a6)]",
  "bg-[linear-gradient(135deg,#e85d4f,#f6b16d)]",
  "bg-[linear-gradient(135deg,#6d5dfc,#9b8cff)]",
  "bg-[linear-gradient(135deg,#161616,#52525b)]"
];

const AuthShowcase = () => (
  <section className="relative hidden min-h-screen overflow-hidden bg-ink px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,118,110,0.34),transparent_36%,rgba(232,93,79,0.25))]" />
    <div className="relative">
      <BrandLogo inverse />
      <h1 className="mt-5 max-w-xl text-6xl font-black leading-[0.95]">
        Share moments. Build circles. Stay close.
      </h1>
      <p className="mt-5 max-w-md text-base leading-7 text-zinc-200">
        A polished mini social platform with posts, follows, notifications, saved collections, and image-first storytelling.
      </p>
    </div>

    <div className="relative grid max-w-xl grid-cols-[1fr_0.8fr] gap-4">
      <div className="panel border-white/10 bg-white/10 p-4 text-white backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-teal-300" />
          <div>
            <p className="font-bold">ridham.dev</p>
            <p className="text-xs text-zinc-300">posted a new build</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {tiles.map((tile) => (
            <div key={tile} className={`aspect-square rounded-md ${tile}`} />
          ))}
        </div>
        <div className="mt-4 flex gap-3 text-zinc-200">
          <Heart size={20} />
          <MessageCircle size={20} />
          <Bell size={20} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="panel border-white/10 bg-white/10 p-4 text-white backdrop-blur">
          <Sparkles className="text-amber-200" />
          <p className="mt-3 text-3xl font-black">24k</p>
          <p className="text-xs text-zinc-300">moments shared</p>
        </div>
        <div className="panel border-white/10 bg-white/10 p-4 text-white backdrop-blur">
          <UserPlus className="text-teal-200" />
          <p className="mt-3 text-3xl font-black">8.7k</p>
          <p className="text-xs text-zinc-300">new connections</p>
        </div>
      </div>
    </div>
  </section>
);

export default AuthShowcase;
