import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { isDemoMode } from '@/app/router/useNavRole';
import { useAuthStore } from '@/stores/authStore';
import { demoAdapter } from './demoBackend';
import { refreshSession } from './session';
import { ApiError, type ApiResponse, type PagedData } from './types';

/**
 * Single Axios instance for the whole app.
 * - attaches the access token and a correlation id to every request
 * - on 401, refreshes the session once (cookie) and retries the request
 * - converts every failure into an ApiError with a user-friendly message
 */
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  timeout: 30_000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

if (isDemoMode()) {
  httpClient.defaults.adapter = demoAdapter;
}

/** Endpoints that must never trigger an automatic refresh-and-retry. */
const NO_REFRESH = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
];

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Correlation-Id'] = crypto.randomUUID().replaceAll('-', '');
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    // File downloads use responseType "blob": turn a JSON error body back into an object.
    const data: unknown = error.response?.data;
    if (error.response && data instanceof Blob && data.type.includes('json')) {
      try {
        error.response.data = JSON.parse(await data.text()) as ApiResponse<unknown>;
      } catch {
        // keep the generic message
      }
    }

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !NO_REFRESH.some((url) => original.url?.startsWith(url))
    ) {
      original._retry = true;
      const token = await refreshSession();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return httpClient(original);
      }
    }

    if (status === 403 && error.response?.headers['x-password-change-required'] === 'true') {
      useAuthStore.getState().markPasswordChangeRequired();
    }

    return Promise.reject(toApiError(error));
  },
);

export function toApiError(error: AxiosError<ApiResponse<unknown>>): ApiError {
  if (error.response) {
    const body = error.response.data;
    const status = error.response.status;
    return new ApiError(
      body?.message ?? defaultMessage(status),
      status,
      body?.errors ?? {},
      body?.traceId ?? undefined,
    );
  }
  if (error.code === 'ECONNABORTED') {
    return new ApiError('The server took too long to respond. Please try again.', 0);
  }
  return new ApiError('Unable to reach the server. Check your connection.', 0);
}

function defaultMessage(status: number): string {
  switch (status) {
    case 400:
      return 'The request is invalid.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This record was changed by someone else. Please reload and try again.';
    case 429:
      return 'Too many attempts. Please wait a minute and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

/** Typed helpers that unwrap ApiResponse<T> so feature code works with plain data. */
export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await httpClient.get<ApiResponse<T>>(url, config);
    return data.data as T;
  },
  async getPaged<T>(url: string, params?: object): Promise<PagedData<T>> {
    const { data } = await httpClient.get<ApiResponse<T[]>>(url, { params });
    return {
      items: data.data ?? [],
      meta: data.meta ?? { page: 1, pageSize: 0, totalCount: 0, totalPages: 0 },
    };
  },
  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await httpClient.post<ApiResponse<T>>(url, body, config);
    return data.data as T;
  },
  /** Like post, but returns the server message as well (for success toasts). */
  async postWithMessage<T>(url: string, body?: unknown): Promise<{ data: T; message?: string | null }> {
    const { data } = await httpClient.post<ApiResponse<T>>(url, body);
    return { data: data.data as T, message: data.message };
  },
  async put<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await httpClient.put<ApiResponse<T>>(url, body);
    return data.data as T;
  },
  async patch<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await httpClient.patch<ApiResponse<T>>(url, body);
    return data.data as T;
  },
  async delete(url: string): Promise<void> {
    await httpClient.delete(url);
  },
};
