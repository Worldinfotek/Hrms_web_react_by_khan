import axios from 'axios';
import { isDemoMode } from '@/app/router/useNavRole';
import type { AuthResponse } from '@/features/auth/types';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse } from './types';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

let inFlight: Promise<string | null> | null = null;

/**
 * Exchanges the HttpOnly refresh cookie for a new access token.
 * Concurrent callers share one request (single-flight), so many parallel 401s cause one refresh.
 */
export function refreshSession(): Promise<string | null> {
  if (isDemoMode()) {
    useAuthStore.getState().clearSession();
    return Promise.resolve(null);
  }
  inFlight ??= axios
    .post<ApiResponse<AuthResponse>>(`${baseURL}/auth/refresh`, null, { withCredentials: true })
    .then(({ data }) => {
      const session = data.data!;
      useAuthStore.getState().setSession(session.accessToken, session.user);
      return session.accessToken;
    })
    .catch(() => {
      useAuthStore.getState().clearSession();
      return null;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
