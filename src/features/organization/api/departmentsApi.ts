import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/httpClient';
import type { DepartmentTreeNode } from '../types';

export const departmentTreeKey = (companyId?: number, includeInactive?: boolean) =>
  ['departments', 'tree', companyId ?? 'all', !!includeInactive] as const;

export function useDepartmentTree(companyId?: number, includeInactive = false) {
  return useQuery({
    queryKey: departmentTreeKey(companyId, includeInactive),
    queryFn: () =>
      api.get<DepartmentTreeNode[]>('/departments/tree', { params: { companyId, includeInactive } }),
  });
}

/** Nodes whose name/code match the search, plus their ancestors (so matches stay visible). */
export function filterTree(nodes: DepartmentTreeNode[], search: string): DepartmentTreeNode[] {
  const term = search.trim().toLowerCase();
  if (!term) return nodes;
  return nodes.flatMap((node) => {
    const children = filterTree(node.children, term);
    const matches = node.name.toLowerCase().includes(term) || node.code.toLowerCase().includes(term);
    return matches || children.length ? [{ ...node, children: matches ? node.children : children }] : [];
  });
}
