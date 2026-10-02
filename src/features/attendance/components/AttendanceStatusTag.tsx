import { Tag } from 'antd';
import type { AttendanceStatus } from '../types';

const COLORS: Record<AttendanceStatus, string> = {
  Present: 'green',
  Late: 'orange',
  Absent: 'red',
  Leave: 'blue',
  'Early Departure': 'gold',
  'Half Day': 'purple',
  'Work From Home': 'cyan',
  'Official Duty': 'default',
};

export function AttendanceStatusTag({ status }: { status: AttendanceStatus }) {
  return <Tag color={COLORS[status]}>{status}</Tag>;
}
