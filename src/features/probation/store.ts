import dayjs from 'dayjs';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { samplePdf } from '@/features/documents/sampleFiles';
import { createSeedCases } from './seed';
import type { Evaluation, ProbationOutcome } from './types';

interface ProbationStore {
  cases: ReturnType<typeof createSeedCases>;
  saveEvaluation: (employeeCode: string, evaluation: Evaluation) => void;
  applyDecision: (employeeCode: string, outcome: Exclude<ProbationOutcome, 'Awaiting'>, extendDays: number, comment: string) => void;
  setLetter: (employeeCode: string, fileName: string, dataUrl: string) => void;
  generateLetter: (employeeCode: string) => void;
  restoreSamples: () => void;
}

export const useProbationStore = create<ProbationStore>()(
  persist(
    (set) => ({
      cases: createSeedCases(),
      saveEvaluation: (employeeCode, evaluation) =>
        set((state) => ({
          cases: state.cases.map((item) => (item.employeeCode === employeeCode ? { ...item, evaluation } : item)),
        })),
      applyDecision: (employeeCode, outcome, extendDays, comment) =>
        set((state) => ({
          cases: state.cases.map((item) => {
            if (item.employeeCode !== employeeCode) return item;
            const today = dayjs().format('YYYY-MM-DD');
            if (outcome === 'Confirmed') {
              return { ...item, outcome, confirmationDate: today, extendedEnd: null, decisionComment: comment };
            }
            if (outcome === 'Extended') {
              const base = item.extendedEnd ?? item.probationEnd;
              return {
                ...item,
                outcome,
                confirmationDate: null,
                extendedEnd: dayjs(base).add(extendDays, 'day').format('YYYY-MM-DD'),
                decisionComment: comment,
              };
            }
            return { ...item, outcome, confirmationDate: null, decisionComment: comment };
          }),
        })),
      setLetter: (employeeCode, fileName, dataUrl) =>
        set((state) => ({
          cases: state.cases.map((item) =>
            item.employeeCode === employeeCode ? { ...item, letterFileName: fileName, letterDataUrl: dataUrl } : item,
          ),
        })),
      generateLetter: (employeeCode) =>
        set((state) => ({
          cases: state.cases.map((item) =>
            item.employeeCode === employeeCode
              ? {
                  ...item,
                  letterFileName: `${item.employeeName.replace(/\s+/g, '-')}-confirmation.pdf`,
                  letterDataUrl: samplePdf(`Confirmation letter - ${item.employeeName}`),
                }
              : item,
          ),
        })),
      restoreSamples: () => set({ cases: createSeedCases() }),
    }),
    { name: 'wit-hrms-ui-phase6-probation' },
  ),
);
