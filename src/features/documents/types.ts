/** Sample document model for the Phase 1 UI. Stored in the browser, not on the server. */

export interface DocumentType {
  id: string;
  category: string;
  name: string;
  mandatory: boolean;
  expiryRequired: boolean;
  sensitive: boolean;
  isActive: boolean;
}

export interface DocumentVersion {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  /** data URL so preview works without a server. */
  dataUrl: string;
  remarks: string;
}

export interface EmployeeDocument {
  id: string;
  employeeCode: string;
  documentTypeId: string;
  documentNumber: string;
  issueDate: string | null;
  expiryDate: string | null;
  versions: DocumentVersion[];
}

export interface EmployeeRef {
  id: number;
  employeeCode: string;
  fullName: string;
  department: string;
}
