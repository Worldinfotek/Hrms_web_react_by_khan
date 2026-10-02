import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/httpClient';
import type {
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UserDetail,
  UserListItem,
  UserListQuery,
  UserSession,
} from '../types';

export const userKeys = {
  all: ['users'] as const,
  list: (query: UserListQuery) => ['users', 'list', query] as const,
  detail: (id: number) => ['users', 'detail', id] as const,
  sessions: (id: number) => ['users', 'sessions', id] as const,
};

export const usersApi = {
  list: (query: UserListQuery) => api.getPaged<UserListItem>('/users', query),
  get: (id: number) => api.get<UserDetail>(`/users/${id}`),
  create: (request: CreateUserRequest) => api.post<CreateUserResponse>('/users', request),
  update: (id: number, request: UpdateUserRequest) => api.put<UserDetail>(`/users/${id}`, request),
  setStatus: (id: number, isActive: boolean) => api.patch<null>(`/users/${id}/status`, { isActive }),
  resetPassword: (id: number, newPassword?: string | null) =>
    api.post<{ temporaryPassword: string | null }>(`/users/${id}/reset-password`, {
      newPassword: newPassword || null,
    }),
  unlock: (id: number) => api.post<null>(`/users/${id}/unlock`),
  sessions: (id: number) => api.get<UserSession[]>(`/users/${id}/sessions`),
  revokeSessions: (id: number) => api.post<null>(`/users/${id}/sessions/revoke`),
  remove: (id: number) => api.delete(`/users/${id}`),
};

export function useUsers(query: UserListQuery) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => usersApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: number | undefined) {
  return useQuery({ queryKey: userKeys.detail(id ?? 0), queryFn: () => usersApi.get(id!), enabled: !!id });
}

export function useUserSessions(id: number | undefined) {
  return useQuery({
    queryKey: userKeys.sessions(id ?? 0),
    queryFn: () => usersApi.sessions(id!),
    enabled: !!id,
  });
}

/** Wraps a mutation so every user list/detail is refreshed afterwards. */
function useUserMutation<TVariables, TResult>(fn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export const useCreateUser = () => useUserMutation(usersApi.create);
export const useUpdateUser = () =>
  useUserMutation(({ id, request }: { id: number; request: UpdateUserRequest }) =>
    usersApi.update(id, request),
  );
export const useSetUserStatus = () =>
  useUserMutation(({ id, isActive }: { id: number; isActive: boolean }) => usersApi.setStatus(id, isActive));
export const useResetUserPassword = () =>
  useUserMutation(({ id, newPassword }: { id: number; newPassword?: string | null }) =>
    usersApi.resetPassword(id, newPassword),
  );
export const useUnlockUser = () => useUserMutation(usersApi.unlock);
export const useRevokeUserSessions = () => useUserMutation(usersApi.revokeSessions);
export const useDeleteUser = () => useUserMutation(usersApi.remove);
