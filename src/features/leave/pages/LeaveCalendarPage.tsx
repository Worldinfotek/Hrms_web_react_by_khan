import { Calendar, Card, Typography } from 'antd';
import { useMemo } from 'react';
import { useAttendanceStore } from '@/features/attendance/store';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useLeaveStore } from '../store';

export default function LeaveCalendarPage() {
  const requests = useLeaveStore((state) => state.requests);
  const holidays = useAttendanceStore((state) => state.holidays);
  const holidayByDate = useMemo(() => new Map(holidays.map((holiday) => [holiday.date, holiday.name])), [holidays]);
  const namesByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const request of requests) {
      if (request.decision !== 'Approved') continue;
      for (const date of request.dates) {
        const names = map.get(date) ?? [];
        names.push(request.employeeName.split(' ')[0] ?? request.employeeName);
        map.set(date, names);
      }
    }
    return map;
  }, [requests]);

  return (
    <>
      <PageHeader title="Team leave calendar" subtitle="Approved leave for the month. Pending requests stay off this calendar." />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 8 } }}>
        <Calendar
          cellRender={(date, info) => {
            if (info.type !== 'date') return info.originNode;
            const key = date.format('YYYY-MM-DD');
            return <DayCell names={namesByDate.get(key)} holiday={holidayByDate.get(key)} />;
          }}
        />
      </Card>
    </>
  );
}

function DayCell({ names, holiday }: { names?: string[]; holiday?: string }) {
  const shown = names?.slice(0, 2) ?? [];
  const extra = (names?.length ?? 0) - shown.length;
  return (
    <div style={{ minHeight: 46 }}>
      {holiday && (
        <Typography.Text style={{ fontSize: 11, display: 'block' }} type="secondary">
          {holiday}
        </Typography.Text>
      )}
      {shown.map((name) => (
        <Typography.Text key={name} style={{ fontSize: 11, display: 'block' }}>
          {name}
        </Typography.Text>
      ))}
      {extra > 0 && (
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
          +{extra}
        </Typography.Text>
      )}
    </div>
  );
}
