import dayjs from 'dayjs';
import type { LeaveBalance, LeaveRequest, LeaveType } from './types';

export const LEAVE_ANNUAL = 'leave-annual';
export const LEAVE_CASUAL = 'leave-casual';
export const LEAVE_SICK = 'leave-sick';
export const LEAVE_UNPAID = 'leave-unpaid';

export function createSeedTypes(): LeaveType[] {
  return [
    {
      id: LEAVE_ANNUAL,
      name: 'Annual',
      paid: true,
      halfDayAllowed: true,
      carryForward: true,
      accrual: 'Yearly',
      entitlement: 18,
      attachmentAfterDays: null,
      isActive: true,
    },
    {
      id: LEAVE_CASUAL,
      name: 'Casual',
      paid: true,
      halfDayAllowed: true,
      carryForward: false,
      accrual: 'Yearly',
      entitlement: 10,
      attachmentAfterDays: null,
      isActive: true,
    },
    {
      id: LEAVE_SICK,
      name: 'Sick',
      paid: true,
      halfDayAllowed: false,
      carryForward: false,
      accrual: 'Yearly',
      entitlement: 8,
      attachmentAfterDays: 2,
      isActive: true,
    },
    {
      id: LEAVE_UNPAID,
      name: 'Unpaid',
      paid: false,
      halfDayAllowed: false,
      carryForward: false,
      accrual: 'Yearly',
      entitlement: 0,
      attachmentAfterDays: null,
      isActive: true,
    },
  ];
}

export function createSeedBalances(): LeaveBalance[] {
  return [{ employeeCode: 'WIT-0004', leaveTypeId: LEAVE_ANNUAL, allocated: 18, taken: 1, adjustment: 0 }];
}

export function createSeedRequests(): LeaveRequest[] {
  const today = dayjs().format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const past = dayjs().subtract(5, 'day').format('YYYY-MM-DD');
  return [
    {
      id: 'leave-bilal',
      employeeCode: 'WIT-0004',
      employeeName: 'Bilal Ahmed',
      department: 'Finance',
      leaveTypeId: LEAVE_ANNUAL,
      start: today,
      end: today,
      halfDay: false,
      days: 1,
      dates: [today],
      reason: 'Family visit',
      attachmentName: null,
      decision: 'Approved',
      comment: 'Approved by manager',
    },
    {
      id: 'leave-sana',
      employeeCode: 'WIT-0002',
      employeeName: 'Sana Tariq',
      department: 'Technology',
      leaveTypeId: LEAVE_CASUAL,
      start: tomorrow,
      end: tomorrow,
      halfDay: false,
      days: 1,
      dates: [tomorrow],
      reason: 'Personal work',
      attachmentName: null,
      decision: 'Pending',
      comment: '',
    },
    {
      id: 'leave-ali',
      employeeCode: 'WIT-0007',
      employeeName: 'Ali Raza',
      department: 'Technology',
      leaveTypeId: LEAVE_SICK,
      start: past,
      end: past,
      halfDay: false,
      days: 1,
      dates: [past],
      reason: 'Not well',
      attachmentName: null,
      decision: 'Rejected',
      comment: 'Medical note was not attached',
    },
  ];
}
