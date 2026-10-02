import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSeedComponents, createSeedRuns, createSeedStructures } from './seed';
import { RUN_FLOW, type PayComponent, type PayrollRun, type SalaryStructure } from './types';

interface PayrollStore {
  components: PayComponent[];
  structures: SalaryStructure[];
  runs: PayrollRun[];
  payrollAccess: boolean;
  grantAccess: () => void;
  saveComponent: (component: PayComponent) => void;
  saveStructure: (structure: SalaryStructure) => void;
  advance: (runId: string) => string | null;
  restoreSamples: () => void;
}

export const usePayrollStore = create<PayrollStore>()(
  persist(
    (set, get) => ({
      components: createSeedComponents(),
      structures: createSeedStructures(),
      runs: createSeedRuns(),
      payrollAccess: false,
      grantAccess: () => set({ payrollAccess: true }),
      saveComponent: (component) =>
        set((state) => ({
          components: state.components.some((item) => item.id === component.id)
            ? state.components.map((item) => (item.id === component.id ? component : item))
            : [...state.components, component],
        })),
      saveStructure: (structure) =>
        set((state) => ({
          structures: state.structures.some((item) => item.id === structure.id)
            ? state.structures.map((item) => (item.id === structure.id ? structure : item))
            : [...state.structures, structure],
        })),
      advance: (runId) => {
        const run = get().runs.find((item) => item.id === runId);
        if (!run) return 'That payroll run was not found.';
        if (run.id === 'run-last' || run.status === 'Payslips published') {
          return 'This payroll run is locked and cannot be edited.';
        }
        const next = RUN_FLOW[RUN_FLOW.indexOf(run.status) + 1];
        if (!next) return 'This payroll run is locked and cannot be edited.';
        set((state) => ({
          runs: state.runs.map((item) => (item.id === runId ? { ...item, status: next } : item)),
        }));
        return null;
      },
      restoreSamples: () =>
        set({
          components: createSeedComponents(),
          structures: createSeedStructures(),
          runs: createSeedRuns(),
          payrollAccess: false,
        }),
    }),
    { name: 'wit-hrms-ui-phase7-payroll' },
  ),
);
