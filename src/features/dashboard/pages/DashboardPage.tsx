import { Button } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useNavRole } from '@/app/router/useNavRole';
import { todayKey, useAttendanceStore } from '@/features/attendance/store';
import { useDocumentStore } from '@/features/documents/store';
import { useEmployeeSummary } from '@/features/employees/api/employeesApi';
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
import { brandColors } from '@/theme/themeConfig';
import { ModuleList } from '../components/ModuleList';
import styles from '../dashboard.module.css';

type Role = 'HR' | 'Manager' | 'Finance' | 'Management' | 'Employee';

const DONUT_COLORS = [brandColors.primary, brandColors.secondary, '#7EB6E4', '#8FCFB0'];

export default function DashboardPage() {
  const [modulesOpen, setModulesOpen] = useState(false);
  const navRole = useNavRole();
  const role: Role =
    navRole === 'manager'
      ? 'Manager'
      : navRole === 'finance'
        ? 'Finance'
        : navRole === 'management'
          ? 'Management'
          : navRole === 'employee'
            ? 'Employee'
            : 'HR';
  const summary = useEmployeeSummary();
  const days = useAttendanceStore((state) => state.days);
  const corrections = useAttendanceStore((state) => state.corrections);
  const leave = useLeaveStore((state) => state.requests);
  const leaveTypes = useLeaveStore((state) => state.types);
  const balances = useLeaveStore((state) => state.balances);
  const documents = useDocumentStore((state) => state.documents);
  const vacancies = useRecruitmentStore((state) => state.vacancies);
  const candidates = useRecruitmentStore((state) => state.candidates);
  const probation = useProbationStore((state) => state.cases);
  const exits = useOffboardingStore((state) => state.cases);
  const joiners = useOnboardingStore((state) => state.joiners);
  const hrRequests = useEssStore((state) => state.requests);
  const runs = usePayrollStore((state) => state.runs);
  const components = usePayrollStore((state) => state.components);

  const today = todayKey();
  const todayRows = useMemo(() => days.filter((day) => day.date === today), [days, today]);
  const pending =
    leave.filter((item) => item.decision === 'Pending').length +
    corrections.filter((item) => item.decision === 'Pending').length +
    hrRequests.filter((item) => item.status === 'Pending').length;
  const probationDue = probation.filter(
    (item) => item.outcome === 'Awaiting' && !dayjs(item.probationEnd).isAfter(dayjs().add(30, 'day'), 'day'),
  ).length;
  const openExits = exits.filter((item) => exitStage(item) !== 'Completed').length;
  const expiringDocs = documents.filter((item) => {
    if (!item.expiryDate) return false;
    const expiry = dayjs(item.expiryDate);
    return !expiry.isBefore(dayjs(), 'day') && !expiry.isAfter(dayjs().add(30, 'day'), 'day');
  }).length;
  const interviewsToday = candidates.reduce(
    (sum, candidate) => sum + candidate.interviews.filter((item) => item.date === today).length,
    0,
  );
  const openVacancies = vacancies.filter((item) => item.status === 'Open').reduce((sum, item) => sum + item.openings, 0);

  const cards = useMemo(() => {
    if (role === 'Manager') {
      const teamToday = todayRows.filter((day) => TEAM_CODES.includes(day.employeeCode));
      return [
        { label: 'Direct reports', value: String(TEAM_CODES.length), hint: 'Usman Khan’s team' },
        { label: 'Present or late today', value: String(teamToday.filter((day) => day.status === 'Present' || day.status === 'Late').length), hint: 'Team attendance' },
        { label: 'Absent today', value: String(teamToday.filter((day) => day.status === 'Absent').length), hint: 'Team attendance' },
        { label: 'Pending approvals', value: String(pending), hint: 'Leave, corrections, HR requests' },
        { label: 'Probation ending', value: String(probationDue), hint: 'Awaiting, within 30 days' },
      ];
    }
    if (role === 'Finance') {
      const current = runs.find((run) => run.id === 'run-current');
      const last = runs.find((run) => run.id === 'run-last');
      const net = exits
        .filter((item) => exitStage(item) === 'Completed')
        .reduce((sum, item) => sum + (item.settlement ? settlementNet(item.settlement) : 0), 0);
      return [
        { label: 'This month', value: current?.status ?? '—', hint: 'Payroll run' },
        { label: 'People on the run', value: String(current?.employees.length ?? 0), hint: 'This month’s run' },
        { label: 'Last month', value: last?.status ?? '—', hint: 'Payroll run' },
        { label: 'Completed settlement net', value: net.toLocaleString(), hint: 'Will feed payroll later' },
      ];
    }
    if (role === 'Management') {
      const current = runs.find((run) => run.id === 'run-current');
      return [
        { label: 'Headcount', value: String(ROSTER.length), hint: 'Active employees' },
        { label: 'Open vacancies', value: String(openVacancies), hint: 'Recruitment' },
        { label: 'Exits in progress', value: String(openExits), hint: 'Offboarding' },
        { label: 'Payroll this month', value: runs.find((run) => run.id === 'run-current')?.status ?? '—', hint: current?.label ?? '' },
      ];
    }
    if (role === 'Employee') {
      const annual = leaveTypes.find((item) => item.name === 'Annual');
      const hiraToday = days.find((day) => day.employeeCode === ESS_EMPLOYEE.code && day.date === today);
      const last = runs.find((run) => run.id === 'run-last');
      const pay = last?.employees.find((person) => person.employeeCode === ESS_EMPLOYEE.code);
      return [
        { label: 'Today', value: hiraToday?.status ?? 'No row yet', hint: ESS_EMPLOYEE.name },
        { label: 'Annual leave left', value: String(annual ? remaining(balanceOf(balances, ESS_EMPLOYEE.code, annual)) : 0), hint: ESS_EMPLOYEE.code },
        { label: 'Latest payslip', value: pay && last ? lineNet(pay.lines, components).toLocaleString() : '—', hint: last?.label ?? '' },
      ];
    }
    return [
      { label: 'Active employees', value: summary.data ? String(summary.data.activeEmployees) : '—', hint: 'From the directory' },
      { label: 'Present today', value: String(todayRows.filter((day) => day.status === 'Present').length), hint: 'Today’s attendance' },
      { label: 'On leave', value: String(todayRows.filter((day) => day.status === 'Leave').length), hint: 'Today’s attendance' },
      { label: 'New joiners', value: summary.data ? String(summary.data.joinedThisMonth) : '—', hint: `${joiners.filter((item) => progressPercent(item) < 100).length} still onboarding` },
      { label: 'Open vacancies', value: String(openVacancies), hint: 'Recruitment' },
      { label: 'Interviews today', value: String(interviewsToday), hint: 'Scheduled for today' },
      { label: 'Pending approvals', value: String(pending), hint: 'Leave, corrections, HR requests' },
      { label: 'Late today', value: String(todayRows.filter((day) => day.status === 'Late').length), hint: 'Today’s attendance' },
      { label: 'Probation due', value: String(probationDue), hint: 'Due in the next 30 days' },
      { label: 'Notice period', value: String(openExits), hint: 'Exits in progress' },
      { label: 'Documents', value: String(expiringDocs), hint: 'Expiring in 30 days' },
      { label: 'Absent today', value: String(todayRows.filter((day) => day.status === 'Absent').length), hint: 'Today’s attendance' },
    ];
  }, [
    role,
    summary.data,
    todayRows,
    pending,
    probationDue,
    openExits,
    expiringDocs,
    interviewsToday,
    openVacancies,
    joiners,
    runs,
    exits,
    leaveTypes,
    balances,
    days,
    today,
    components,
  ]);

  const departments = summary.data?.byDepartment ?? [];
  const pipeline = useMemo(() => {
    const stages = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
    return stages.map((stage) => ({ label: stage, value: candidates.filter((item) => item.stage === stage).length }));
  }, [candidates]);
  const leaveMix = useMemo(
    () =>
      leaveTypes
        .filter((type) => type.isActive)
        .map((type) => ({ label: type.name, value: leave.filter((item) => item.leaveTypeId === type.id).length })),
    [leaveTypes, leave],
  );
  const trend = useMemo(() => monthWeeks(days), [days]);
  const flow = useMemo(() => monthFlow(joiners, exits), [joiners, exits]);
  const todayStatus = useMemo(() => {
    const names = ['Present', 'Late', 'Absent', 'Leave', 'Half Day', 'Work From Home'];
    return names
      .map((label) => ({ label, value: todayRows.filter((day) => day.status === label).length }))
      .filter((item) => item.value > 0);
  }, [todayRows]);

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Workforce overview for {dayjs().format('MMMM YYYY')}</p>
        </div>
        <Button type="primary" className={styles.moduleBtn} onClick={() => setModulesOpen(true)}>
          Module-List
        </Button>
      </div>

      <div className={styles.stats}>
        {cards.map((card, index) => (
          <article key={card.label} className={styles.stat} style={{ animationDelay: `${index * 40}ms` }}>
            <span className={styles.statLabel}>{card.label}</span>
            <span className={styles.statValue}>{card.value}</span>
            <span className={styles.statHint}>{card.hint}</span>
          </article>
        ))}
      </div>

      <div className={styles.charts}>
        <section className={styles.panel} style={{ animationDelay: '80ms' }}>
          <h2 className={styles.panelTitle}>Headcount by department</h2>
          <Bars rows={departments.map((item) => ({ label: item.name, value: item.count }))} />
        </section>
        <section className={styles.panel} style={{ animationDelay: '120ms' }}>
          <h2 className={styles.panelTitle}>Attendance this month</h2>
          <Trend points={trend} />
        </section>
        <section className={styles.panel} style={{ animationDelay: '160ms' }}>
          <h2 className={styles.panelTitle}>Leave mix</h2>
          <Donut rows={leaveMix} />
        </section>
        <section className={styles.panel} style={{ animationDelay: '200ms' }}>
          <h2 className={styles.panelTitle}>Recruitment pipeline</h2>
          <Bars rows={pipeline} />
        </section>
        <section className={styles.panel} style={{ animationDelay: '240ms' }}>
          <h2 className={styles.panelTitle}>Joiners and exits</h2>
          <Grouped months={flow} />
        </section>
        <section className={styles.panel} style={{ animationDelay: '280ms' }}>
          <h2 className={styles.panelTitle}>Attendance status today</h2>
          <Bars rows={todayStatus.length ? todayStatus : [{ label: 'No rows', value: 0 }]} />
        </section>
      </div>

      <ModuleList open={modulesOpen} onClose={() => setModulesOpen(false)} />
    </div>
  );
}

