import type { ReactNode } from 'react';
import { usePermission } from './usePermission';

interface CanProps {
  permission?: string;
  children: ReactNode;
  /** Rendered when the permission is missing (defaults to nothing). */
  fallback?: ReactNode;
}

/** Shows its children only when the user has the permission. The API still enforces every rule. */
export function Can({ permission, children, fallback = null }: CanProps) {
  return usePermission(permission) ? <>{children}</> : <>{fallback}</>;
}
