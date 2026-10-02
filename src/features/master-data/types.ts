import type { MasterRecord } from '@/shared/master-data';

export interface EmploymentType extends MasterRecord {
  defaultProbationMonths: number | null;
  isSystem: boolean;
}

export interface EmployeeStatus extends MasterRecord {
  isActiveEmployment: boolean;
  color: string;
  sortOrder: number;
  isSystem: boolean;
}

export interface LookupType extends MasterRecord {
  isSystem: boolean;
  parentTypeId: number | null;
  parentTypeName: string | null;
  valueCount: number;
}

export interface LookupValue extends MasterRecord {
  lookupTypeId: number;
  lookupTypeCode: string;
  parentId: number | null;
  parentName: string | null;
  sortOrder: number;
}
