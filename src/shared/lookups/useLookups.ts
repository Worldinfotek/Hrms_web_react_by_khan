import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/httpClient';
import type { LookupCatalogItem, LookupItem } from './types';

export const lookupKeys = {
  all: ['lookups'] as const,
  lists: (types: string[]) => ['lookups', [...types].sort().join(',')] as const,
  catalog: ['lookups', 'catalog'] as const,
};

/**
 * Loads several dropdown lists in one request, e.g. useLookups(['departments', 'designations', 'gender']).
 * Results are cached for 5 minutes and refreshed automatically after master data changes.
 */
export function useLookups(types: string[], enabled = true) {
  const unique = [...new Set(types)];
  return useQuery({
    queryKey: lookupKeys.lists(unique),
    queryFn: () => api.get<Record<string, LookupItem[]>>('/lookups', { params: { types: unique.join(',') } }),
    enabled: enabled && unique.length > 0,
    staleTime: 5 * 60_000,
  });
}

export function useLookupCatalog() {
  return useQuery({
    queryKey: lookupKeys.catalog,
    queryFn: () => api.get<LookupCatalogItem[]>('/lookups/catalog'),
    staleTime: 5 * 60_000,
  });
}

/** Converts lookup items to Select options, optionally only children of a parent (cascading dropdowns). */
export function toOptions(items: LookupItem[] | undefined, parentId?: number | null) {
  return (items ?? [])
    .filter((item) => parentId === undefined || parentId === null || item.parentId === parentId)
    .map((item) => ({ value: item.id, label: item.name }));
}
