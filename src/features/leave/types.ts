export interface LeaveType {
  id: string;
  name: string;
  paid: boolean;
  halfDayAllowed: boolean;
  carryForward: boolean;
  accrual: 'Yearly' | 'Monthly';
  entitlement: number;
  attachmentAfterDays: number | null;
  isActive: boolean;
}

export interface LeaveBalance {
  employeeCode: string;
  leaveTypeId: string;
  allocated: number;
  taken: number;
  adjustment: number;
}

export type LeaveDecision = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  leaveTypeId: string;
  start: string;
  end: string;
  halfDay: boolean;
  days: number;
  dates: string[];
  reason: string;
  attachmentName: string | null;
  decision: LeaveDecision;
  comment: string;
}

export interface LeaveAdjustment {
  id: string;
  employeeCode: string;
  employeeName: string;
  leaveTypeId: string;
  amount: number;
  reason: string;
}

export function remaining(balance: Pick<LeaveBalance, 'allocated' | 'taken' | 'adjustment'>) {
  return balance.allocated - balance.taken + balance.adjustment;
}
