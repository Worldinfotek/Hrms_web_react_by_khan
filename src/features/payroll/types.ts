export type ComponentKind = 'Earning' | 'Deduction';

export interface PayComponent {
  id: string;
  name: string;
  kind: ComponentKind;
}

export interface SalaryStructure {
  id: string;
  name: string;
  componentIds: string[];
}

export interface SalaryLine {
  componentId: string;
  amount: number;
  note: string;
}

export interface PayEmployee {
  employeeCode: string;
  employeeName: string;
  lines: SalaryLine[];
  lastNet: number;
}

export const RUN_FLOW = ['Draft', 'Calculated', 'Under review', 'Approved', 'Locked', 'Payslips published'] as const;

export type RunStatus = (typeof RUN_FLOW)[number];

export interface PayrollRun {
  id: string;
  month: string;
  label: string;
  status: RunStatus;
  employees: PayEmployee[];
}

export function payrollStepIndex(status: RunStatus): number {
  if (status === 'Draft' || status === 'Calculated') return 0;
  if (status === 'Under review') return 1;
  if (status === 'Approved') return 2;
  return 3;
}

/** Labels shown on the monthly payroll steps. Stored statuses stay as they are. */
export const PAYROLL_STEP_LABELS = ['Process', 'Review', 'Approve', 'Lock'] as const;

export function payrollStepLabel(status: RunStatus) {
  return PAYROLL_STEP_LABELS[payrollStepIndex(status)];
}

export function isRunLocked(status: RunStatus) {
  return status === 'Locked' || status === 'Payslips published';
}

export function lineNet(lines: SalaryLine[], components: PayComponent[]) {
  return lines.reduce((sum, line) => {
    const component = components.find((item) => item.id === line.componentId);
    if (!component) return sum;
    return component.kind === 'Earning' ? sum + line.amount : sum - line.amount;
  }, 0);
}
