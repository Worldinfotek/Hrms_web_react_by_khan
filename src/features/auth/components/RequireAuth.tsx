import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PageLoader } from '@/shared/components';
import { useAuthStore } from '@/stores/authStore';

/**
 * Guards private routes: waits for the session check, sends anonymous users to the login page
 * and forces a password change when the account still has a temporary password.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const mustChangePassword = useAuthStore((state) => state.user?.mustChangePassword ?? false);
  const location = useLocation();

  if (status === 'checking') {
    return <PageLoader fullScreen />;
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
}
