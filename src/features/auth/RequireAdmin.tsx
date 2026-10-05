import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from './AuthProvider';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, profile, isLoading, isProfileLoading } = useAuth();

  if (isLoading || (session && isProfileLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Spinner />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/editor" replace />;

  return children;
}
