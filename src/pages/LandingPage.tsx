import { Film, Gauge, LayoutDashboard, Package, Shield, Sparkles } from 'lucide-react';
import { Link, Navigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { Pill } from '../components/ui/Pill';
import { Spinner } from '../components/ui/Spinner';
import { AvatarMenu } from '../features/auth/AvatarMenu';
import { useAuth } from '../features/auth/AuthProvider';

const FEATURES = [
  {
    icon: Package,
    title: 'Pick an animation',
    body: 'Browse a growing library of looping UI animations, grouped by category.',
  },
  {
    icon: Gauge,
    title: 'Tune it live',
    body: 'Every parameter — colour, timing, count — updates the preview instantly.',
  },
  {
    icon: Film,
    title: 'Export the code',
    body: 'Download a standalone Vite + React project with your exact settings baked in.',
  },
];

const WHY = [
  'Runs entirely in your browser — nothing to install.',
  'Starts from real, tuned parameter values, not a blank template.',
  'Every animation ships as plain React — read it, fork it, own it.',
];

export default function LandingPage() {
  const { session, profile, isLoading, isProfileLoading, signOut } = useAuth();
  const isAdmin = profile?.role === 'admin';

  if (session && isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Spinner />
      </div>
    );
  }

  if (session && !isAdmin) {
    return <Navigate to="/editor" replace />;
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="flex h-[var(--top-bar-height)] items-center justify-between border-b border-border bg-panel px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold">Motion Library</span>
          <Pill>Beta</Pill>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && session ? (
            <>
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

      {!isLoading && session ? (
        <section className="dotted-grid flex flex-col items-center gap-6 px-6 py-20 text-center">
          <h1 className="text-[28px] font-semibold">Where do you want to go?</h1>
          <div className={`grid w-full max-w-2xl gap-4 ${isAdmin ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
            <Link
              to="/editor"
              className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-panel p-8 transition-colors hover:border-accent"
            >
              <LayoutDashboard size={24} className="text-accent" />
              <span className="text-[15px] font-semibold">User panel</span>
              <span className="text-[13px] text-muted">
                Browse, tune, and export animations as {session.user.email}.
              </span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-panel p-8 transition-colors hover:border-accent"
              >
                <Shield size={24} className="text-accent" />
                <span className="text-[15px] font-semibold">Admin panel</span>
                <span className="text-[13px] text-muted">
                  Manage categories, thumbnails, and publishing.
                </span>
              </Link>
            )}
          </div>
        </section>
      ) : (
        <section className="dotted-grid flex flex-col items-center gap-6 px-6 py-24 text-center">
          <Pill>
            <Sparkles size={11} className="mr-1 inline" />
            200+ animations
          </Pill>
          <h1 className="max-w-2xl text-[40px] leading-tight font-semibold sm:text-[52px]">
            Tune UI animations in your browser, export working code.
          </h1>
          <p className="max-w-xl text-[15px] text-muted">
            Pick a template, drag the sliders until it feels right, then download a
            standalone project with those exact values — no design tool, no plugins.
          </p>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="primary" className="px-6 py-2.5 text-[14px]">
                Try it free
              </Button>
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-6 border-t border-border px-6 py-16 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-panel p-5">
            <Icon size={18} className="text-accent" />
            <h3 className="text-[14px] font-semibold">{title}</h3>
            <p className="text-[13px] text-muted">{body}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-border px-6 py-16">
        <h2 className="mb-6 text-center text-[13px] font-semibold tracking-wide text-muted uppercase">
          Why Motion Library
        </h2>
        <ul className="mx-auto flex max-w-lg flex-col gap-3">
          {WHY.map((line) => (
            <li key={line} className="flex gap-2 text-[14px] text-text">
              <span className="text-accent">—</span> {line}
            </li>
          ))}
        </ul>
      </section>

      <footer className="flex items-center justify-between border-t border-border px-6 py-6 text-[12px] text-muted">
        <span>© 2026 Motion Library</span>
        <Link to={session ? '/editor' : '/login'} className="text-accent hover:underline">
          {session ? 'Open editor' : 'Try it free'}
        </Link>
      </footer>
    </div>
  );
}
