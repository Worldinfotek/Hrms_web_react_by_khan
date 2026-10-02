import type { PagedRequest } from '@/api/types';

export interface EmployeeListItem {
  id: number;
  employeeCode: string;
  fullName: string;
  workEmail: string | null;
  mobilePhone: string | null;
  designationId: number;
  designation: string;
  departmentId: number;
  department: string;
  branchId: number;
  branch: string;
  team: string | null;
  reportingManagerId: number | null;
  reportingManager: string | null;
  employeeStatusId: number;
  status: string;
  statusCode: string;
  statusColor: string;
  isActiveEmployment: boolean;
  employmentType: string;
  joiningDate: string;
  hasPhoto: boolean;
  hasLogin: boolean;
}

export interface Address {
  addressLine: string | null;
  cityId: number | null;
  countryId: number | null;
  postalCode: string | null;
  cityName?: string | null;
  countryName?: string | null;
}

export interface EmergencyContact {
  name: string;
  relationshipId: number | null;
  phone: string;
  alternatePhone: string | null;
  address: string | null;
  isPrimary: boolean;
  relationship?: string | null;
}

export type CustomFieldType = 'Text' | 'Number' | 'Date' | 'Boolean' | 'Select';

export interface CustomFieldValue {
  fieldId: number;
  value: string | null;
  code?: string | null;
  name?: string | null;
  fieldType?: CustomFieldType | null;
}

export interface EmployeeDetail {
  id: number;
  employeeCode: string;
  companyId: number;
  company: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;
  fatherName: string | null;
  genderId: number | null;
  gender: string | null;
  dateOfBirth: string | null;
  maritalStatusId: number | null;
  maritalStatus: string | null;
  bloodGroupId: number | null;
  bloodGroup: string | null;
  nationalityId: number | null;
  nationality: string | null;
  cnic: string | null;
  workEmail: string | null;
  personalEmail: string | null;
  mobilePhone: string | null;
  workPhone: string | null;
  hasPhoto: boolean;
  joiningDate: string;
  employmentTypeId: number;
  employmentType: string;
  branchId: number;
  branch: string;
  departmentId: number;
  department: string;
  teamId: number | null;
  team: string | null;
  designationId: number;
  designation: string;
  grade: string | null;
  reportingManagerId: number | null;
  reportingManager: string | null;
  reportingManagerCode: string | null;
  employeeStatusId: number;
  status: string;
  statusCode: string;
  statusColor: string;
  isActiveEmployment: boolean;
  probationEndDate: string | null;
  confirmationDate: string | null;
  exitDate: string | null;
  directReportCount: number;
  currentAddress: Address | null;
  permanentAddress: Address | null;
  emergencyContacts: EmergencyContact[];
  customFields: CustomFieldValue[];
  userId: number | null;
  userName: string | null;
  userIsActive: boolean | null;
  createdAt: string;
  updatedAt: string | null;
}

/** Body of POST /employees and PUT /employees/{id}. */
export interface EmployeeRequest {
  companyId?: number | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fatherName?: string | null;
  genderId?: number | null;
  dateOfBirth?: string | null;
  maritalStatusId?: number | null;
  bloodGroupId?: number | null;
  nationalityId?: number | null;
  cnic?: string | null;
  workEmail?: string | null;
  personalEmail?: string | null;
  mobilePhone?: string | null;
  workPhone?: string | null;
  currentAddress?: Address | null;
  permanentAddress?: Address | null;
  emergencyContacts?: EmergencyContact[];
  customFields?: { fieldId: number; value: string | null }[];
  joiningDate: string;
  employmentTypeId: number;
  probationEndDate?: string | null;
  branchId?: number;
  departmentId?: number;
  teamId?: number | null;
  designationId?: number;
  reportingManagerId?: number | null;
  employeeStatusId?: number | null;
}

export interface EmployeeListQuery extends PagedRequest {
  departmentId?: number;
  branchId?: number;
  designationId?: number;
  employeeStatusId?: number;
  employmentTypeId?: number;
  reportingManagerId?: number;
  includeSeparated?: boolean;
}

export interface EmployeeLookup {
  id: number;
  employeeCode: string;
  fullName: string;
  designation: string;
  department: string;
  hasPhoto: boolean;
}

export type EmploymentEventType =
  | 'Joined'
  | 'Transferred'
  | 'Promoted'
  | 'ManagerChanged'
  | 'StatusChanged'
  | 'Confirmed'
  | 'Exited'
  | 'SalaryRevised';

export interface TimelineEntry {
  id: number;
  eventType: EmploymentEventType;
  effectiveDate: string;
  summary: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  remarks: string | null;
  recordedAt: string;
  recordedBy: string | null;
}

export interface CountItem {
  name: string;
  count: number;
  color?: string | null;
}

export interface EmployeeSummary {
  activeEmployees: number;
  onProbation: number;
  probationEndingIn30Days: number;
  joinedThisMonth: number;
  leftThisMonth: number;
  byDepartment: CountItem[];
  byStatus: CountItem[];
  byEmploymentType: CountItem[];
}

export interface StatusOption {
  id: number;
  code: string;
  name: string;
  color: string;
  isActiveEmployment: boolean;
}

export type EmployeeActionKind = 'transfer' | 'promote' | 'change-manager' | 'change-status';

export interface ImportRowResult {
  rowNumber: number;
  name: string | null;
  employeeCode: string | null;
  isValid: boolean;
  errors: string[];
}

export interface ImportReport {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedRows: number;
  committed: boolean;
  rows: ImportRowResult[];
}

export interface CustomFieldDefinition {
  id: number;
  code: string;
  name: string;
  description: string | null;
  fieldType: CustomFieldType;
  isRequired: boolean;
  sortOrder: number;
  options: string[];
  valueCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}
