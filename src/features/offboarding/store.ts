import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { samplePdf } from '@/features/documents/sampleFiles';
import { createSeedCases, defaultSettlement } from './seed';
import { clearanceComplete, type ExitCase, type ExitKind } from './types';

interface NewExit {
  employeeCode: string;
  employeeName: string;
  department: string;
  kind: ExitKind;
  reason: string;
  lastWorkingDay: string;
}

interface OffboardingStore {
  cases: ExitCase[];
  approve: (id: string, who: 'manager' | 'hr') => void;
  signOff: (id: string, area: string) => void;
  saveInterview: (id: string, notes: string) => void;
  generateLetter: (id: string) => void;
  startExit: (input: NewExit) => string | null;
  restoreSamples: () => void;
}

function withSettlement(item: ExitCase): ExitCase {
  if (!clearanceComplete(item) || item.settlement) return item;
  return { ...item, settlement: defaultSettlement() };
}

export const useOffboardingStore = create<OffboardingStore>()(
  persist(
    (set, get) => ({
      cases: createSeedCases(),
      approve: (id, who) =>
        set((state) => ({
          cases: state.cases.map((item) =>
            item.id === id ? { ...item, managerApproved: who === 'manager' ? true : item.managerApproved, hrApproved: who === 'hr' ? true : item.hrApproved } : item,
          ),
        })),
      signOff: (id, area) =>
        set((state) => ({
          cases: state.cases.map((item) => {
            if (item.id !== id) return item;
            const next = {
              ...item,
              clearance: item.clearance.map((row) => (row.area === area ? { ...row, status: 'Signed off' as const } : row)),
            };
            return withSettlement(next);
          }),
        })),
      saveInterview: (id, notes) =>
        set((state) => ({
          cases: state.cases.map((item) => (item.id === id ? { ...item, interviewDone: true, interviewNotes: notes } : item)),
        })),
      generateLetter: (id) =>
        set((state) => ({
          cases: state.cases.map((item) =>
            item.id === id
              ? {
                  ...item,
                  letterFileName: `${item.employeeName.replace(/\s+/g, '-')}-relieving.pdf`,
                  letterDataUrl: samplePdf(`Relieving letter - ${item.employeeName}`),
                }
              : item,
          ),
        })),
      startExit: (input) => {
        if (get().cases.some((item) => item.employeeCode === input.employeeCode)) {
          return 'This person already has an exit in the sample.';
        }
        const created: ExitCase = {
          id: `exit-${input.employeeCode}`,
          employeeCode: input.employeeCode,
          employeeName: input.employeeName,
          department: input.department,
          kind: input.kind,
          reason: input.reason,
          lastWorkingDay: input.lastWorkingDay,
          noticeDays: 30,
          managerApproved: false,
          hrApproved: false,
          clearance: [
            { area: 'Department', owner: 'Manager', status: 'Open' },
            { area: 'HR', owner: 'Ayesha Malik', status: 'Open' },
            { area: 'IT', owner: 'IT', status: 'Open' },
            { area: 'Finance', owner: 'Bilal Ahmed', status: 'Open' },
            { area: 'Asset return', owner: 'Admin', status: 'Open' },
          ],
          interviewDone: false,
          interviewNotes: '',
          settlement: null,
          letterFileName: null,
          letterDataUrl: null,
        };
        set((state) => ({ cases: [created, ...state.cases] }));
        return null;
      },
      restoreSamples: () => set({ cases: createSeedCases() }),
    }),
    { name: 'wit-hrms-ui-phase11-offboarding' },
  ),
);
