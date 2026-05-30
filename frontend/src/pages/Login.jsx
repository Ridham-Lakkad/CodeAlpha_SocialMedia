import { motion } from "framer-motion";
import { CheckCircle2, LockKeyhole, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthShowcase from "../components/AuthShowcase";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || "", password: "" });
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login({ ...form, email: form.email.trim() });
      toast.success("Welcome back");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#f4f7f5] lg:grid-cols-[1.05fr_0.95fr]">
      <AuthShowcase />
      <main className="grid min-h-screen place-items-center px-4 py-8 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[30rem]">
          <div className="mb-8 lg:hidden">
            <p className="eyebrow">SocialConnect</p>
            <h1 className="mt-3 text-4xl font-black text-zinc-950">Welcome back</h1>
          </div>
          <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-6 text-zinc-950 shadow-[0_24px_70px_rgba(22,22,22,0.12)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">Login</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-brand">
                <CheckCircle2 size={14} />
                Secure
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">Enter your circle</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Login to publish posts, follow creators, save ideas, and see live notifications.
            </p>
            <form className="mt-8 space-y-5" onSubmit={submit}>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-500"><Mail size={14} /> Email</span>
                <input className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-teal-100" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-500"><LockKeyhole size={14} /> Password</span>
                <input className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-teal-100" type="password" placeholder="Your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </label>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3.5 text-sm font-black text-white shadow-[0_14px_28px_rgba(15,118,110,0.28)] transition hover:-translate-y-0.5 hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
                <LogIn size={18} />
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-zinc-600">
              New here? <Link to="/register" className="font-bold text-brand">Create an account</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
