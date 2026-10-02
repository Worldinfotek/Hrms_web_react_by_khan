/** Sample attendance for the Phase 2 UI. Stored in the browser, not on the server. */

export type AttendanceStatus =
  | 'Present'
  | 'Late'
  | 'Absent'
  | 'Leave'
  | 'Early Departure'
  | 'Half Day'
  | 'Work From Home'
  | 'Official Duty';

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'Present',
  'Late',
  'Absent',
  'Leave',
  'Early Departure',
  'Half Day',
  'Work From Home',
  'Official Duty',
];

export interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  breakMinutes: number;
  graceMinutes: number;
  lateAfterMinutes: number;
  earlyLeaveMinutes: number;
  halfDayHours: number;
  weeklyOff: string[];
  isActive: boolean;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
}

export interface AttendancePolicy {
  latePolicy: string;
  overtimePolicy: string;
  webCheckIn: boolean;
}

export interface AttendanceDay {
  id: string;
  employeeCode: string;
  employeeName: string;
  date: string;
  status: AttendanceStatus;
  checkIn: string | null;
  checkOut: string | null;
  shiftId: string;
}

export type CorrectionDecision = 'Pending' | 'Approved' | 'Rejected';

export interface CorrectionRequest {
  id: string;
  employeeCode: string;
  employeeName: string;
  date: string;
  fromStatus: AttendanceStatus;
  toStatus: AttendanceStatus;
  reason: string;
  decision: CorrectionDecision;
  comment: string;
}

export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
