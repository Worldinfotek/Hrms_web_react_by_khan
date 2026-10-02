import { Card, Table, Typography } from 'antd';
import { useMemo } from 'react';
import { AttendanceStatusTag } from '@/features/attendance/components/AttendanceStatusTag';
import { todayKey, useAttendanceStore } from '@/features/attendance/store';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { ManagerViewGate } from '../components/ManagerViewGate';
import { TEAM, TEAM_CODES } from '../team';
import type { AttendanceDay } from '@/features/attendance/types';

export default function ManagerAttendancePage() {
  const days = useAttendanceStore((state) => state.days);
  const today = todayKey();
  const rows = useMemo(() => {
    return TEAM.map((person) => {
      const day = days.find((item) => item.employeeCode === person.code && item.date === today);
      return { ...person, day };
    });
  }, [days, today]);

  return (
    <>
      <PageHeader title="Team attendance" subtitle={formatDate(today)} />
      <ManagerViewGate>
        <Card styles={{ body: { padding: 16 } }}>
          <Table
            rowKey="code"
            pagination={false}
            dataSource={rows}
            columns={[
              { title: 'Employee', dataIndex: 'name' },
              { title: 'Code', dataIndex: 'code' },
              {
                title: 'Today',
                key: 'status',
                render: (_, row) =>
                  row.day ? <AttendanceStatusTag status={row.day.status} /> : <Typography.Text type="secondary">No row</Typography.Text>,
              },
              { title: 'In', render: (_, row) => row.day?.checkIn ?? '—' },
              { title: 'Out', render: (_, row) => row.day?.checkOut ?? '—' },
            ]}
          />
        </Card>
        <History days={days} />
      </ManagerViewGate>
    </>
  );
}

function History({ days }: { days: AttendanceDay[] }) {
  const rows = days.filter((day) => TEAM_CODES.includes(day.employeeCode));
  if (rows.length === 0) return null;
  return (
    <Card title="Recent team rows" styles={{ body: { padding: 16 } }} style={{ marginTop: 16 }}>
      <Table
        rowKey="id"
        pagination={false}
        dataSource={rows}
        columns={[
          { title: 'Employee', dataIndex: 'employeeName' },
          { title: 'Date', dataIndex: 'date', render: (value: string) => formatDate(value) },
          { title: 'Status', dataIndex: 'status', render: (status: AttendanceDay['status']) => <AttendanceStatusTag status={status} /> },
        ]}
      />
    </Card>
  );
}
