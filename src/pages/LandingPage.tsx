import { Link, Navigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { Pill } from '../components/ui/Pill';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../features/auth/AuthProvider';

export default function LandingPage() {
  const { session, isLoading, isProfileLoading } = useAuth();

  if (isLoading || (session && isProfileLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Spinner />
      </div>
    );
  }

  // Once authenticated, immediately redirect to the Hub page
  if (session) {
    return <Navigate to="/hub" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="flex h-[var(--top-bar-height)] items-center justify-between border-b border-border bg-panel px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold">Motion Library</span>
          <Pill>Beta</Pill>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
        </div>
      </header>

      <section className="dotted-grid flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <h1 className="max-w-2xl text-[40px] leading-tight font-semibold sm:text-[52px]">
          Tune UI animations in your browser, export working code.
        </h1>
        <p className="max-w-xl text-[15px] text-muted sm:text-[17px]">
          Explore interactive UI components, customize parameters in real time, and export clean production-ready code.
        </p>
        <div className="flex gap-3 mt-2">
          <Link to="/login">
            <Button variant="primary" className="px-6 py-2.5 text-[14px]">
              Try it free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
