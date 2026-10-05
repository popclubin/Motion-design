import { useState } from 'react';
import { Navigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../features/auth/AuthProvider';

export default function ResetPasswordPage() {
  const { session, isLoading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (done) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await updatePassword(password);
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  return (
    <div className="dotted-grid flex h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-border bg-panel p-6 shadow-panel">
        <h1 className="mb-1 text-[16px] font-semibold text-text">Set a new password</h1>
        <p className="mb-5 text-[13px] text-muted">Motion Library</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[12px] text-muted">New password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border bg-raised px-3 py-2 text-[13px] text-text focus-visible:outline-none"
            />
          </label>

          {error && <p className="text-[12px] text-danger">{error}</p>}

          <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving…' : 'Save password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
