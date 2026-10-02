import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSeedDocuments, createSeedTypes } from './seed';
import type { DocumentType, DocumentVersion, EmployeeDocument } from './types';

const MAX_FILE_BYTES = 2 * 1024 * 1024;

interface UploadInput {
  employeeCode: string;
  documentTypeId: string;
  documentNumber: string;
  issueDate: string | null;
  expiryDate: string | null;
  version: Omit<DocumentVersion, 'id'>;
}

interface DocumentStore {
  types: DocumentType[];
  documents: EmployeeDocument[];
  saveType: (type: DocumentType) => void;
  setTypeActive: (id: string, isActive: boolean) => void;
  upload: (input: UploadInput) => 'created' | 'versioned';
  removeDocument: (id: string) => void;
  restoreSamples: () => void;
}

export const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
export const MAX_UPLOAD_BYTES = MAX_FILE_BYTES;

export function validateUploadFile(file: File): string | null {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) return 'Choose a PDF, PNG, JPG or WEBP file.';
  if (file.size > MAX_FILE_BYTES) return 'The file must be 2 MB or smaller.';
  return null;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      types: createSeedTypes(),
      documents: createSeedDocuments(),
      saveType: (type) =>
        set((state) => {
          const exists = state.types.some((item) => item.id === type.id);
          return {
            types: exists
              ? state.types.map((item) => (item.id === type.id ? type : item))
              : [...state.types, type],
          };
        }),
      setTypeActive: (id, isActive) =>
        set((state) => ({
          types: state.types.map((type) => (type.id === id ? { ...type, isActive } : type)),
        })),
      upload: (input) => {
        const version: DocumentVersion = { ...input.version, id: crypto.randomUUID() };
        const existing = get().documents.find(
          (document) =>
            document.employeeCode === input.employeeCode && document.documentTypeId === input.documentTypeId,
        );
        if (existing) {
          set((state) => ({
            documents: state.documents.map((document) =>
              document.id === existing.id
                ? {
                    ...document,
                    documentNumber: input.documentNumber,
                    issueDate: input.issueDate,
                    expiryDate: input.expiryDate,
                    versions: [version, ...document.versions],
                  }
                : document,
            ),
          }));
          return 'versioned';
        }
        const created: EmployeeDocument = {
          id: crypto.randomUUID(),
          employeeCode: input.employeeCode,
          documentTypeId: input.documentTypeId,
          documentNumber: input.documentNumber,
          issueDate: input.issueDate,
          expiryDate: input.expiryDate,
          versions: [version],
        };
        set((state) => ({ documents: [created, ...state.documents] }));
        return 'created';
      },
      removeDocument: (id) =>
        set((state) => ({ documents: state.documents.filter((document) => document.id !== id) })),
      restoreSamples: () => set({ types: createSeedTypes(), documents: createSeedDocuments() }),
    }),
    { name: 'wit-hrms-ui-phase1-documents' },
  ),
);
