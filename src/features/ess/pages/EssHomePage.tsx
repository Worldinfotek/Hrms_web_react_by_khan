import { Card, Col, List, Row, Statistic, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { todayKey, useAttendanceStore } from '@/features/attendance/store';
import { balanceOf, useLeaveStore } from '@/features/leave/store';
import { remaining } from '@/features/leave/types';
import { usePayrollStore } from '@/features/payroll/store';
import { lineNet } from '@/features/payroll/types';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { EmployeeViewGate } from '../components/EmployeeViewGate';
import { useEssStore } from '../store';
import { ESS_EMPLOYEE } from '../types';

export default function EssHomePage() {
  const days = useAttendanceStore((state) => state.days);
  const types = useLeaveStore((state) => state.types);
  const balances = useLeaveStore((state) => state.balances);
  const requests = useLeaveStore((state) => state.requests);
  const runs = usePayrollStore((state) => state.runs);
  const components = usePayrollStore((state) => state.components);
  const announcements = useEssStore((state) => state.announcements);
  const today = days.find((day) => day.employeeCode === ESS_EMPLOYEE.code && day.date === todayKey());
  const pending = requests.filter((item) => item.employeeCode === ESS_EMPLOYEE.code && item.decision === 'Pending');
  const latest = runs.find((run) => run.status !== 'Draft' && run.employees.some((person) => person.employeeCode === ESS_EMPLOYEE.code));
  const mine = latest?.employees.find((person) => person.employeeCode === ESS_EMPLOYEE.code);

  return (
    <>
      <PageHeader title="Employee self-service" subtitle={`${ESS_EMPLOYEE.name} · ${ESS_EMPLOYEE.code}`} />
      <EmployeeViewGate>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Today" value={today?.status ?? 'No row yet'} />
              <Typography.Text type="secondary">{today?.checkIn ? `In ${today.checkIn}` : 'Not checked in'}</Typography.Text>
              <div>
                <Link to="/ess/attendance">My attendance</Link>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Leave balances">
              {types.filter((type) => type.isActive).map((type) => (
                <div key={type.id}>
                  {type.name}: {remaining(balanceOf(balances, ESS_EMPLOYEE.code, type))} left
                </div>
              ))}
              <Link to="/ess/leave">My leave</Link>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Pending leave" value={pending.length} />
              {mine && latest ? (
                <div>
                  Latest payslip {latest.label}: {lineNet(mine.lines, components).toLocaleString()}
                  <div>
                    <Link to={`/ess/payslips/${latest.id}`}>Open payslip</Link>
                  </div>
                </div>
              ) : (
                <Typography.Text type="secondary">Payslip appears after payroll is calculated.</Typography.Text>
              )}
            </Card>
          </Col>
          <Col xs={24}>
            <Card title="Announcements">
              <List
                dataSource={announcements}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta title={item.title} description={`${formatDate(item.date)} — ${item.body}`} />
                  </List.Item>
                )}
              />
              <Link to="/ess/announcements">All announcements</Link>
            </Card>
          </Col>
        </Row>
        <div style={{ marginTop: 16 }}>
          <Tag>
            <Link to="/ess/profile">My profile</Link>
          </Tag>
          <Tag>
            <Link to="/ess/documents">My documents</Link>
          </Tag>
          <Tag>
            <Link to="/ess/requests">HR requests</Link>
          </Tag>
        </div>
      </EmployeeViewGate>
    </>
  );
}
