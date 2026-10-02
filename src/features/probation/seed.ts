import dayjs from 'dayjs';
import { samplePdf } from '@/features/documents/sampleFiles';
import { CRITERIA, type ProbationCase } from './types';

export function createSeedCases(): ProbationCase[] {
  const aliEnd = dayjs().subtract(10, 'day').format('YYYY-MM-DD');
  const zainEnd = dayjs().subtract(5, 'day').format('YYYY-MM-DD');
  const hamzaEnd = dayjs().add(18, 'day').format('YYYY-MM-DD');
  const confirmedOn = dayjs().subtract(8, 'day').format('YYYY-MM-DD');
  return [
    {
      employeeCode: 'WIT-0007',
      employeeName: 'Ali Raza',
      department: 'Software Development',
      probationEnd: aliEnd,
      extendedEnd: null,
      confirmationDate: confirmedOn,
      outcome: 'Confirmed',
      evaluation: {
        criteria: CRITERIA.map((name) => ({ name, score: name === 'Attendance' ? 4 : 5 })),
        comments: 'Ready to confirm.',
        recommendation: 'Confirm',
      },
      decisionComment: 'Confirmed after probation.',
      letterFileName: 'Ali-Raza-confirmation.pdf',
      letterDataUrl: samplePdf('Confirmation letter - Ali Raza'),
    },
    {
      employeeCode: 'WIT-0009',
      employeeName: 'Zain Abbas',
      department: 'Human Resources',
      probationEnd: zainEnd,
      extendedEnd: dayjs(zainEnd).add(30, 'day').format('YYYY-MM-DD'),
      confirmationDate: null,
      outcome: 'Extended',
      evaluation: {
        criteria: CRITERIA.map((name) => ({ name, score: 3 })),
        comments: 'Needs more time on hiring coordination.',
        recommendation: 'Extend',
      },
      decisionComment: 'Extended by 30 days.',
      letterFileName: null,
      letterDataUrl: null,
    },
    {
      employeeCode: 'WIT-0011',
      employeeName: 'Hamza Yousaf',
      department: 'Software Development',
      probationEnd: hamzaEnd,
      extendedEnd: null,
      confirmationDate: null,
      outcome: 'Awaiting',
      evaluation: null,
      decisionComment: '',
      letterFileName: null,
      letterDataUrl: null,
    },
  ];
}
