import type { ReactNode } from 'react';
import type { TableColumnType } from 'antd';
import type { CrudPermissions } from '@/shared/auth/permissions';

/** Fields every master-data DTO has. */
export interface MasterRecord {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  isSystem?: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export type MasterFieldType =
  'text' | 'textarea' | 'number' | 'switch' | 'select' | 'lookup' | 'color' | 'tags';

export interface MasterField<T> {
  name: string;
  label: string;
  type?: MasterFieldType;
  required?: boolean;
  max?: number;
  min?: number;
  maxValue?: number;
  placeholder?: string;
  tooltip?: string;
  /** Half width (two fields per row) instead of full width. */
  half?: boolean;
  /** Static options for type 'select'. */
  options?: { value: string | number; label: ReactNode }[];
  /** List key for type 'lookup' (GET /lookups). */
  lookupKey?: string;
  /** Cascading lookup: only show items whose parentId equals this form field's value. */
  dependsOn?: string;
  /** Only editable when creating (e.g. the company of a branch). */
  createOnly?: boolean;
  /** Disabled for system records (e.g. the code of a system status). */
  lockedForSystem?: boolean;
  /** Custom disabled rule. */
  disabled?: (record: T | undefined) => boolean;
  /** Extra antd rules, e.g. email/url. */
  rules?: { type?: 'email' | 'url'; pattern?: RegExp; message?: string }[];
  /** Default value when creating. */
  defaultValue?: unknown;
  /** Show the field only when this returns true (receives the current form values). */
  visible?: (values: Record<string, unknown>) => boolean;
}

export interface MasterFilter {
  name: string;
  placeholder: string;
  lookupKey?: string;
  options?: { value: string | number; label: string }[];
  width?: number;
}

export interface MasterUrls {
  /** Paged list URL (GET) */
  list: string;
  /** Create URL (POST) */
  create: string;
  /** Single record base URL: GET/PUT/DELETE {item}/{id}, PATCH {item}/{id}/status */
  item: string;
}

export interface MasterConfig<T extends MasterRecord> {
  /** React Query key root, e.g. "departments". */
  queryKey: string;
  urls: MasterUrls;
  /** Singular readable label, e.g. "Department". */
  label: string;
  permissions: CrudPermissions;
  /** Columns shown between Code/Name and Status. */
  columns?: TableColumnType<T>[];
  /** Replaces the default Name column cell. */
  renderName?: (record: T) => ReactNode;
  fields: MasterField<T>[];
  filters?: MasterFilter[];
  defaultSort?: { sortBy: string; sortOrder: 'asc' | 'desc' };
  searchPlaceholder?: string;
  /** Maps a record to form values (defaults to the record itself). */
  toFormValues?: (record: T) => Record<string, unknown>;
  /** Width of the form drawer. */
  drawerWidth?: number;
  /** System records cannot be deactivated (e.g. system statuses). */
  systemCannotDeactivate?: boolean;
}

/** Tag colours an employee status may use (must match EmployeeStatus.AllowedColors on the server). */
export const TAG_COLORS = [
  'default',
  'blue',
  'cyan',
  'green',
  'gold',
  'orange',
  'red',
  'purple',
  'magenta',
  'geekblue',
  'volcano',
  'lime',
];
