import type { ReactNode } from 'react';
import ForbiddenPage from '@/pages/ForbiddenPage';
import { usePermission } from '@/shared/auth/usePermission';

/** Shows a 403 page instead of the route when the permission is missing. */
export function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  return usePermission(permission) ? <>{children}</> : <ForbiddenPage />;
}
