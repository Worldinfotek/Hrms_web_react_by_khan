import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSeedAnnouncements, createSeedHrRequests } from './seed';
import type { Announcement, HrRequest, HrRequestKind, ProfileChange } from './types';

interface EssStore {
  viewAsEmployee: boolean;
  announcements: Announcement[];
  changes: ProfileChange[];
  requests: HrRequest[];
  setViewAsEmployee: (value: boolean) => void;
  requestChange: (field: string, value: string, reason: string) => void;
  sendRequest: (kind: HrRequestKind, detail: string) => void;
  decideRequest: (id: string, approved: boolean) => void;
  restoreSamples: () => void;
}

export const useEssStore = create<EssStore>()(
  persist(
    (set) => ({
      viewAsEmployee: false,
      announcements: createSeedAnnouncements(),
      changes: [],
      requests: createSeedHrRequests(),
      setViewAsEmployee: (viewAsEmployee) => set({ viewAsEmployee }),
      requestChange: (field, value, reason) =>
        set((state) => ({
          changes: [{ id: crypto.randomUUID(), field, value, reason, status: 'Pending' }, ...state.changes],
        })),
      sendRequest: (kind, detail) =>
        set((state) => ({
          requests: [{ id: crypto.randomUUID(), kind, detail, status: 'Pending' }, ...state.requests],
        })),
      decideRequest: (id, approved) =>
        set((state) => ({
          requests: state.requests.map((item) =>
            item.id === id ? { ...item, status: approved ? 'Approved' : 'Rejected' } : item,
          ),
        })),
      restoreSamples: () =>
        set({
          viewAsEmployee: false,
          announcements: createSeedAnnouncements(),
          changes: [],
          requests: createSeedHrRequests(),
        }),
    }),
    { name: 'wit-hrms-ui-phase8-ess' },
  ),
);
