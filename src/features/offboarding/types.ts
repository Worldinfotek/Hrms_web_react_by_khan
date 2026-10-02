export const CLEARANCE_AREAS = ['Department', 'HR', 'IT', 'Finance', 'Asset return'] as const;

export type ClearanceArea = (typeof CLEARANCE_AREAS)[number];

export type ExitKind = 'Resignation' | 'Termination' | 'Non-confirmation';

export interface ClearanceItem {
  area: ClearanceArea;
  owner: string;
  status: 'Open' | 'Signed off';
}

export interface Settlement {
  pendingDays: number;
  leaveEncashment: number;
  loanRecovery: number;
}

export interface ExitCase {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  kind: ExitKind;
  reason: string;
  lastWorkingDay: string;
  noticeDays: number;
  managerApproved: boolean;
  hrApproved: boolean;
  clearance: ClearanceItem[];
  interviewDone: boolean;
  interviewNotes: string;
  settlement: Settlement | null;
  letterFileName: string | null;
  letterDataUrl: string | null;
}

export function clearanceComplete(item: ExitCase) {
  return item.clearance.every((row) => row.status === 'Signed off');
}

export function exitStage(item: ExitCase) {
  if (clearanceComplete(item) && item.managerApproved && item.hrApproved) return 'Completed';
  if (item.clearance.some((row) => row.status === 'Signed off')) return 'In clearance';
  if (item.hrApproved) return 'HR approved';
  if (item.managerApproved) return 'Manager approved';
  return 'Submitted';
}

export function isExited(item: ExitCase) {
  return exitStage(item) === 'Completed';
}

export function settlementNet(settlement: Settlement) {
  return settlement.leaveEncashment - settlement.loanRecovery;
}
