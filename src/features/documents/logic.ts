import dayjs from 'dayjs';
import type { DocumentType, EmployeeDocument, EmployeeRef } from './types';

export interface MissingDocumentRow {
  key: string;
  employeeId: number;
  employeeCode: string;
  fullName: string;
  department: string;
  documentType: string;
  category: string;
}

export interface ExpiringDocumentRow {
  key: string;
  employeeCode: string;
  documentType: string;
  documentNumber: string;
  expiryDate: string;
  daysLeft: number;
  sensitive: boolean;
}

export function latestVersion(document: EmployeeDocument) {
  return document.versions[0];
}

export function missingDocuments(
  employees: EmployeeRef[],
  types: DocumentType[],
  documents: EmployeeDocument[],
): MissingDocumentRow[] {
  const required = types.filter((type) => type.isActive && type.mandatory);
  return employees.flatMap((employee) =>
    required
      .filter(
        (type) =>
          !documents.some(
            (document) =>
              document.employeeCode === employee.employeeCode && document.documentTypeId === type.id,
          ),
      )
      .map((type) => ({
        key: `${employee.employeeCode}-${type.id}`,
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        department: employee.department,
        documentType: type.name,
        category: type.category,
      })),
  );
}

export function expiringDocuments(
  documents: EmployeeDocument[],
  types: DocumentType[],
  withinDays = 30,
  today = dayjs().startOf('day'),
): ExpiringDocumentRow[] {
  const typeById = new Map(types.map((type) => [type.id, type]));
  return documents
    .filter((document) => document.expiryDate)
    .map((document) => {
      const type = typeById.get(document.documentTypeId);
      const expiry = dayjs(document.expiryDate);
      return {
        key: document.id,
        employeeCode: document.employeeCode,
        documentType: type?.name ?? 'Document',
        documentNumber: document.documentNumber,
        expiryDate: document.expiryDate!,
        daysLeft: expiry.startOf('day').diff(today, 'day'),
        sensitive: type?.sensitive ?? false,
      };
    })
    .filter((row) => row.daysLeft <= withinDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}
