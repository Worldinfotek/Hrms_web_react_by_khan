import { Button, Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useProbationStore } from '../store';
import type { ProbationCase, ProbationOutcome } from '../types';

function bucket(item: ProbationCase) {
  if (item.outcome !== 'Awaiting') return 'Decided';
  const end = dayjs(item.probationEnd);
  if (end.isBefore(dayjs(), 'day')) return 'Overdue';
  if (!end.isAfter(dayjs().add(30, 'day'), 'day')) return 'Due';
  return 'Later';
}

const outcomeColor: Record<ProbationOutcome, string> = {
  Awaiting: 'blue',
  Confirmed: 'green',
  Extended: 'gold',
  'Not confirmed': 'red',
};

export default function ProbationDashboardPage() {
  const navigate = useNavigate();
  const cases = useProbationStore((state) => state.cases);
  const rows = useMemo(() => cases.map((item) => ({ ...item, bucket: bucket(item) })), [cases]);
  const due = rows.filter((item) => item.bucket === 'Due').length;
  const overdue = rows.filter((item) => item.bucket === 'Overdue').length;

  const columns: TableProps<(typeof rows)[number]>['columns'] = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      render: (name: string, row) => (
        <div>
          <div>{name}</div>
          <Typography.Text type="secondary">{row.employeeCode}</Typography.Text>
        </div>
      ),
    },
    { title: 'Department', dataIndex: 'department' },
    {
      title: 'Probation end',
      key: 'end',
      render: (_, row) => formatDate(row.extendedEnd ?? row.probationEnd),
    },
    {
      title: 'List',
      dataIndex: 'bucket',
      width: 110,
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: 'Outcome',
      dataIndex: 'outcome',
      width: 140,
      render: (value: ProbationOutcome) => <Tag color={outcomeColor[value]}>{value}</Tag>,
    },
    {
      title: '',
      key: 'open',
      width: 90,
      render: (_, row) => (
        <Button size="small" type="link" onClick={() => navigate(`/probation/${row.employeeCode}`)}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Probation" subtitle="People due in the next 30 days, anyone overdue, and decisions already recorded." />
      <SampleDataNotice />
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Due in 30 days" value={due} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Overdue" value={overdue} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Decided" value={rows.filter((item) => item.bucket === 'Decided').length} />
          </Card>
        </Col>
      </Row>
      <Card styles={{ body: { padding: 16 } }}>
        <Table rowKey="employeeCode" columns={columns} dataSource={rows} pagination={false} />
      </Card>
    </>
  );
}
