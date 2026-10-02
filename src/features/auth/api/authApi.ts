import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/httpClient';
import { useAuthStore } from '@/stores/authStore';
import type {
  AuthResponse,
  ChangePasswordRequest,
  CurrentUser,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
} from '../types';

export const authApi = {
  login: (request: LoginRequest) => api.post<AuthResponse>('/auth/login', request),
  logout: () => api.post<null>('/auth/logout'),
  logoutAll: () => api.post<null>('/auth/logout-all'),
  me: () => api.get<CurrentUser>('/auth/me'),
  forgotPassword: (request: ForgotPasswordRequest) =>
    api.postWithMessage<null>('/auth/forgot-password', request),
  resetPassword: (request: ResetPasswordRequest) =>
    api.postWithMessage<null>('/auth/reset-password', request),
  changePassword: (request: ChangePasswordRequest) =>
    api.postWithMessage<null>('/auth/change-password', request),
};

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => useAuthStore.getState().setSession(session.accessToken, session.user),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => useAuthStore.getState().clearSession(),
  });
}

export function useLogoutAll() {
  return useMutation({
    mutationFn: authApi.logoutAll,
    onSettled: () => useAuthStore.getState().clearSession(),
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: authApi.resetPassword });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: async () => {
      const user = await authApi.me();
      useAuthStore.getState().setUser(user);
    },
  });
}
