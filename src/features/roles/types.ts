import type { DataScope } from '@/features/auth/types';

export interface RoleListItem {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  dataScope: DataScope;
  userCount: number;
  permissionCount: number;
  createdAt: string;
}

export interface RoleDetail {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  isSuperAdmin: boolean;
  dataScope: DataScope;
  userCount: number;
  permissions: string[];
  createdAt: string;
  updatedAt: string | null;
}

export interface RoleLookup {
  id: number;
  name: string;
  isSystem: boolean;
}

export interface SaveRoleRequest {
  name: string;
  description?: string | null;
  dataScope: DataScope;
  permissions?: string[];
}

export interface PermissionItem {
  code: string;
  action: string;
  description: string;
}

export interface PermissionGroup {
  module: string;
  displayName: string;
  permissions: PermissionItem[];
}

export const DATA_SCOPE_OPTIONS: { value: DataScope; label: string; description: string }[] = [
  { value: 'Own', label: 'Own', description: 'Only their own records' },
  { value: 'Team', label: 'Team', description: 'Own records and their team (direct & indirect reports)' },
  { value: 'Department', label: 'Department', description: 'Everyone in their department' },
  { value: 'Branch', label: 'Branch', description: 'Everyone in their branch / location' },
  { value: 'All', label: 'All', description: 'The whole company' },
];
