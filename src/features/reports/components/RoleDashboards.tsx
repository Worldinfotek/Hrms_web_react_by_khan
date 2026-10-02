import { Card, Col, Row, Segmented, Statistic, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { todayKey, useAttendanceStore } from '@/features/attendance/store';
import { useEssStore } from '@/features/ess/store';
import { ESS_EMPLOYEE } from '@/features/ess/types';
import { balanceOf, useLeaveStore } from '@/features/leave/store';
import { remaining } from '@/features/leave/types';
import { TEAM_CODES } from '@/features/mss/team';
import { useOnboardingStore } from '@/features/onboarding/store';
import { progressPercent } from '@/features/onboarding/types';
import { ROSTER } from '@/features/offboarding/roster';
import { useOffboardingStore } from '@/features/offboarding/store';
import { exitStage, settlementNet } from '@/features/offboarding/types';
import { usePayrollStore } from '@/features/payroll/store';
import { lineNet } from '@/features/payroll/types';
import { useProbationStore } from '@/features/probation/store';
import { useRecruitmentStore } from '@/features/recruitment/store';

export type DashboardRole = 'HR' | 'Manager' | 'Finance' | 'Management' | 'Employee';

const ROLES: DashboardRole[] = ['HR', 'Manager', 'Finance', 'Management', 'Employee'];

export function RoleDashboards() {
  const [role, setRole] = useState<DashboardRole>('HR');
  const joiners = useOnboardingStore((state) => state.joiners);
  const exits = useOffboardingStore((state) => state.cases);
  const probation = useProbationStore((state) => state.cases);
  const leave = useLeaveStore((state) => state.requests);
  const leaveTypes = useLeaveStore((state) => state.types);
  const balances = useLeaveStore((state) => state.balances);
  const corrections = useAttendanceStore((state) => state.corrections);
  const days = useAttendanceStore((state) => state.days);
  const hrRequests = useEssStore((state) => state.requests);
  const runs = usePayrollStore((state) => state.runs);
  const components = usePayrollStore((state) => state.components);
  const vacancies = useRecruitmentStore((state) => state.vacancies);

  const openJoiners = useMemo(() => joiners.filter((item) => progressPercent(item) < 100).length, [joiners]);
  const openExits = useMemo(() => exits.filter((item) => exitStage(item) !== 'Completed').length, [exits]);
  const completedExits = useMemo(() => exits.filter((item) => exitStage(item) === 'Completed'), [exits]);
  const probationDue = useMemo(
    () =>
      probation.filter(
        (item) => item.outcome === 'Awaiting' && !dayjs(item.probationEnd).isAfter(dayjs().add(30, 'day'), 'day'),
      ).length,
    [probation],
  );
  const pendingLeave = useMemo(() => leave.filter((item) => item.decision === 'Pending').length, [leave]);
  const pendingCorrections = useMemo(
    () => corrections.filter((item) => item.decision === 'Pending').length,
    [corrections],
  );
  const pendingHr = useMemo(() => hrRequests.filter((item) => item.status === 'Pending').length, [hrRequests]);
  const teamToday = useMemo(
    () => days.filter((day) => day.date === todayKey() && TEAM_CODES.includes(day.employeeCode)),
    [days],
  );
  const current = runs.find((run) => run.id === 'run-current');
  const last = runs.find((run) => run.id === 'run-last');
  const settlementTotal = completedExits.reduce((sum, item) => sum + (item.settlement ? settlementNet(item.settlement) : 0), 0);
  const openVacancies = useMemo(() => vacancies.filter((item) => item.status === 'Open').length, [vacancies]);
  const annual = leaveTypes.find((item) => item.name === 'Annual');
  const hiraLeave = annual ? remaining(balanceOf(balances, ESS_EMPLOYEE.code, annual)) : 0;
  const hiraToday = days.find((day) => day.employeeCode === ESS_EMPLOYEE.code && day.date === todayKey());
  const hiraPay = last?.employees.find((person) => person.employeeCode === ESS_EMPLOYEE.code);

  return (
    <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
      <Typography.Paragraph type="secondary">
        Role dashboards read the sample data from earlier phases. The switch does not change your login.
      </Typography.Paragraph>
      <Segmented<DashboardRole> options={ROLES} value={role} onChange={setRole} style={{ marginBottom: 16 }} />
      {role === 'HR' && (
        <Row gutter={[16, 16]}>
          <Stat label="Headcount" value={ROSTER.length} />
          <Stat label="Joiners still onboarding" value={openJoiners} />
          <Stat label="Exits in progress" value={openExits} />
          <Stat label="Probation due" value={probationDue} />
          <Stat label="Pending HR actions" value={pendingLeave + pendingCorrections + pendingHr} />
        </Row>
      )}
      {role === 'Manager' && (
        <Row gutter={[16, 16]}>
          <Stat label="Direct reports" value={TEAM_CODES.length} />
          <Stat label="Present or late today" value={teamToday.filter((day) => day.status === 'Present' || day.status === 'Late').length} />
          <Stat label="Absent today" value={teamToday.filter((day) => day.status === 'Absent').length} />
          <Stat label="Pending approvals" value={pendingLeave + pendingCorrections + pendingHr} />
          <Col xs={24}>
            <Link to="/manager">Open My team</Link>
          </Col>
        </Row>
      )}
      {role === 'Finance' && (
        <Row gutter={[16, 16]}>
          <Stat label="This month" value={current?.status ?? '—'} />
          <Stat label="People on the run" value={current?.employees.length ?? 0} />
          <Stat label="Last month" value={last?.status ?? '—'} />
          <Stat label="Completed settlement net" value={settlementTotal.toLocaleString()} />
          <Col xs={24}>
            <Link to="/payroll">Open payroll</Link>
          </Col>
        </Row>
      )}
      {role === 'Management' && (
        <Row gutter={[16, 16]}>
          <Stat label="Headcount" value={ROSTER.length} />
          <Stat label="Open vacancies" value={openVacancies} />
          <Stat label="Exits in progress" value={openExits} />
          <Stat label="Payroll this month" value={current?.status ?? '—'} />
        </Row>
      )}
      {role === 'Employee' && (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Typography.Text>
              {ESS_EMPLOYEE.name} · {ESS_EMPLOYEE.code}
            </Typography.Text>
          </Col>
          <Stat label="Today" value={hiraToday?.status ?? 'No row yet'} />
          <Stat label="Annual leave left" value={hiraLeave} />
          <Stat label="Latest payslip" value={hiraPay && last ? lineNet(hiraPay.lines, components).toLocaleString() : '—'} />
          <Col xs={24}>
            <Link to="/ess">Open self-service</Link>
          </Col>
        </Row>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Col xs={24} md={8}>
      <Card>
        <Statistic title={label} value={value} />
      </Card>
    </Col>
  );
}
