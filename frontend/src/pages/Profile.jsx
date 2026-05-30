import { Edit3, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { username } = useParams();
  const { user, setUser, refreshMe } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    const { data } = await api.get(`/users/${username}`);
    setProfile(data.data.user);
    setPosts(data.data.posts);
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  const isMe = profile?._id === user._id;
  const isFollowing = user.following?.some((id) => id === profile?._id || id?._id === profile?._id);

  const toggleFollow = async () => {
    try {
      const method = isFollowing ? "delete" : "post";
      await api[method](`/users/${profile._id}/follow`);
      await refreshMe();
      await loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Follow action failed");
    }
  };

  const replacePost = (nextPost) => setPosts((items) => items.map((item) => (item._id === nextPost._id ? nextPost : item)));
  const removePost = (postId) => setPosts((items) => items.filter((item) => item._id !== postId));

  if (loading) return <div className="page-shell text-sm text-zinc-600">Loading profile...</div>;
  if (!profile) return <div className="page-shell"><EmptyState title="Profile not found" text="This user does not exist." /></div>;

  return (
    <div className="page-shell max-w-5xl">
      <section className="flex flex-col gap-6 border-b border-zinc-200 pb-8 md:flex-row md:items-center">
        <img src={profile.avatar?.url} alt={profile.username} className="h-28 w-28 rounded-full object-cover md:h-36 md:w-36" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-all text-2xl font-black">@{profile.username}</h1>
            {isMe ? (
              <Link to="/profile/edit" className="btn-secondary">
                <Edit3 size={17} />
                Edit Profile
              </Link>
            ) : (
              <button onClick={toggleFollow} className={isFollowing ? "btn-secondary" : "btn-primary"}>
                {isFollowing ? <UserMinus size={17} /> : <UserPlus size={17} />}
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
          <div className="mt-5 flex gap-6 text-sm">
            <span><b>{posts.length}</b> posts</span>
            <Link to={`/${profile.username}/followers`}><b>{profile.followers?.length || 0}</b> followers</Link>
            <Link to={`/${profile.username}/following`}><b>{profile.following?.length || 0}</b> following</Link>
          </div>
          <div className="mt-5">
            <p className="font-bold">{profile.name}</p>
            {profile.bio ? <p className="mt-1 max-w-xl text-sm text-zinc-700">{profile.bio}</p> : null}
            {profile.website ? <a className="mt-1 block text-sm font-semibold text-brand" href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a> : null}
            {profile.location ? <p className="mt-1 text-sm text-zinc-500">{profile.location}</p> : null}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        {posts.length === 0 ? <EmptyState title="No posts yet" text="Shared moments will appear here." /> : null}
        {posts.map((post) => <PostCard key={post._id} post={post} onChange={replacePost} onDelete={removePost} />)}
      </section>
    </div>
  );
};

export default Profile;
