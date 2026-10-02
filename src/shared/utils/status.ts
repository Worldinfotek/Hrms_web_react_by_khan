/** Maps common status words to consistent colours across every module. */
const STATUS_COLORS: Record<string, string> = {
  active: 'green',
  confirmed: 'green',
  approved: 'green',
  present: 'green',
  completed: 'green',
  pending: 'gold',
  probation: 'blue',
  submitted: 'blue',
  'in progress': 'blue',
  draft: 'default',
  inactive: 'default',
  'notice period': 'orange',
  late: 'orange',
  rejected: 'red',
  absent: 'red',
  resigned: 'volcano',
  exited: 'red',
  cancelled: 'default',
};

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status.trim().toLowerCase()] ?? 'default';
}
