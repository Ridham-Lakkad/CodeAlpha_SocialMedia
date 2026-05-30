import { Link } from "react-router-dom";

const UserRow = ({ user, action }) => (
  <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 last:border-0">
    <Link to={`/${user.username}`} className="flex min-w-0 items-center gap-3">
      <img src={user.avatar?.url} alt={user.username} className="h-11 w-11 rounded-full object-cover" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-[var(--text)]">{user.name}</p>
        <p className="truncate text-xs text-[var(--muted)]">@{user.username}</p>
      </div>
    </Link>
    {action}
  </div>
);

export default UserRow;
