import { useAttendanceStore } from '@/features/attendance/store';
import { useDocumentStore } from '@/features/documents/store';
import { useEssStore } from '@/features/ess/store';
import { useIntegrationStore } from '@/features/integrations/store';
import { useLeaveStore } from '@/features/leave/store';
import { useNotificationStore } from '@/features/notifications/store';
import { useOffboardingStore } from '@/features/offboarding/store';
import { useOnboardingStore } from '@/features/onboarding/store';
import { usePayrollStore } from '@/features/payroll/store';
import { useProbationStore } from '@/features/probation/store';
import { useRecruitmentStore } from '@/features/recruitment/store';

/** Puts every sample module back to its seed. Does not change the signed-in user. */
export function restoreAllSamples() {
  useDocumentStore.getState().restoreSamples();
  useAttendanceStore.getState().restoreSamples();
  useLeaveStore.getState().restoreSamples();
  useRecruitmentStore.getState().restoreSamples();
  useOnboardingStore.getState().restoreSamples();
  useProbationStore.getState().restoreSamples();
  usePayrollStore.getState().restoreSamples();
  useEssStore.getState().restoreSamples();
  useNotificationStore.getState().restoreSamples();
  useOffboardingStore.getState().restoreSamples();
  useIntegrationStore.getState().restoreSamples();
}
