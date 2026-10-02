import { Card, Col, Row, Statistic } from 'antd';
import { Link } from 'react-router-dom';
import { todayKey, useAttendanceStore } from '@/features/attendance/store';
import { useEssStore } from '@/features/ess/store';
import { useLeaveStore } from '@/features/leave/store';
import { useProbationStore } from '@/features/probation/store';
import { PageHeader } from '@/shared/components';
import { ManagerViewGate } from '../components/ManagerViewGate';
import { MANAGER, TEAM, TEAM_CODES } from '../team';

export default function ManagerHomePage() {
  const days = useAttendanceStore((state) => state.days);
  const corrections = useAttendanceStore((state) => state.corrections);
  const requests = useLeaveStore((state) => state.requests);
  const hrRequests = useEssStore((state) => state.requests);
  const cases = useProbationStore((state) => state.cases);
  const today = days.filter((day) => day.date === todayKey() && TEAM_CODES.includes(day.employeeCode));
  const present = today.filter((day) => day.status === 'Present' || day.status === 'Late').length;
  const absent = today.filter((day) => day.status === 'Absent').length;
  const onLeave = today.filter((day) => day.status === 'Leave').length;
  const pendingLeave = requests.filter((item) => item.decision === 'Pending').length;
  const pendingCorrections = corrections.filter((item) => item.decision === 'Pending').length;
  const pendingHr = hrRequests.filter((item) => item.status === 'Pending').length;
  const probation = cases.filter((item) => TEAM_CODES.includes(item.employeeCode) && item.outcome === 'Awaiting');

  return (
    <>
      <PageHeader title="Manager self-service" subtitle={`${MANAGER.name} · ${MANAGER.designation}`} />
      <ManagerViewGate>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Team headcount" value={TEAM.length} />
              <Link to="/manager/team">Team directory</Link>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Present or late today" value={present} />
              <div>Absent {absent}</div>
              <Link to="/manager/attendance">Team attendance</Link>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="On leave today" value={onLeave} />
              <Link to="/manager/leave">Team leave</Link>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Pending approvals" value={pendingLeave + pendingCorrections + pendingHr} />
              <Link to="/manager/inbox">Approvals inbox</Link>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Probation ending" value={probation.length} />
              <div>{probation.map((item) => item.employeeName).join(', ') || 'None awaiting'}</div>
            </Card>
          </Col>
        </Row>
      </ManagerViewGate>
    </>
  );
}
