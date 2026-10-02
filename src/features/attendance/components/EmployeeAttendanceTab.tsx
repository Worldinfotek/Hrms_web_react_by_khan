import { Card, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { formatDate } from '@/shared/utils/format';
import { AttendanceStatusTag } from './AttendanceStatusTag';
import { CheckInCard } from './CheckInCard';
import { SampleDataNotice } from './SampleDataNotice';
import { useAttendanceStore } from '../store';
import type { AttendanceDay } from '../types';

export function EmployeeAttendanceTab({ employeeCode, employeeName }: { employeeCode: string; employeeName: string }) {
  const days = useAttendanceStore((state) => state.days);
  const holidays = useAttendanceStore((state) => state.holidays);
  const rows = useMemo(
    () =>
      days
        .filter((day) => day.employeeCode === employeeCode && dayjs(day.date).isSame(dayjs(), 'month'))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [days, employeeCode],
  );
  const holidayDates = useMemo(() => new Set(holidays.map((holiday) => holiday.date)), [holidays]);

  const columns: TableProps<AttendanceDay>['columns'] = [
    { title: 'Date', dataIndex: 'date', render: (value: string) => formatDate(value) },
    { title: 'Status', dataIndex: 'status', render: (status: AttendanceDay['status']) => <AttendanceStatusTag status={status} /> },
    { title: 'In', dataIndex: 'checkIn', render: (value: string | null) => value ?? '—' },
    { title: 'Out', dataIndex: 'checkOut', render: (value: string | null) => value ?? '—' },
    {
      title: '',
      key: 'note',
      render: (_, day) => (holidayDates.has(day.date) ? <Typography.Text type="secondary">Holiday</Typography.Text> : null),
    },
  ];

  return (
    <>
      <SampleDataNotice />
      <CheckInCard employeeCode={employeeCode} employeeName={employeeName} />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<AttendanceDay> rowKey="id" columns={columns} dataSource={rows} pagination={false} locale={{ emptyText: 'No attendance this month' }} />
      </Card>
    </>
  );
}
