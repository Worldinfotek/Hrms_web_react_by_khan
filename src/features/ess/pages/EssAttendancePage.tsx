import { Card, Table, Typography } from 'antd';
import { CheckInCard } from '@/features/attendance/components/CheckInCard';
import { useAttendanceStore } from '@/features/attendance/store';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { EmployeeViewGate } from '../components/EmployeeViewGate';
import { ESS_EMPLOYEE } from '../types';
import type { AttendanceDay } from '@/features/attendance/types';
import { useMemo } from 'react';

export default function EssAttendancePage() {
  const days = useAttendanceStore((state) => state.days);
  const mine = useMemo(() => days.filter((day) => day.employeeCode === ESS_EMPLOYEE.code), [days]);

  return (
    <>
      <PageHeader title="My attendance" subtitle={ESS_EMPLOYEE.name} />
      <EmployeeViewGate>
        <CheckInCard employeeCode={ESS_EMPLOYEE.code} employeeName={ESS_EMPLOYEE.name} />
        <Card styles={{ body: { padding: 16 } }}>
          {mine.length === 0 ? (
            <Typography.Text type="secondary">No attendance rows yet. Check in to add today.</Typography.Text>
          ) : (
            <Table<AttendanceDay>
              rowKey="id"
              pagination={false}
              dataSource={mine}
              columns={[
                { title: 'Date', dataIndex: 'date', render: (value: string) => formatDate(value) },
                { title: 'Status', dataIndex: 'status' },
                { title: 'In', dataIndex: 'checkIn', render: (value: string | null) => value ?? '—' },
                { title: 'Out', dataIndex: 'checkOut', render: (value: string | null) => value ?? '—' },
              ]}
            />
          )}
        </Card>
      </EmployeeViewGate>
    </>
  );
}
