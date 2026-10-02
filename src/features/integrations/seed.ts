import dayjs from 'dayjs';
import type { ApiClient, FailedCall, ReadinessNote, Webhook } from './types';

export function createSeedClients(): ApiClient[] {
  return [
    {
      id: 'client-device',
      name: 'Attendance device',
      scopes: 'attendance.read',
      maskedKey: 'sk_live_****a1b2',
      status: 'Active',
    },
    {
      id: 'client-payroll',
      name: 'Payroll export',
      scopes: 'payroll.read',
      maskedKey: 'sk_live_****9f30',
      status: 'Revoked',
    },
  ];
}

export function createSeedWebhooks(): Webhook[] {
  return [
    {
      id: 'hook-punch',
      event: 'attendance.punch',
      url: 'https://example.invalid/hooks/attendance',
      delivery: 'Pending',
    },
    {
      id: 'hook-exit',
      event: 'employee.exited',
      url: 'https://example.invalid/hooks/exit',
      delivery: 'Failed',
    },
  ];
}

export function createSeedFailures(): FailedCall[] {
  return [
    {
      id: 'fail-sms',
      system: 'Email / SMS',
      when: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      message: 'The sample SMS gateway timed out. No message was sent.',
    },
    {
      id: 'fail-accounts',
      system: 'Accounting file',
      when: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
      message: 'The sample accounting export failed. Nothing was posted.',
    },
  ];
}

export function createSeedReadiness(): ReadinessNote[] {
  return [
    { name: 'Email / SMS', status: 'Not connected' },
    { name: 'Accounting file', status: 'Sample only' },
    { name: 'Bank file', status: 'Sample file on payroll' },
    { name: 'SSO', status: 'Not connected' },
  ];
}
