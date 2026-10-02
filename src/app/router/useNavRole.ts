import type { CurrentUser } from '@/features/auth/types';
import { useAuthStore } from '@/stores/authStore';
import { useDemoRoleStore } from '@/features/demo/demoRoleStore';
import { NAV_ROLES, type NavRole } from './navConfig';

/** Demo tools are on unless VITE_DEMO_MODE is the string "false". */
export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE !== 'false';
}

/** Maps a real signed-in user onto the sidebar roles. Used when demo mode is off. */
export function roleFromUser(user: CurrentUser | null): NavRole {
  if (!user) return 'employee';
  if (user.isSuperAdmin || user.roles.some((role) => /super\s*admin/i.test(role))) return 'super-admin';
  const joined = user.roles.join(' ').toLowerCase();
  if (joined.includes('hr executive')) return 'hr-executive';
  if (joined.includes('hr')) return 'hr-admin';
  if (joined.includes('finance')) return 'finance';
  if (joined.includes('management')) return 'management';
  if (joined.includes('manager')) return 'manager';
  if (NAV_ROLES.includes(joined as NavRole)) return joined as NavRole;
  return 'employee';
}

/** Sidebar role. Demo tools win while VITE_DEMO_MODE is on; otherwise the signed-in user. */
export function useNavRole(): NavRole {
  const demoRole = useDemoRoleStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  return isDemoMode() ? demoRole : roleFromUser(user);
}
