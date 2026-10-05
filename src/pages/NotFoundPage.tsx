import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 bg-bg text-text">
      <h1 className="text-[20px] font-semibold">404</h1>
      <p className="text-[13px] text-muted">Page not found.</p>
      <Link to="/editor" className="text-[13px] text-accent hover:underline">
        Back to editor
      </Link>
    </div>
  );
}
