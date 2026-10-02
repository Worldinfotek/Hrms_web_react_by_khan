export const ALERT_EVENTS = [
  'Leave',
  'Attendance exception',
  'Payslip ready',
  'Probation',
  'Document expiry',
  'Onboarding',
  'Offboarding',
  'Pending approval',
] as const;

export type AlertEvent = (typeof ALERT_EVENTS)[number];

export type DeliveryStatus = 'Queued' | 'Sent' | 'Failed';

export type ReminderRecipient = 'HR' | 'Manager' | 'Employee' | 'Finance';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  event: AlertEvent;
  date: string;
  delivery: DeliveryStatus;
  read: boolean;
}

export interface AlertTemplate {
  id: string;
  event: AlertEvent;
  subject: string;
  body: string;
}

export interface Reminder {
  id: string;
  event: AlertEvent;
  daysBefore: number;
  recipient: ReminderRecipient;
}
