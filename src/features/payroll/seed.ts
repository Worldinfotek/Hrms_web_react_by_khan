import dayjs from 'dayjs';
import type { PayComponent, PayEmployee, PayrollRun, SalaryStructure } from './types';

export const COMP_BASIC = 'comp-basic';
export const COMP_HRA = 'comp-hra';
export const COMP_OT = 'comp-ot';
export const COMP_UNPAID = 'comp-unpaid';
export const COMP_TAX = 'comp-tax';
export const STRUCTURE_MONTHLY = 'structure-monthly';

export function createSeedComponents(): PayComponent[] {
  return [
    { id: COMP_BASIC, name: 'Basic', kind: 'Earning' },
    { id: COMP_HRA, name: 'House rent', kind: 'Earning' },
    { id: COMP_OT, name: 'Overtime', kind: 'Earning' },
    { id: COMP_UNPAID, name: 'Unpaid day', kind: 'Deduction' },
    { id: COMP_TAX, name: 'Income tax', kind: 'Deduction' },
  ];
}

export function createSeedStructures(): SalaryStructure[] {
  return [
    {
      id: STRUCTURE_MONTHLY,
      name: 'Monthly staff',
      componentIds: [COMP_BASIC, COMP_HRA, COMP_OT, COMP_UNPAID, COMP_TAX],
    },
  ];
}

function person(
  code: string,
  name: string,
  basic: number,
  hra: number,
  tax: number,
  lastNet: number,
  extra: PayEmployee['lines'] = [],
): PayEmployee {
  return {
    employeeCode: code,
    employeeName: name,
    lastNet,
    lines: [
      { componentId: COMP_BASIC, amount: basic, note: '' },
      { componentId: COMP_HRA, amount: hra, note: '' },
      ...extra,
      { componentId: COMP_TAX, amount: tax, note: '' },
    ],
  };
}

export function createSeedRuns(): PayrollRun[] {
  const current = dayjs();
  const last = current.subtract(1, 'month');
  const open: PayEmployee[] = [
    person('WIT-0001', 'Imran Qureshi', 250000, 100000, 15000, 335000, [
      { componentId: COMP_OT, amount: 8000, note: 'Overtime from attendance after the shift end.' },
    ]),
    person('WIT-0002', 'Sana Tariq', 220000, 80000, 10000, 290000),
    person('WIT-0003', 'Ayesha Malik', 120000, 40000, 5000, 155000, [
      { componentId: COMP_UNPAID, amount: 4000, note: '1 unpaid day from today’s absence.' },
    ]),
    person('WIT-0005', 'Usman Khan', 160000, 50000, 8000, 202000),
    person('WIT-0006', 'Hira Shah', 140000, 45000, 7000, 176000),
  ];
  const closed: PayEmployee[] = [
    person('WIT-0001', 'Imran Qureshi', 250000, 100000, 15000, 335000),
    person('WIT-0002', 'Sana Tariq', 220000, 80000, 10000, 290000),
    person('WIT-0003', 'Ayesha Malik', 120000, 40000, 5000, 155000),
    person('WIT-0005', 'Usman Khan', 160000, 50000, 8000, 202000),
    person('WIT-0006', 'Hira Shah', 140000, 45000, 7000, 176000),
  ];
  return [
    {
      id: 'run-current',
      month: current.format('YYYY-MM'),
      label: current.format('MMMM YYYY'),
      status: 'Draft',
      employees: open,
    },
    {
      id: 'run-last',
      month: last.format('YYYY-MM'),
      label: last.format('MMMM YYYY'),
      status: 'Locked',
      employees: closed,
    },
  ];
}
