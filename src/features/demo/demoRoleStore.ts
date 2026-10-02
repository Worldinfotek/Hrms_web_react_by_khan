import { create } from 'zustand';
import type { NavRole } from '@/app/router/navConfig';

interface DemoRoleState {
  role: NavRole;
  setRole: (role: NavRole) => void;
}

/** Session-only stand-in for the signed-in role. Defaults to Super Admin so the full sidebar shows after login. */
export const useDemoRoleStore = create<DemoRoleState>()((set) => ({
  role: 'super-admin',
  setRole: (role) => set({ role }),
}));
