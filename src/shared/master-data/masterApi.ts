import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/httpClient';
import type { PagedRequest } from '@/api/types';
import { lookupKeys } from '@/shared/lookups/useLookups';
import type { MasterUrls } from './types';

export type MasterListQuery = PagedRequest & Record<string, string | number | boolean | undefined>;

/**
 * React Query hooks for one master-data resource. Every change also refreshes the
 * dropdown cache (/lookups) so forms elsewhere see the new values immediately.
 */
export function useMasterList<T>(queryKey: string, urls: MasterUrls, query: MasterListQuery, enabled = true) {
  return useQuery({
    queryKey: [queryKey, 'list', urls.list, query],
    queryFn: () => api.getPaged<T>(urls.list, query),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useMasterItem<T>(queryKey: string, urls: MasterUrls, id: number | undefined) {
  return useQuery({
    queryKey: [queryKey, 'detail', id],
    queryFn: () => api.get<T>(`${urls.item}/${id}`),
    enabled: !!id,
  });
}

export function useMasterMutations<T, TSave = unknown>(
  queryKey: string,
  urls: MasterUrls,
  related: string[] = [],
) {
  const queryClient = useQueryClient();
  const onSuccess = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [queryKey] }),
      queryClient.invalidateQueries({ queryKey: lookupKeys.all }),
      ...related.map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
    ]);
  };

  return {
    create: useMutation({ mutationFn: (body: TSave) => api.post<T>(urls.create, body), onSuccess }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: TSave }) => api.put<T>(`${urls.item}/${id}`, body),
      onSuccess,
    }),
    changeStatus: useMutation({
      mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
        api.patch<T>(`${urls.item}/${id}/status`, { isActive }),
      onSuccess,
    }),
    remove: useMutation({ mutationFn: (id: number) => api.delete(`${urls.item}/${id}`), onSuccess }),
  };
}
