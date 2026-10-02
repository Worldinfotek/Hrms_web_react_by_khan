import { Button, Card, Col, Progress, Row, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useOnboardingStore } from '../store';
import { progressPercent, type Joiner } from '../types';

export default function OnboardingDashboardPage() {
  const navigate = useNavigate();
  const joiners = useOnboardingStore((state) => state.joiners);

  const columns: TableProps<Joiner>['columns'] = [
    { title: 'Joiner', dataIndex: 'name', render: (name: string, row) => (
      <div>
        <div>{name}</div>
        <Typography.Text type="secondary">{row.employeeCode ?? 'Not an employee yet'}</Typography.Text>
      </div>
    ) },
    { title: 'Role', key: 'role', render: (_, row) => `${row.designation} · ${row.department}` },
    { title: 'Started', dataIndex: 'startDate', width: 130, render: (value: string) => formatDate(value) },
    {
      title: 'Progress',
      key: 'progress',
      width: 180,
      render: (_, row) => <Progress percent={progressPercent(row)} size="small" />,
    },
    {
      title: '',
      key: 'open',
      width: 90,
      render: (_, row) => (
        <Button size="small" type="link" onClick={() => navigate(`/onboarding/${row.id}`)}>
          Open
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Onboarding progress" subtitle="Progress for each joiner. Open a person to close a task." />
      <SampleDataNotice />
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {joiners.map((joiner) => {
          const openLaptop = joiner.tasks.some((task) => task.owner === 'IT' && !task.done);
          return (
            <Col xs={24} md={12} key={joiner.id}>
              <Card>
                <Typography.Text strong>{joiner.name}</Typography.Text>
                <div>
                  <Tag color={progressPercent(joiner) === 100 ? 'green' : 'blue'}>{progressPercent(joiner)}%</Tag>
                  {openLaptop && <Tag color="gold">IT laptop open</Tag>}
                  {!joiner.policyAcknowledged && <Tag>Policy not acknowledged</Tag>}
                </div>
                <Typography.Text type="secondary">Started {formatDate(joiner.startDate)} · day {dayjs().diff(dayjs(joiner.startDate), 'day')}</Typography.Text>
              </Card>
            </Col>
          );
        })}
      </Row>
      <Card styles={{ body: { padding: 16 } }}>
        <Table<Joiner> rowKey="id" columns={columns} dataSource={joiners} pagination={false} />
      </Card>
    </>
  );
}
