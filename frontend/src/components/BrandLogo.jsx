import { Aperture } from "lucide-react";

const BrandLogo = ({ compact = false, inverse = false }) => (
  <div className="flex items-center gap-3">
    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[linear-gradient(135deg,#111827,#0f766e_55%,#e85d4f)] text-white shadow-soft">
      <Aperture size={23} strokeWidth={2.4} />
    </span>
    {!compact ? (
      <div>
        <h1 className={`text-2xl font-black tracking-normal ${inverse ? "text-white" : "text-ink"}`}>SocialConnect</h1>
        <p className={`text-xs font-semibold ${inverse ? "text-zinc-300" : "text-zinc-500"}`}>Create. Connect. Repost.</p>
      </div>
    ) : null}
  </div>
);

export default BrandLogo;
