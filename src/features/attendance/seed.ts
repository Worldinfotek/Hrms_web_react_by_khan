import dayjs from 'dayjs';
import type { AttendanceDay, AttendancePolicy, CorrectionRequest, Holiday, Shift } from './types';

export const SHIFT_GENERAL = 'shift-general';
export const SHIFT_MORNING = 'shift-morning';

export function createSeedShifts(): Shift[] {
  return [
    {
      id: SHIFT_GENERAL,
      name: 'General',
      start: '09:00',
      end: '18:00',
      breakMinutes: 60,
      graceMinutes: 15,
      lateAfterMinutes: 15,
      earlyLeaveMinutes: 15,
      halfDayHours: 4,
      weeklyOff: ['Saturday', 'Sunday'],
      isActive: true,
    },
    {
      id: SHIFT_MORNING,
      name: 'Morning',
      start: '08:00',
      end: '17:00',
      breakMinutes: 60,
      graceMinutes: 10,
      lateAfterMinutes: 10,
      earlyLeaveMinutes: 15,
      halfDayHours: 4,
      weeklyOff: ['Sunday'],
      isActive: true,
    },
  ];
}

export function createSeedPolicy(): AttendancePolicy {
  return {
    latePolicy: '3 late arrivals count as 1 day deduction when payroll is run.',
    overtimePolicy: 'Minutes after the shift end count as overtime.',
    webCheckIn: true,
  };
}

export function createSeedHolidays(): Holiday[] {
  const holiday = dayjs().date() <= 2 ? dayjs().date(10) : dayjs().date(14);
  return [{ id: 'holiday-month', name: 'Public holiday', date: holiday.format('YYYY-MM-DD') }];
}

export function createSeedDays(): AttendanceDay[] {
  const today = dayjs().startOf('day');
  const yesterday = today.subtract(1, 'day');
  const lockedDay = today.startOf('month').subtract(1, 'day');
  const earlier = today.date() > 3 ? today.date(3) : today.date(1);

  const row = (
    id: string,
    code: string,
    name: string,
    date: dayjs.Dayjs,
    status: AttendanceDay['status'],
    checkIn: string | null,
    checkOut: string | null,
  ): AttendanceDay => ({
    id,
    employeeCode: code,
    employeeName: name,
    date: date.format('YYYY-MM-DD'),
    status,
    checkIn,
    checkOut,
    shiftId: SHIFT_GENERAL,
  });

  return [
    row('day-imran-today', 'WIT-0001', 'Imran Qureshi', today, 'Present', '09:02', '18:05'),
    row('day-sana-today', 'WIT-0002', 'Sana Tariq', today, 'Late', '09:40', null),
    row('day-ayesha-today', 'WIT-0003', 'Ayesha Malik', today, 'Absent', null, null),
    row('day-bilal-today', 'WIT-0004', 'Bilal Ahmed', today, 'Leave', null, null),
    row('day-usman-today', 'WIT-0005', 'Usman Khan', today, 'Present', '08:55', null),
    row('day-imran-earlier', 'WIT-0001', 'Imran Qureshi', earlier, 'Present', '09:00', '18:02'),
    row('day-imran-yesterday', 'WIT-0001', 'Imran Qureshi', yesterday, 'Present', '09:05', '18:10'),
    row('day-fatima-yesterday', 'WIT-0008', 'Fatima Noor', yesterday, 'Absent', null, null),
    row('day-usman-locked', 'WIT-0005', 'Usman Khan', lockedDay, 'Absent', null, null),
  ];
}

export function createSeedCorrections(): CorrectionRequest[] {
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  return [
    {
      id: 'corr-fatima',
      employeeCode: 'WIT-0008',
      employeeName: 'Fatima Noor',
      date: yesterday,
      fromStatus: 'Absent',
      toStatus: 'Present',
      reason: 'I was in the office and forgot to check in.',
      decision: 'Pending',
      comment: '',
    },
  ];
}
