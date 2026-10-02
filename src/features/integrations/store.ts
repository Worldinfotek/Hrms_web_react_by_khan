import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAttendanceStore } from '@/features/attendance/store';
import { createSeedClients, createSeedFailures, createSeedReadiness, createSeedWebhooks } from './seed';
import type { ApiClient, FailedCall, ReadinessNote, Webhook } from './types';

interface IntegrationStore {
  clients: ApiClient[];
  webhooks: Webhook[];
  failures: FailedCall[];
  readiness: ReadinessNote[];
  sendSamplePunch: () => void;
  restoreSamples: () => void;
}

export const useIntegrationStore = create<IntegrationStore>()(
  persist(
    (set) => ({
      clients: createSeedClients(),
      webhooks: createSeedWebhooks(),
      failures: createSeedFailures(),
      readiness: createSeedReadiness(),
      sendSamplePunch: () => {
        useAttendanceStore.getState().recordDevicePunch();
        set((state) => ({
          webhooks: state.webhooks.map((hook) =>
            hook.id === 'hook-punch' ? { ...hook, delivery: 'Delivered' } : hook,
          ),
        }));
      },
      restoreSamples: () => {
        useAttendanceStore.getState().removeDevicePunch();
        set({
          clients: createSeedClients(),
          webhooks: createSeedWebhooks(),
          failures: createSeedFailures(),
          readiness: createSeedReadiness(),
        });
      },
    }),
    { name: 'wit-hrms-ui-phase13-integrations' },
  ),
);
