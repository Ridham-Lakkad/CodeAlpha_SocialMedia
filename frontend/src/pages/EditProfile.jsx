import { Camera, Save } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    website: user.website || "",
    location: user.location || ""
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user.avatar?.url);
  const [loading, setLoading] = useState(false);

  const chooseAvatar = (event) => {
    const file = event.target.files?.[0];
    setAvatar(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const submit = async (event) => {
    event.preventDefault();
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    if (avatar) body.append("avatar", avatar);

    setLoading(true);
    try {
      const { data } = await api.patch("/users/profile", body);
      localStorage.setItem("socialconnect_user", JSON.stringify(data.data));
      setUser(data.data);
      toast.success("Profile updated");
      navigate(`/${data.data.username}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell max-w-2xl">
      <h1 className="text-2xl font-black">Edit Profile</h1>
      <form className="panel mt-5 space-y-5 p-5" onSubmit={submit}>
        <label className="flex cursor-pointer items-center gap-4">
          <img src={preview} alt={user.username} className="h-20 w-20 rounded-full object-cover" />
          <span className="btn-secondary"><Camera size={18} /> Change Photo</span>
          <input type="file" accept="image/*" className="hidden" onChange={chooseAvatar} />
        </label>
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <textarea className="input min-h-28 resize-none" placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <input className="input" placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        <input className="input" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <button className="btn-primary w-full" disabled={loading}>
          <Save size={18} />
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
