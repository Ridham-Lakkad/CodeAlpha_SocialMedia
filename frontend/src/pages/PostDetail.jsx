import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import PostCard from "../components/PostCard";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setLoading(true);
    setMissing(false);

    api
      .get(`/posts/${id}`)
      .then(({ data }) => setPost(data.data))
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="page-shell mx-auto max-w-[760px] space-y-5">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--link)] hover:text-[var(--link-hover)]">
        <ArrowLeft size={18} />
        Back to feed
      </Link>

      {loading ? <div className="panel p-6 text-sm text-[var(--muted)]">Loading post...</div> : null}
      {!loading && missing ? <EmptyState title="Post not found" text="This post may have been removed or the link is no longer available." /> : null}
      {!loading && post ? <PostCard post={post} onChange={setPost} onDelete={() => {
        setPost(null);
        setMissing(true);
      }} /> : null}
    </div>
  );
};

export default PostDetail;
