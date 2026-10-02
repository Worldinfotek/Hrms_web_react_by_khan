import { LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { App, Button, Card, Flex, Select, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useEmployees } from '@/features/employees/api/employeesApi';
import { todayKey, useAttendanceStore } from '../store';

export function CheckInCard({ employeeCode, employeeName }: { employeeCode?: string; employeeName?: string }) {
  const { message } = App.useApp();
  const employees = useEmployees({ page: 1, pageSize: 100, sortBy: 'fullName', sortOrder: 'asc' });
  const days = useAttendanceStore((state) => state.days);
  const checkIn = useAttendanceStore((state) => state.checkIn);
  const checkOut = useAttendanceStore((state) => state.checkOut);
  const [picked, setPicked] = useState<string | undefined>(employeeCode);

  const code = employeeCode ?? picked;
  const person = employees.data?.items.find((item) => item.employeeCode === code);
  const name = employeeName ?? person?.fullName ?? '';
  const today = useMemo(
    () => days.find((day) => day.employeeCode === code && day.date === todayKey()),
    [days, code],
  );

  const run = (action: 'in' | 'out') => {
    if (!code || !name) {
      message.error('Choose an employee.');
      return;
    }
    const error = action === 'in' ? checkIn(code, name) : checkOut(code);
    if (error) message.error(error);
    else message.success(action === 'in' ? 'Checked in.' : 'Checked out.');
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <div>
          <Typography.Text strong>Check in / check out</Typography.Text>
          <div>
            <Typography.Text type="secondary">
              {today?.checkIn ? `In ${today.checkIn}` : 'Not checked in'}
              {today?.checkOut ? ` · Out ${today.checkOut}` : ''}
            </Typography.Text>
          </div>
        </div>
        <Flex gap={8} wrap>
          {!employeeCode && (
            <Select
              showSearch
              placeholder="Employee"
              style={{ minWidth: 220 }}
              value={picked}
              optionFilterProp="label"
              onChange={setPicked}
              options={(employees.data?.items ?? []).map((item) => ({
                value: item.employeeCode,
                label: `${item.fullName} (${item.employeeCode})`,
              }))}
            />
          )}
          <Button type="primary" icon={<LoginOutlined />} disabled={Boolean(today?.checkIn)} onClick={() => run('in')}>
            Check in
          </Button>
          <Button icon={<LogoutOutlined />} disabled={!today?.checkIn || Boolean(today.checkOut)} onClick={() => run('out')}>
            Check out
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
