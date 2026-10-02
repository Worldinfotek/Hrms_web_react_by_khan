import type { CurrentUser } from '@/features/auth/types';
import { hasPermission, useAuthStore } from './authStore';

const user: CurrentUser = {
  id: 2,
  userName: 'ayesha',
  fullName: 'Ayesha Malik',
  email: 'ayesha@test.local',
  mustChangePassword: false,
  isSuperAdmin: false,
  dataScope: 'All',
  roles: ['HR Executive'],
  permissions: ['Users.View'],
};

describe('authStore', () => {
  beforeEach(() => useAuthStore.setState({ status: 'checking', accessToken: null, user: null }));

  it('starts in checking state and becomes authenticated after setSession', () => {
    expect(useAuthStore.getState().status).toBe('checking');
    useAuthStore.getState().setSession('token', user);
    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', accessToken: 'token' });
  });

  it('clearSession signs the user out', () => {
    useAuthStore.getState().setSession('token', user);
    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState()).toMatchObject({ status: 'anonymous', accessToken: null, user: null });
  });

  it('markPasswordChangeRequired flags the current user', () => {
    useAuthStore.getState().setSession('token', user);
    useAuthStore.getState().markPasswordChangeRequired();
    expect(useAuthStore.getState().user?.mustChangePassword).toBe(true);
  });

  it('hasPermission respects explicit permissions and super admin', () => {
    expect(hasPermission(user, 'Users.View')).toBe(true);
    expect(hasPermission(user, 'Users.Delete')).toBe(false);
    expect(hasPermission({ ...user, isSuperAdmin: true, permissions: [] }, 'Users.Delete')).toBe(true);
    expect(hasPermission(null, 'Users.View')).toBe(false);
  });
});
