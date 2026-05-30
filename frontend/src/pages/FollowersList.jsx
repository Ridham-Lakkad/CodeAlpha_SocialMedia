import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import UserRow from "../components/UserRow";

const FollowersList = ({ type }) => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${username}`).then(({ data }) => setProfile(data.data.user)).finally(() => setLoading(false));
  }, [username]);

  const users = profile?.[type] || [];
  const title = type === "followers" ? "Followers" : "Following";

  return (
    <div className="page-shell max-w-2xl">
      <h1 className="text-2xl font-black text-white">{title}</h1>
      <section className="panel mt-5 overflow-hidden">
        {loading ? <p className="p-5 text-sm text-zinc-400">Loading...</p> : null}
        {!loading && users.length === 0 ? <EmptyState title={`No ${title.toLowerCase()}`} text="This list is empty right now." /> : null}
        {users.map((item) => <UserRow key={item._id} user={item} />)}
      </section>
    </div>
  );
};

export default FollowersList;
