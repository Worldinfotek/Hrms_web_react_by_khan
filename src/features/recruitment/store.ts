import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSeedCandidates, createSeedVacancies } from './seed';
import type { Candidate, Interview, Offer, PipelineStage, Vacancy } from './types';

interface RecruitmentStore {
  vacancies: Vacancy[];
  candidates: Candidate[];
  saveVacancy: (vacancy: Vacancy) => void;
  moveCandidate: (id: string, stage: PipelineStage) => void;
  saveInterview: (candidateId: string, interview: Interview) => void;
  saveOffer: (candidateId: string, offer: Offer) => void;
  markConverted: (candidateId: string) => void;
  restoreSamples: () => void;
}

export const useRecruitmentStore = create<RecruitmentStore>()(
  persist(
    (set) => ({
      vacancies: createSeedVacancies(),
      candidates: createSeedCandidates(),
      saveVacancy: (vacancy) =>
        set((state) => ({
          vacancies: state.vacancies.some((item) => item.id === vacancy.id)
            ? state.vacancies.map((item) => (item.id === vacancy.id ? vacancy : item))
            : [vacancy, ...state.vacancies],
        })),
      moveCandidate: (id, stage) =>
        set((state) => ({
          candidates: state.candidates.map((item) => (item.id === id ? { ...item, stage } : item)),
        })),
      saveInterview: (candidateId, interview) =>
        set((state) => ({
          candidates: state.candidates.map((item) => {
            if (item.id !== candidateId) return item;
            const exists = item.interviews.some((row) => row.id === interview.id);
            return {
              ...item,
              interviews: exists
                ? item.interviews.map((row) => (row.id === interview.id ? interview : row))
                : [interview, ...item.interviews],
            };
          }),
        })),
      saveOffer: (candidateId, offer) =>
        set((state) => ({
          candidates: state.candidates.map((item) => (item.id === candidateId ? { ...item, offer } : item)),
        })),
      markConverted: (candidateId) =>
        set((state) => ({
          candidates: state.candidates.map((item) => (item.id === candidateId ? { ...item, converted: true } : item)),
        })),
      restoreSamples: () => set({ vacancies: createSeedVacancies(), candidates: createSeedCandidates() }),
    }),
    { name: 'wit-hrms-ui-phase4-recruitment' },
  ),
);
