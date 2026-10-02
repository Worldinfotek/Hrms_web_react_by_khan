import { act, renderHook } from '@testing-library/react';
import { DEFAULT_PAGE_SIZE, useTableQuery } from './useTableQuery';

describe('useTableQuery', () => {
  it('starts on page 1 with the default page size', () => {
    const { result } = renderHook(() => useTableQuery());
    expect(result.current.query).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  });

  it('keeps other values when only the page changes', () => {
    const { result } = renderHook(() => useTableQuery({ search: 'ali' }));
    act(() => result.current.updateQuery({ page: 3 }));
    expect(result.current.query).toMatchObject({ page: 3, search: 'ali' });
  });

  it('returns to page 1 when search or sorting changes', () => {
    const { result } = renderHook(() => useTableQuery());
    act(() => result.current.updateQuery({ page: 4 }));
    act(() => result.current.updateQuery({ search: 'zain' }));
    expect(result.current.query.page).toBe(1);
  });
});
