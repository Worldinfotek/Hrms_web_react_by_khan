import { hasPermission, useAuthStore } from '@/stores/authStore';

/** Returns true when the signed-in user has the permission (or when none is required). */
export function usePermission(permission?: string): boolean {
  const user = useAuthStore((state) => state.user);
  return !permission || hasPermission(user, permission);
}
