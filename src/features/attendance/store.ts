import dayjs from 'dayjs';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createSeedCorrections,
  createSeedDays,
  createSeedHolidays,
  createSeedPolicy,
  createSeedShifts,
  SHIFT_GENERAL,
} from './seed';
import type { AttendanceDay, AttendancePolicy, AttendanceStatus, CorrectionRequest, Holiday, Shift } from './types';

interface AttendanceStore {
  shifts: Shift[];
  holidays: Holiday[];
  policy: AttendancePolicy;
  days: AttendanceDay[];
  corrections: CorrectionRequest[];
  saveShift: (shift: Shift) => void;
  setShiftActive: (id: string, isActive: boolean) => void;
  addHoliday: (holiday: Holiday) => void;
  removeHoliday: (id: string) => void;
  savePolicy: (policy: AttendancePolicy) => void;
  checkIn: (employeeCode: string, employeeName: string) => string | null;
  checkOut: (employeeCode: string) => string | null;
  requestCorrection: (input: Omit<CorrectionRequest, 'id' | 'decision' | 'comment'>) => string | null;
  decideCorrection: (id: string, approved: boolean, comment: string) => void;
  markLeave: (employeeCode: string, employeeName: string, dates: string[]) => void;
  recordDevicePunch: () => void;
  removeDevicePunch: () => void;
  restoreSamples: () => void;
}

export function todayKey() {
  return dayjs().format('YYYY-MM-DD');
}

export function isDateLocked(date: string) {
  return dayjs(date).isBefore(dayjs().startOf('month'), 'day');
}

export function statusForArrival(shift: Shift, time: dayjs.Dayjs): 'Present' | 'Late' {
  const [hour, minute] = shift.start.split(':').map(Number);
  const lateAt = time.startOf('day').hour(hour).minute(minute).add(shift.graceMinutes, 'minute');
  return time.isAfter(lateAt) ? 'Late' : 'Present';
}

export const useAttendanceStore = create<AttendanceStore>()(
  persist(
    (set, get) => ({
      shifts: createSeedShifts(),
      holidays: createSeedHolidays(),
      policy: createSeedPolicy(),
      days: createSeedDays(),
      corrections: createSeedCorrections(),
      saveShift: (shift) =>
        set((state) => ({
          shifts: state.shifts.some((item) => item.id === shift.id)
            ? state.shifts.map((item) => (item.id === shift.id ? shift : item))
            : [...state.shifts, shift],
        })),
      setShiftActive: (id, isActive) =>
        set((state) => ({
          shifts: state.shifts.map((shift) => (shift.id === id ? { ...shift, isActive } : shift)),
        })),
      addHoliday: (holiday) => set((state) => ({ holidays: [...state.holidays, holiday] })),
      removeHoliday: (id) => set((state) => ({ holidays: state.holidays.filter((holiday) => holiday.id !== id) })),
      savePolicy: (policy) => set({ policy }),
      checkIn: (employeeCode, employeeName) => {
        if (!get().policy.webCheckIn) return 'Web check-in is turned off in the attendance policy.';
        const date = todayKey();
        if (isDateLocked(date)) return 'This payroll period is locked and cannot be edited.';
        const existing = get().days.find((day) => day.employeeCode === employeeCode && day.date === date);
        if (existing?.checkIn) return 'Already checked in today.';
        const shift = get().shifts.find((item) => item.id === SHIFT_GENERAL) ?? get().shifts[0];
        const now = dayjs();
        const status = shift ? statusForArrival(shift, now) : 'Present';
        const checkIn = now.format('HH:mm');
        if (existing) {
          set((state) => ({
            days: state.days.map((day) =>
              day.id === existing.id ? { ...day, status, checkIn, employeeName } : day,
            ),
          }));
        } else {
          const created: AttendanceDay = {
            id: crypto.randomUUID(),
            employeeCode,
            employeeName,
            date,
            status,
            checkIn,
            checkOut: null,
            shiftId: shift?.id ?? SHIFT_GENERAL,
          };
          set((state) => ({ days: [created, ...state.days] }));
        }
        return null;
      },
      checkOut: (employeeCode) => {
        const date = todayKey();
        if (isDateLocked(date)) return 'This payroll period is locked and cannot be edited.';
        const existing = get().days.find((day) => day.employeeCode === employeeCode && day.date === date);
        if (!existing?.checkIn) return 'Check in before checking out.';
        if (existing.checkOut) return 'Already checked out today.';
        set((state) => ({
          days: state.days.map((day) =>
            day.id === existing.id ? { ...day, checkOut: dayjs().format('HH:mm') } : day,
          ),
        }));
        return null;
      },
      requestCorrection: (input) => {
        if (isDateLocked(input.date)) return 'This payroll period is locked and cannot be edited.';
        const request: CorrectionRequest = {
          ...input,
          id: crypto.randomUUID(),
          decision: 'Pending',
          comment: '',
        };
        set((state) => ({ corrections: [request, ...state.corrections] }));
        return null;
      },
      decideCorrection: (id, approved, comment) => {
        const request = get().corrections.find((item) => item.id === id);
        if (!request || request.decision !== 'Pending') return;
        if (approved && isDateLocked(request.date)) return;
        set((state) => ({
          corrections: state.corrections.map((item) =>
            item.id === id ? { ...item, decision: approved ? 'Approved' : 'Rejected', comment } : item,
          ),
          days: approved
            ? state.days.map((day) =>
                day.employeeCode === request.employeeCode && day.date === request.date
                  ? { ...day, status: request.toStatus as AttendanceStatus }
                  : day,
              )
            : state.days,
        }));
      },
      markLeave: (employeeCode, employeeName, dates) =>
        set((state) => {
          let days = state.days;
          for (const date of dates) {
            if (isDateLocked(date)) continue;
            const existing = days.find((day) => day.employeeCode === employeeCode && day.date === date);
            if (existing) {
              days = days.map((day) =>
                day.id === existing.id ? { ...day, status: 'Leave', checkIn: null, checkOut: null } : day,
              );
            } else {
              days = [
                {
                  id: crypto.randomUUID(),
                  employeeCode,
                  employeeName,
                  date,
                  status: 'Leave' as const,
                  checkIn: null,
                  checkOut: null,
                  shiftId: SHIFT_GENERAL,
                },
                ...days,
              ];
            }
          }
          return { days };
        }),
      recordDevicePunch: () => {
        const date = todayKey();
        const existing = get().days.find((day) => day.employeeCode === 'WIT-0008' && day.date === date);
        if (existing) {
          set((state) => ({
            days: state.days.map((day) =>
              day.id === existing.id
                ? { ...day, id: 'day-device-fatima', status: 'Present', checkIn: '08:57', employeeName: 'Fatima Noor' }
                : day,
            ),
          }));
          return;
        }
        const created: AttendanceDay = {
          id: 'day-device-fatima',
          employeeCode: 'WIT-0008',
          employeeName: 'Fatima Noor',
          date,
          status: 'Present',
          checkIn: '08:57',
          checkOut: null,
          shiftId: SHIFT_GENERAL,
        };
        set((state) => ({ days: [created, ...state.days] }));
      },
      removeDevicePunch: () => set((state) => ({ days: state.days.filter((day) => day.id !== 'day-device-fatima') })),
      restoreSamples: () =>
        set({
          shifts: createSeedShifts(),
          holidays: createSeedHolidays(),
          policy: createSeedPolicy(),
          days: createSeedDays(),
          corrections: createSeedCorrections(),
        }),
    }),
    { name: 'wit-hrms-ui-phase2-attendance' },
  ),
);
