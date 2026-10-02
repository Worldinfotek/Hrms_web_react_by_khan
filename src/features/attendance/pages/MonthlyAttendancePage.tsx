import { Calendar, Card, Flex, Select, Tag, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useEmployees } from '@/features/employees/api/employeesApi';
import { PageHeader } from '@/shared/components';
import { AttendanceStatusTag } from '../components/AttendanceStatusTag';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useAttendanceStore } from '../store';

export default function MonthlyAttendancePage() {
  const employees = useEmployees({ page: 1, pageSize: 100, sortBy: 'fullName', sortOrder: 'asc' });
  const days = useAttendanceStore((state) => state.days);
  const holidays = useAttendanceStore((state) => state.holidays);
  const [code, setCode] = useState('WIT-0001');
  const [month, setMonth] = useState(dayjs());
  const locked = month.isBefore(dayjs().startOf('month'), 'month');

  const byDate = useMemo(() => {
    const map = new Map<string, (typeof days)[number]>();
    for (const day of days) {
      if (day.employeeCode === code) map.set(day.date, day);
    }
    return map;
  }, [days, code]);
  const holidayByDate = useMemo(() => new Map(holidays.map((holiday) => [holiday.date, holiday.name])), [holidays]);

  return (
    <>
      <PageHeader title="Monthly attendance" subtitle="One employee, one month. Days before this month are locked." />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        <Flex gap={12} wrap align="center">
          <Select
            showSearch
            style={{ minWidth: 260 }}
            value={code}
            optionFilterProp="label"
            onChange={setCode}
            options={(employees.data?.items ?? [{ employeeCode: 'WIT-0001', fullName: 'Imran Qureshi' }]).map((item) => ({
              value: item.employeeCode,
              label: `${item.fullName} (${item.employeeCode})`,
            }))}
          />
          {locked && <Tag color="red">This payroll period is locked and cannot be edited.</Tag>}
        </Flex>
      </Card>
      <Card styles={{ body: { padding: 8 } }}>
        <Calendar
          value={month}
          onPanelChange={(value) => setMonth(value)}
          onSelect={(value) => setMonth(value)}
          cellRender={(date, info) => {
            if (info.type !== 'date') return info.originNode;
            return <DayCell date={date} day={byDate.get(date.format('YYYY-MM-DD'))} holiday={holidayByDate.get(date.format('YYYY-MM-DD'))} />;
          }}
        />
      </Card>
    </>
  );
}

function DayCell({
  day,
  holiday,
}: {
  date: Dayjs;
  day?: { status: import('../types').AttendanceStatus };
  holiday?: string;
}) {
  return (
    <div style={{ minHeight: 46 }}>
      {holiday && (
        <Typography.Text style={{ fontSize: 11, display: 'block' }} type="secondary">
          {holiday}
        </Typography.Text>
      )}
      {day && <AttendanceStatusTag status={day.status} />}
    </div>
  );
}
