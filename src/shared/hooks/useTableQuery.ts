import { useCallback, useState } from 'react';
import type { PagedRequest } from '@/api/types';

export type TableQueryState = PagedRequest;

export const DEFAULT_PAGE_SIZE = 20;

/**
 * Holds paging/sorting/search state for a list page. The returned `query`
 * object is used directly as the React Query key and as API query parameters.
 */
export function useTableQuery(initial?: Partial<TableQueryState>) {
  const [query, setQuery] = useState<TableQueryState>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    ...initial,
  });

  const updateQuery = useCallback((patch: Partial<TableQueryState>) => {
    setQuery((current) => {
      const next = { ...current, ...patch };
      // Any change other than the page itself starts again from page 1.
      const onlyPageChanged = Object.keys(patch).every((key) => key === 'page');
      return onlyPageChanged ? next : { ...next, page: patch.page ?? 1 };
    });
  }, []);

  const resetQuery = useCallback(
    () => setQuery({ page: 1, pageSize: DEFAULT_PAGE_SIZE, ...initial }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { query, updateQuery, resetQuery };
}
