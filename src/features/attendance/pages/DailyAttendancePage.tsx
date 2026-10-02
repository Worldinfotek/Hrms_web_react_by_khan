import { Card, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useMemo } from 'react';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { AttendanceStatusTag } from '../components/AttendanceStatusTag';
import { CheckInCard } from '../components/CheckInCard';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { isDateLocked, todayKey, useAttendanceStore } from '../store';
import type { AttendanceDay } from '../types';

export default function DailyAttendancePage() {
  const days = useAttendanceStore((state) => state.days);
  const holidays = useAttendanceStore((state) => state.holidays);
  const today = todayKey();
  const rows = useMemo(() => days.filter((day) => day.date === today), [days, today]);
  const holiday = holidays.find((item) => item.date === today);

  const columns: TableProps<AttendanceDay>['columns'] = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      render: (name: string, day) => (
        <div>
          <div>{name}</div>
          <Typography.Text type="secondary">{day.employeeCode}</Typography.Text>
        </div>
      ),
    },
    { title: 'Status', dataIndex: 'status', render: (status: AttendanceDay['status']) => <AttendanceStatusTag status={status} /> },
    { title: 'In', dataIndex: 'checkIn', width: 90, render: (value: string | null) => value ?? '—' },
    { title: 'Out', dataIndex: 'checkOut', width: 90, render: (value: string | null) => value ?? '—' },
  ];

  return (
    <>
      <PageHeader title="Daily attendance" subtitle={formatDate(today)} />
      <SampleDataNotice />
      {holiday && (
        <Tag color="blue" style={{ marginBottom: 12 }}>
          {holiday.name}
        </Tag>
      )}
      {isDateLocked(today) && (
        <Typography.Paragraph type="danger">This payroll period is locked and cannot be edited.</Typography.Paragraph>
      )}
      <CheckInCard />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<AttendanceDay> rowKey="id" columns={columns} dataSource={rows} pagination={false} />
      </Card>
    </>
  );
}
