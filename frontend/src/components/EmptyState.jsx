const EmptyState = ({ title, text, action }) => (
  <div className="panel flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
    <h2 className="text-lg font-bold text-[var(--text)]">{title}</h2>
    <p className="mt-2 max-w-md text-sm text-[var(--muted)]">{text}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export default EmptyState;
