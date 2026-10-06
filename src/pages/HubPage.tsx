import { Layers, PlusCircle, Shield } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/Button';
import { Pill } from '../components/ui/Pill';
import { Spinner } from '../components/ui/Spinner';
import { AvatarMenu } from '../features/auth/AvatarMenu';
import { useAuth } from '../features/auth/AuthProvider';

export default function HubPage() {
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
          <Link to="/hub" className="text-[14px] font-semibold text-text hover:text-accent transition-colors">
            Motion Library
          </Link>
          <Pill>Beta</Pill>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <>
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

      <section className="dotted-grid flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight sm:text-[32px]">
            Choose an option below to get started
          </h1>
          <p className="mt-1 text-[14px] text-muted">
            {session?.user.email ? `Signed in as ${session.user.email}` : 'Select a workspace to continue'}
          </p>
        </div>

        <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
          {/* Section 1: Library assets */}
          <Link
            to="/editor"
            className="group relative flex flex-col items-center gap-3.5 rounded-[var(--radius-lg)] border border-border bg-panel p-8 text-center transition-all duration-200 hover:border-accent hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform group-hover:scale-110">
              <Layers size={24} />
            </div>
            <div>
              <span className="text-[16px] font-semibold text-text">Library assets</span>
              <p className="mt-1 text-[13px] text-muted">
                Explore, interact with, customize parameters, and export motion animations.
              </p>
            </div>
          </Link>

          {/* Section 2: Create motion library (Disabled / Coming Soon) */}
          <div className="relative flex cursor-not-allowed flex-col items-center gap-3.5 rounded-[var(--radius-lg)] border border-dashed border-border bg-panel/50 p-8 text-center opacity-60 select-none">
            <div className="absolute top-3.5 right-3.5">
              <Pill className="border-accent/40 bg-accent/10 text-accent">Coming soon</Pill>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-raised text-muted">
              <PlusCircle size={24} />
            </div>
            <div>
              <span className="text-[16px] font-semibold text-text">Create motion library</span>
              <p className="mt-1 text-[13px] text-muted">
                Design, build, and publish your own custom interactive animations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
