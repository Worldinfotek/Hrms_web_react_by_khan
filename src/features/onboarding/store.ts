import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSeedJoiners, createSeedTemplates } from './seed';
import type { Joiner, OnboardingTemplate } from './types';

interface OnboardingStore {
  templates: OnboardingTemplate[];
  joiners: Joiner[];
  saveTemplate: (template: OnboardingTemplate) => void;
  completeTask: (joinerId: string, taskId: string) => void;
  acknowledgePolicy: (joinerId: string) => void;
  toggleOrientation: (joinerId: string, itemId: string) => void;
  markDocument: (joinerId: string, name: string) => void;
  restoreSamples: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      templates: createSeedTemplates(),
      joiners: createSeedJoiners(),
      saveTemplate: (template) =>
        set((state) => ({
          templates: state.templates.some((item) => item.id === template.id)
            ? state.templates.map((item) => (item.id === template.id ? template : item))
            : [template, ...state.templates],
        })),
      completeTask: (joinerId, taskId) =>
        set((state) => ({
          joiners: state.joiners.map((joiner) =>
            joiner.id === joinerId
              ? { ...joiner, tasks: joiner.tasks.map((task) => (task.id === taskId ? { ...task, done: true } : task)) }
              : joiner,
          ),
        })),
      acknowledgePolicy: (joinerId) =>
        set((state) => ({
          joiners: state.joiners.map((joiner) =>
            joiner.id === joinerId
              ? {
                  ...joiner,
                  policyAcknowledged: true,
                  tasks: joiner.tasks.map((task) => (task.id.includes('task-policy') ? { ...task, done: true } : task)),
                }
              : joiner,
          ),
        })),
      toggleOrientation: (joinerId, itemId) =>
        set((state) => ({
          joiners: state.joiners.map((joiner) =>
            joiner.id === joinerId
              ? {
                  ...joiner,
                  orientation: joiner.orientation.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
                }
              : joiner,
          ),
        })),
      markDocument: (joinerId, name) =>
        set((state) => ({
          joiners: state.joiners.map((joiner) =>
            joiner.id === joinerId
              ? {
                  ...joiner,
                  documents: joiner.documents.map((doc) => (doc.name === name ? { ...doc, received: true } : doc)),
                }
              : joiner,
          ),
        })),
      restoreSamples: () => set({ templates: createSeedTemplates(), joiners: createSeedJoiners() }),
    }),
    { name: 'wit-hrms-ui-phase5-onboarding' },
  ),
);
