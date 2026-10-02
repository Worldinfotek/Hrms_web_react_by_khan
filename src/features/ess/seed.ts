import dayjs from 'dayjs';
import type { Announcement, HrRequest } from './types';

export function createSeedAnnouncements(): Announcement[] {
  return [
    {
      id: 'ann-holiday',
      title: 'Public holiday this month',
      body: 'The 14th is a public holiday. It is already on the attendance calendar.',
      date: dayjs().date(14).format('YYYY-MM-DD'),
    },
    {
      id: 'ann-payslip',
      title: 'Last month’s payslip is ready',
      body: 'Open My payslips to see the locked run. It is only your own payslip.',
      date: dayjs().startOf('month').format('YYYY-MM-DD'),
    },
  ];
}

export function createSeedHrRequests(): HrRequest[] {
  return [];
}