function Bars({ rows }: { rows: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  if (rows.length === 0) return <div className={styles.empty}>No records yet</div>;
  return (
    <div>
      {rows.map((row, index) => (
        <div key={row.label} className={styles.barRow}>
          <span className={styles.barLabel}>{row.label}</span>
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{ width: `${Math.max(row.value > 0 ? 4 : 0, (row.value / max) * 100)}%`, animationDelay: `${index * 70}ms` }}
            />
          </div>
          <span className={styles.barValue}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function Trend({ points }: { points: Array<{ label: string; value: number }> }) {
  const width = 520;
  const height = 200;
  const pad = 28;
  const max = Math.max(1, ...points.map((point) => point.value));
  const coords = points.map((point, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(1, points.length - 1);
    const y = height - pad - (point.value / max) * (height - pad * 2);
    return { x, y, ...point };
  });
  const line = coords.map((point) => `${point.x},${point.y}`).join(' ');
  return (
    <svg className={styles.lineWrap} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Attendance this month">
      <polyline className={styles.line} points={line} />
      {coords.map((point, index) => (
        <g key={point.label}>
          <circle className={styles.dot} cx={point.x} cy={point.y} r="4" style={{ animationDelay: `${400 + index * 80}ms` }} />
          <text className={styles.axis} x={point.x} y={height - 8} textAnchor="middle">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Donut({ rows }: { rows: Array<{ label: string; value: number }> }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let cursor = 0;
  return (
    <div className={styles.donutWrap}>
      <svg className={styles.donut} viewBox="0 0 160 160" role="img" aria-label="Leave mix">
        <circle cx="80" cy="80" r={radius} fill="none" stroke={brandColors.primaryLight} strokeWidth="22" />
        {total > 0
          ? rows.map((row, index) => {
              const length = (row.value / total) * circumference;
              const segment = (
                <circle
                  key={row.label}
                  className={styles.donutSeg}
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={DONUT_COLORS[index % DONUT_COLORS.length]}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-cursor}
                />
              );
              cursor += length;
              return segment;
            })
          : null}
      </svg>
      <div className={styles.legend}>
        {rows.map((row, index) => (
          <div key={row.label}>
            <span className={styles.swatch} style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }} />
            {row.label} {row.value}
          </div>
        ))}
      </div>
    </div>
  );
}

function Grouped({ months }: { months: Array<{ label: string; joiners: number; exits: number }> }) {
  const max = Math.max(1, ...months.flatMap((month) => [month.joiners, month.exits]));
  return (
    <div>
      <div className={styles.legendRow}>
        <span><span className={styles.swatch} style={{ background: brandColors.primary }} />Joiners</span>
        <span><span className={styles.swatch} style={{ background: brandColors.secondary }} />Exits</span>
      </div>
      <div className={styles.groupChart}>
        {months.map((month, index) => (
          <div key={month.label} className={styles.monthGroup}>
            <div className={styles.pair}>
              <div className={styles.col} style={{ height: `${(month.joiners / max) * 100}%`, animationDelay: `${index * 60}ms` }} title={`${month.joiners} joiners`} />
              <div className={`${styles.col} ${styles.colAlt}`} style={{ height: `${(month.exits / max) * 100}%`, animationDelay: `${index * 60 + 40}ms` }} title={`${month.exits} exits`} />
            </div>
            <div className={styles.month}>{month.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function monthWeeks(days: Array<{ date: string }>) {
  const start = dayjs().startOf('month');
  return [0, 1, 2, 3, 4].map((week) => {
    const from = start.add(week * 7, 'day');
    const to = from.add(6, 'day');
    const value = days.filter((day) => {
      const date = dayjs(day.date);
      return date.isSame(start, 'month') && !date.isBefore(from, 'day') && !date.isAfter(to, 'day');
    }).length;
    return { label: `W${week + 1}`, value };
  });
}

function monthFlow(
  joiners: Array<{ startDate: string }>,
  exits: Array<{ lastWorkingDay: string }>,
) {
  return [5, 4, 3, 2, 1, 0].map((offset) => {
    const month = dayjs().subtract(offset, 'month');
    return {
      label: month.format('MMM'),
      joiners: joiners.filter((item) => dayjs(item.startDate).isSame(month, 'month')).length,
      exits: exits.filter((item) => dayjs(item.lastWorkingDay).isSame(month, 'month')).length,
    };
  });
}
