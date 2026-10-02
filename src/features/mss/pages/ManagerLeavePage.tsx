import { Calendar, Card, Typography } from 'antd';
import { useMemo } from 'react';
import { useLeaveStore } from '@/features/leave/store';
import { PageHeader } from '@/shared/components';
import { ManagerViewGate } from '../components/ManagerViewGate';
import { TEAM_CODES } from '../team';

export default function ManagerLeavePage() {
  const requests = useLeaveStore((state) => state.requests);
  const namesByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const request of requests) {
      if (request.decision !== 'Approved' || !TEAM_CODES.includes(request.employeeCode)) continue;
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
      <PageHeader title="Team leave" subtitle="Approved leave for Usman Khan’s direct reports." />
      <ManagerViewGate>
        <Card styles={{ body: { padding: 8 } }}>
          <Calendar
            cellRender={(date, info) => {
              if (info.type !== 'date') return info.originNode;
              const names = namesByDate.get(date.format('YYYY-MM-DD'));
              if (!names?.length) return null;
              return (
                <div>
                  {names.map((name) => (
                    <Typography.Text key={name} style={{ fontSize: 11, display: 'block' }}>
                      {name}
                    </Typography.Text>
                  ))}
                </div>
              );
            }}
          />
        </Card>
      </ManagerViewGate>
    </>
  );
}
