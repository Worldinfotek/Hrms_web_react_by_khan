import dayjs from 'dayjs';
import { samplePdf } from '@/features/documents/sampleFiles';
import type { ExitCase } from './types';

function openClearance(owner: string, area: ExitCase['clearance'][number]['area'], signed: boolean): ExitCase['clearance'][number] {
  return { area, owner, status: signed ? 'Signed off' : 'Open' };
}

export function createSeedCases(): ExitCase[] {
  const today = dayjs();
  return [
    {
      id: 'exit-nida',
      employeeCode: 'WIT-0012',
      employeeName: 'Nida Farooq',
      department: 'Administration',
      kind: 'Resignation',
      reason: 'Moving to another city.',
      lastWorkingDay: today.add(30, 'day').format('YYYY-MM-DD'),
      noticeDays: 30,
      managerApproved: true,
      hrApproved: false,
      clearance: [
        openClearance('Imran Qureshi', 'Department', true),
        openClearance('Ayesha Malik', 'HR', false),
        openClearance('IT', 'IT', false),
        openClearance('Bilal Ahmed', 'Finance', false),
        openClearance('Admin', 'Asset return', false),
      ],
      interviewDone: false,
      interviewNotes: '',
      settlement: null,
      letterFileName: null,
      letterDataUrl: null,
    },
    {
      id: 'exit-maryam',
      employeeCode: 'WIT-0010',
      employeeName: 'Maryam Iqbal',
      department: 'Finance',
      kind: 'Resignation',
      reason: 'Career change.',
      lastWorkingDay: today.subtract(20, 'day').format('YYYY-MM-DD'),
      noticeDays: 30,
      managerApproved: true,
      hrApproved: true,
      clearance: [
        openClearance('Bilal Ahmed', 'Department', true),
        openClearance('Ayesha Malik', 'HR', true),
        openClearance('IT', 'IT', true),
        openClearance('Bilal Ahmed', 'Finance', true),
        openClearance('Admin', 'Asset return', true),
      ],
      interviewDone: true,
      interviewNotes: 'Positive interview. She asked for a relieving letter.',
      settlement: { pendingDays: 0, leaveEncashment: 42000, loanRecovery: 8000 },
      letterFileName: 'Maryam-Iqbal-relieving.pdf',
      letterDataUrl: samplePdf('Relieving letter - Maryam Iqbal'),
    },
  ];
}

export function defaultSettlement() {
  return { pendingDays: 12, leaveEncashment: 15000, loanRecovery: 0 };
}
