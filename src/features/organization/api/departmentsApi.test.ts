import type { DepartmentTreeNode } from '../types';
import { filterTree } from './departmentsApi';

const node = (
  id: number,
  name: string,
  children: DepartmentTreeNode[] = [],
  parentId: number | null = null,
): DepartmentTreeNode => ({
  id,
  companyId: 1,
  parentId,
  code: name.slice(0, 3).toUpperCase(),
  name,
  isActive: true,
  teamCount: 0,
  children,
});

const tree = [
  node(1, 'Management', [
    node(2, 'Technology', [node(3, 'Development', [], 2), node(4, 'Quality Assurance', [], 2)], 1),
    node(5, 'Human Resources', [], 1),
  ]),
];

describe('department tree helpers', () => {
  it('keeps ancestors of matches when searching', () => {
    const result = filterTree(tree, 'quality');
    expect(result[0].name).toBe('Management');
    expect(result[0].children.map((c) => c.name)).toEqual(['Technology']);
    expect(result[0].children[0].children.map((c) => c.name)).toEqual(['Quality Assurance']);
  });

  it('returns everything for an empty search and nothing for no match', () => {
    expect(filterTree(tree, '  ')).toBe(tree);
    expect(filterTree(tree, 'zzz')).toEqual([]);
  });
});
