import { Camera, Clapperboard, ImagePlus, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";

const UploadModal = ({ open, onClose }) => {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [mode, setMode] = useState("post");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const selectFile = (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  };

  useEffect(() => {
    // when camera modal opens, start camera
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        // fallback: close camera modal and open file picker
        setCameraOpen(false);
        cameraInputRef.current?.click();
      }
    };

    if (cameraOpen) startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [cameraOpen]);

  if (!open) return null;

  const captureFromCamera = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.95));
    if (!blob) return;
    const capturedFile = new File([blob], `capture_${Date.now()}.jpg`, { type: blob.type });
    setFile(capturedFile);
    setPreview(URL.createObjectURL(capturedFile));
    // stop stream and close camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const publish = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error("Choose or capture media first");
      return;
    }

    const body = new FormData();
    body.append("image", file);
    body.append("caption", caption);
    body.append("contentType", mode);

    setLoading(true);
    try {
      await api.post("/posts", body);
      toast.success(mode === "story" ? "Story uploaded" : "Post uploaded");
      window.dispatchEvent(new Event("content:published"));
      setFile(null);
      setPreview("");
      setCaption("");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ zIndex: 10000 }} className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-4 backdrop-blur-sm">
      <form onSubmit={publish} className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0e1316] text-white shadow-2xl ring-1 ring-white/10">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-400">Create</p>
            <h2 className="text-xl font-black">Upload post or story</h2>
          </div>
          <button type="button" onClick={onClose} className="icon-btn text-white hover:bg-white/10" title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 grid grid-cols-2 gap-2">
            {["post", "story"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-xl px-4 py-3 text-sm font-bold capitalize ${
                  mode === item ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid min-h-72 place-items-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-[#071014]">
            {preview ? (
              file?.type?.startsWith("video/") ? (
                <video src={preview} className="max-h-[420px] w-full object-contain" controls />
              ) : (
                <img src={preview} alt="Upload preview" className="max-h-[420px] w-full object-contain" />
              )
            ) : (
              <div className="px-6 text-center text-zinc-400">
                <ImagePlus className="mx-auto mb-3" size={42} />
                <p className="font-semibold text-white">Capture from camera or choose from gallery</p>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15"
              onClick={() => {
                // prefer opening an in-app camera if available
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                  setCameraOpen(true);
                } else {
                  cameraInputRef.current?.click();
                }
              }}
            >
              <Camera size={18} />
              Camera
            </button>
            <button type="button" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15" onClick={() => galleryInputRef.current?.click()}>
              <Clapperboard size={18} />
              Gallery
            </button>
          </div>

          <input ref={cameraInputRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={selectFile} />
          <input ref={galleryInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={selectFile} />

          {cameraOpen ? (
            <div style={{ zIndex: 11000 }} className="fixed inset-0 grid place-items-center bg-black/80">
              <div className="w-full max-w-lg rounded-2xl bg-[#0b0d0f] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Camera</h3>
                  <div>
                    <button onClick={() => { if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; } setCameraOpen(false); }} className="icon-btn text-white hover:bg-white/10">Close</button>
                  </div>
                </div>
                <div className="mb-3 h-72 w-full overflow-hidden rounded bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                </div>
                <div className="flex justify-center gap-3">
                  <button onClick={captureFromCamera} className="btn-primary px-6 py-2">Capture</button>
                </div>
              </div>
            </div>
          ) : null}

          <textarea
            className="input mt-4 min-h-24 resize-none border-white/10 bg-black text-white placeholder:text-zinc-500"
            placeholder={mode === "story" ? "Story caption..." : "Write a caption..."}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />

          <button className="btn-primary mt-4 w-full bg-white py-3 text-black hover:bg-zinc-200" disabled={loading}>
            <Send size={18} />
            {loading ? "Publishing..." : `Publish ${mode}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadModal;
