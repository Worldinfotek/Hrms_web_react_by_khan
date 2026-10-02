import { create } from 'zustand';
import type { CurrentUser } from '@/features/auth/types';

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

interface AuthState {
  status: AuthStatus;
  /** Kept in memory only (never localStorage). The HttpOnly refresh cookie restores it after a reload. */
  accessToken: string | null;
  user: CurrentUser | null;
  setSession: (accessToken: string, user: CurrentUser) => void;
  setUser: (user: CurrentUser) => void;
  markPasswordChangeRequired: () => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'checking',
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ status: 'authenticated', accessToken, user }),
  setUser: (user) => set({ user }),
  markPasswordChangeRequired: () =>
    set((state) => (state.user ? { user: { ...state.user, mustChangePassword: true } } : state)),
  clearSession: () => set({ status: 'anonymous', accessToken: null, user: null }),
}));

/** True when the user holds the permission (Super Admin holds all). */
export function hasPermission(user: CurrentUser | null, permission: string): boolean {
  return !!user && (user.isSuperAdmin || user.permissions.includes(permission));
}
