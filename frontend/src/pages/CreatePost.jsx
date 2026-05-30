import { ImagePlus, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const CreatePost = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!image) return toast.error("Choose an image or video first");

    const body = new FormData();
    body.append("image", image);
    body.append("caption", caption);
    body.append("contentType", "post");
    setLoading(true);
    try {
      await api.post("/posts", body);
      toast.success("Post published");
      window.dispatchEvent(new Event("content:published"));
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell max-w-3xl">
      <h1 className="text-2xl font-black text-white">Create Post</h1>
      <form className="panel mt-5 overflow-hidden" onSubmit={submit}>
        <label className="grid min-h-80 cursor-pointer place-items-center bg-black">
          {preview ? (
            image?.type?.startsWith("video/") ? (
              <video src={preview} className="max-h-[560px] w-full object-contain" controls />
            ) : (
              <img src={preview} alt="Preview" className="max-h-[560px] w-full object-contain" />
            )
          ) : (
            <div className="text-center text-zinc-400"><ImagePlus className="mx-auto mb-3" size={40} /><p className="font-semibold text-white">Choose an image or video</p></div>
          )}
          <input type="file" accept="image/*,video/*" className="hidden" onChange={chooseImage} />
        </label>
        <div className="space-y-4 p-4">
          <textarea className="input min-h-28 resize-none" placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} />
          <button className="btn-primary w-full" disabled={loading}>
            <Send size={18} />
            {loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
