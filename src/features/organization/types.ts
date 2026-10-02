import type { MasterRecord } from '@/shared/master-data';

export interface Company extends MasterRecord {
  legalName: string | null;
  registrationNumber: string | null;
  taxNumber: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  countryId: number | null;
  countryName: string | null;
  cityId: number | null;
  cityName: string | null;
  branchCount: number;
  departmentCount: number;
}

export interface Branch extends MasterRecord {
  companyId: number;
  companyName: string;
  isHeadOffice: boolean;
  address: string | null;
  countryId: number | null;
  countryName: string | null;
  cityId: number | null;
  cityName: string | null;
  phone: string | null;
  email: string | null;
}

export interface Department extends MasterRecord {
  companyId: number;
  companyName: string;
  parentId: number | null;
  parentName: string | null;
  childCount: number;
  teamCount: number;
}

export interface DepartmentTreeNode {
  id: number;
  companyId: number;
  parentId: number | null;
  code: string;
  name: string;
  isActive: boolean;
  teamCount: number;
  children: DepartmentTreeNode[];
}

export interface Team extends MasterRecord {
  departmentId: number;
  departmentName: string;
  companyId: number;
}

export interface Designation extends MasterRecord {
  grade: string | null;
  level: number | null;
}
