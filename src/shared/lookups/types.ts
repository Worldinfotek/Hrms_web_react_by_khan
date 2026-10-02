/** One dropdown option returned by GET /lookups (mirrors LookupItemDto). */
export interface LookupItem {
  id: number;
  code: string;
  name: string;
  /** Hierarchy parent: parent department, department of a team, company of a branch, country of a city. */
  parentId?: number | null;
  companyId?: number | null;
  color?: string | null;
}

export interface LookupCatalogItem {
  key: string;
  name: string;
  source: 'organization' | 'lookup';
  parentKey: string | null;
}

/** Built-in list keys; lookup types are requested by their camelCase code (gender, maritalStatus, city …). */
export type BuiltInLookupKey =
  | 'companies'
  | 'branches'
  | 'departments'
  | 'teams'
  | 'designations'
  | 'employmentTypes'
  | 'employeeStatuses';
