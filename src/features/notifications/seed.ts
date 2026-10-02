import dayjs from 'dayjs';
import type { AlertTemplate, AppNotification, Reminder } from './types';
import { ALERT_EVENTS } from './types';

export function createSeedNotifications(): AppNotification[] {
  const today = dayjs();
  return [
    {
      id: 'note-cnic',
      title: 'Document expiring',
      body: 'Ayesha Malik’s CNIC expires within 30 days.',
      event: 'Document expiry',
      date: today.format('YYYY-MM-DD'),
      delivery: 'Sent',
      read: false,
    },
    {
      id: 'note-leave',
      title: 'Leave submitted',
      body: 'Sana Tariq submitted casual leave for tomorrow.',
      event: 'Leave',
      date: today.format('YYYY-MM-DD'),
      delivery: 'Sent',
      read: false,
    },
    {
      id: 'note-probation',
      title: 'Probation due',
      body: 'Hamza Yousaf’s probation ends within 30 days.',
      event: 'Probation',
      date: today.format('YYYY-MM-DD'),
      delivery: 'Sent',
      read: false,
    },
    {
      id: 'note-payslip',
      title: 'Payslip published',
      body: 'Last month’s payslip is published for Hira Shah.',
      event: 'Payslip ready',
      date: today.startOf('month').format('YYYY-MM-DD'),
      delivery: 'Sent',
      read: false,
    },
    {
      id: 'note-onboarding',
      title: 'Onboarding reminder',
      body: 'Hiba Noor still has open onboarding tasks.',
      event: 'Onboarding',
      date: today.format('YYYY-MM-DD'),
      delivery: 'Queued',
      read: false,
    },
    {
      id: 'note-exit',
      title: 'Clearance reminder failed',
      body: 'The clearance reminder for Nida Farooq could not be sent.',
      event: 'Offboarding',
      date: today.subtract(1, 'day').format('YYYY-MM-DD'),
      delivery: 'Failed',
      read: true,
    },
  ];
}

export function createSeedTemplates(): AlertTemplate[] {
  return ALERT_EVENTS.map((event) => ({
    id: `tpl-${event.toLowerCase().replace(/\s+/g, '-')}`,
    event,
    subject: event,
    body: `Sample message for ${event}. It is not sent by email or SMS.`,
  }));
}

export function createSeedReminders(): Reminder[] {
  return [
    { id: 'rem-doc', event: 'Document expiry', daysBefore: 30, recipient: 'HR' },
    { id: 'rem-probation', event: 'Probation', daysBefore: 14, recipient: 'Manager' },
    { id: 'rem-payslip', event: 'Payslip ready', daysBefore: 0, recipient: 'Employee' },
  ];
}
