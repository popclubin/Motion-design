import { Shield } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/Button';
import { Pill } from '../components/ui/Pill';
import { Spinner } from '../components/ui/Spinner';
import { AvatarMenu } from '../features/auth/AvatarMenu';
import { useAuth } from '../features/auth/AuthProvider';

export default function LandingPage() {
  const { session, profile, isLoading, isProfileLoading, signOut } = useAuth();
  const isAdmin = profile?.role === 'admin';

  if (isLoading || (session && isProfileLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="flex h-[var(--top-bar-height)] items-center justify-between border-b border-border bg-panel px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold">Motion Library</span>
          <Pill>Beta</Pill>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link to="/hub">
                <Button variant="secondary" className="text-[13px]">
                  Open Library
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" className="gap-1.5 text-[13px]">
                    <Shield size={14} className="text-accent" />
                    Admin
                  </Button>
                </Link>
              )}
              <span className="hidden text-[13px] text-muted sm:inline">{session.user.email}</span>
              <Button variant="ghost" onClick={() => void signOut()}>
                Sign out
              </Button>
              <AvatarMenu />
            </>
          ) : (
            <Link to="/login">
              <Button variant="secondary">Sign in</Button>
            </Link>
          )}
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
          {session ? (
            <Link to="/hub">
              <Button variant="primary" className="px-6 py-2.5 text-[14px]">
                Open Motion Library
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="primary" className="px-6 py-2.5 text-[14px]">
                Try it free
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
