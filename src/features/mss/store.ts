import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ManagerStore {
  viewAsManager: boolean;
  setViewAsManager: (value: boolean) => void;
}

export const useManagerStore = create<ManagerStore>()(
  persist(
    (set) => ({
      viewAsManager: false,
      setViewAsManager: (viewAsManager) => set({ viewAsManager }),
    }),
    { name: 'wit-hrms-ui-phase9-mss' },
  ),
);
