import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Button } from '../components/ui/Button';
import { useAuth } from '../features/auth/AuthProvider';

type Mode = 'sign-in' | 'sign-up' | 'forgot';

export default function LoginPage() {
  const { session, signInWithGoogle, signInWithPassword, signUpWithPassword, resetPassword } =
    useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (session) {
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    const result =
      mode === 'sign-in'
        ? await signInWithPassword(email, password)
        : mode === 'sign-up'
          ? await signUpWithPassword(email, password)
          : await resetPassword(email);

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === 'sign-up') setNotice('Check your email to confirm your account.');
    if (mode === 'forgot') setNotice('Check your email for a password reset link.');
  }

  return (
    <div className="dotted-grid flex h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-border bg-panel p-6 shadow-panel">
        <h1 className="mb-1 text-[16px] font-semibold text-text">
          {mode === 'sign-in' && 'Sign in'}
          {mode === 'sign-up' && 'Create an account'}
          {mode === 'forgot' && 'Reset your password'}
        </h1>
        <p className="mb-5 text-[13px] text-muted">Motion Library</p>

        <Button
          type="button"
          variant="secondary"
          className="mb-4 w-full"
          onClick={() => void signInWithGoogle()}
        >
          Continue with Google
        </Button>

        <div className="mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[12px] text-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border bg-raised px-3 py-2 text-[13px] text-text focus-visible:outline-none"
            />
          </label>

          {mode !== 'forgot' && (
            <label className="flex flex-col gap-1">
              <span className="text-[12px] text-muted">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border border-border bg-raised px-3 py-2 text-[13px] text-text focus-visible:outline-none"
              />
            </label>
          )}

          {error && <p className="text-[12px] text-danger">{error}</p>}
          {notice && <p className="text-[12px] text-accent">{notice}</p>}

          <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
            {mode === 'sign-in' && 'Sign in'}
            {mode === 'sign-up' && 'Sign up'}
            {mode === 'forgot' && 'Send reset link'}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-[12px] text-muted">
          {mode === 'sign-in' ? (
            <>
              <button type="button" className="hover:text-text" onClick={() => setMode('forgot')}>
                Forgot password?
              </button>
              <button type="button" className="hover:text-text" onClick={() => setMode('sign-up')}>
                Create an account
              </button>
            </>
          ) : (
            <button type="button" className="hover:text-text" onClick={() => setMode('sign-in')}>
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
