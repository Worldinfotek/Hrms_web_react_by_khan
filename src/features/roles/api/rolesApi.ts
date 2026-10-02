import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/httpClient';
import type { PagedRequest } from '@/api/types';
import type { PermissionGroup, RoleDetail, RoleListItem, RoleLookup, SaveRoleRequest } from '../types';

export const roleKeys = {
  all: ['roles'] as const,
  list: (query: PagedRequest) => ['roles', 'list', query] as const,
  lookup: ['roles', 'lookup'] as const,
  detail: (id: number) => ['roles', 'detail', id] as const,
  catalog: ['permissions', 'catalog'] as const,
};

export const rolesApi = {
  list: (query: PagedRequest) => api.getPaged<RoleListItem>('/roles', query),
  lookup: () => api.get<RoleLookup[]>('/roles/lookup'),
  get: (id: number) => api.get<RoleDetail>(`/roles/${id}`),
  create: (request: SaveRoleRequest) => api.post<RoleDetail>('/roles', request),
  update: (id: number, request: SaveRoleRequest) => api.put<RoleDetail>(`/roles/${id}`, request),
  updatePermissions: (id: number, permissions: string[]) =>
    api.put<RoleDetail>(`/roles/${id}/permissions`, { permissions }),
  remove: (id: number) => api.delete(`/roles/${id}`),
  catalog: () => api.get<PermissionGroup[]>('/permissions'),
};

export function useRoles(query: PagedRequest) {
  return useQuery({
    queryKey: roleKeys.list(query),
    queryFn: () => rolesApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useRoleLookup(enabled = true) {
  return useQuery({ queryKey: roleKeys.lookup, queryFn: rolesApi.lookup, enabled, staleTime: 5 * 60_000 });
}

export function useRole(id: number | undefined) {
  return useQuery({ queryKey: roleKeys.detail(id ?? 0), queryFn: () => rolesApi.get(id!), enabled: !!id });
}

export function usePermissionCatalog() {
  return useQuery({ queryKey: roleKeys.catalog, queryFn: rolesApi.catalog, staleTime: Infinity });
}

function useRoleMutation<TVariables, TResult>(fn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roleKeys.all });
      // Users show role names, so refresh them too.
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export const useCreateRole = () => useRoleMutation(rolesApi.create);
export const useUpdateRole = () =>
  useRoleMutation(({ id, request }: { id: number; request: SaveRoleRequest }) =>
    rolesApi.update(id, request),
  );
export const useUpdateRolePermissions = () =>
  useRoleMutation(({ id, permissions }: { id: number; permissions: string[] }) =>
    rolesApi.updatePermissions(id, permissions),
  );
export const useDeleteRole = () => useRoleMutation(rolesApi.remove);
