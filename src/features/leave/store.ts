import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAttendanceStore } from '@/features/attendance/store';
import { createSeedBalances, createSeedRequests, createSeedTypes } from './seed';
import type { LeaveAdjustment, LeaveBalance, LeaveRequest, LeaveType } from './types';
import { remaining } from './types';

interface LeaveStore {
  types: LeaveType[];
  balances: LeaveBalance[];
  adjustments: LeaveAdjustment[];
  requests: LeaveRequest[];
  saveType: (type: LeaveType) => void;
  apply: (input: Omit<LeaveRequest, 'id' | 'decision' | 'comment'>) => string | null;
  decide: (id: string, approved: boolean, comment: string) => void;
  adjust: (employeeCode: string, employeeName: string, leaveTypeId: string, amount: number, reason: string) => void;
  restoreSamples: () => void;
}

export function balanceOf(balances: LeaveBalance[], employeeCode: string, type: LeaveType): LeaveBalance {
  return (
    balances.find((item) => item.employeeCode === employeeCode && item.leaveTypeId === type.id) ?? {
      employeeCode,
      leaveTypeId: type.id,
      allocated: type.entitlement,
      taken: 0,
      adjustment: 0,
    }
  );
}

export const useLeaveStore = create<LeaveStore>()(
  persist(
    (set, get) => ({
      types: createSeedTypes(),
      balances: createSeedBalances(),
      adjustments: [],
      requests: createSeedRequests(),
      saveType: (type) =>
        set((state) => ({
          types: state.types.some((item) => item.id === type.id)
            ? state.types.map((item) => (item.id === type.id ? type : item))
            : [...state.types, type],
        })),
      apply: (input) => {
        const type = get().types.find((item) => item.id === input.leaveTypeId);
        if (!type) return 'Choose a leave type.';
        if (input.days <= 0) return 'That range has no working days.';
        const balance = balanceOf(get().balances, input.employeeCode, type);
        if (type.paid && remaining(balance) < input.days) return 'Not enough leave balance.';
        if (type.attachmentAfterDays && input.days > type.attachmentAfterDays && !input.attachmentName) {
          return `Attach a file when ${type.name} leave is more than ${type.attachmentAfterDays} days.`;
        }
        set((state) => ({ requests: [{ ...input, id: crypto.randomUUID(), decision: 'Pending', comment: '' }, ...state.requests] }));
        return null;
      },
      decide: (id, approved, comment) => {
        const request = get().requests.find((item) => item.id === id);
        if (!request || request.decision !== 'Pending') return;
        set((state) => ({
          requests: state.requests.map((item) =>
            item.id === id ? { ...item, decision: approved ? 'Approved' : 'Rejected', comment } : item,
          ),
          balances: approved
            ? upsertTaken(state.balances, request.employeeCode, request.leaveTypeId, request.days, get().types)
            : state.balances,
        }));
        if (approved) {
          useAttendanceStore.getState().markLeave(request.employeeCode, request.employeeName, request.dates);
        }
      },
      adjust: (employeeCode, employeeName, leaveTypeId, amount, reason) => {
        const type = get().types.find((item) => item.id === leaveTypeId);
        if (!type) return;
        const entry: LeaveAdjustment = {
          id: crypto.randomUUID(),
          employeeCode,
          employeeName,
          leaveTypeId,
          amount,
          reason,
        };
        set((state) => ({
          balances: upsertAdjustment(state.balances, employeeCode, type, amount),
          adjustments: [entry, ...state.adjustments],
        }));
      },
      restoreSamples: () =>
        set({ types: createSeedTypes(), balances: createSeedBalances(), adjustments: [], requests: createSeedRequests() }),
    }),
    { name: 'wit-hrms-ui-phase3-leave' },
  ),
);

function upsertTaken(balances: LeaveBalance[], employeeCode: string, leaveTypeId: string, days: number, types: LeaveType[]) {
  const type = types.find((item) => item.id === leaveTypeId);
  const current = type ? balanceOf(balances, employeeCode, type) : undefined;
  if (!current) return balances;
  const next = { ...current, taken: current.taken + days };
  const exists = balances.some((item) => item.employeeCode === employeeCode && item.leaveTypeId === leaveTypeId);
  return exists
    ? balances.map((item) => (item.employeeCode === employeeCode && item.leaveTypeId === leaveTypeId ? next : item))
    : [...balances, next];
}

function upsertAdjustment(balances: LeaveBalance[], employeeCode: string, type: LeaveType, amount: number) {
  const current = balanceOf(balances, employeeCode, type);
  const next = { ...current, adjustment: current.adjustment + amount };
  const exists = balances.some((item) => item.employeeCode === employeeCode && item.leaveTypeId === type.id);
  return exists
    ? balances.map((item) => (item.employeeCode === employeeCode && item.leaveTypeId === type.id ? next : item))
    : [...balances, next];
}
