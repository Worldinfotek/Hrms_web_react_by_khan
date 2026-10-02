import { Button, Card, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { usePayrollStore } from '../store';
import { isRunLocked, type PayrollRun, type RunStatus } from '../types';

const color: Record<RunStatus, string> = {
  Draft: 'default',
  Calculated: 'blue',
  'Under review': 'gold',
  Approved: 'cyan',
  Locked: 'red',
  'Payslips published': 'green',
};

export default function PayrollRunsPage() {
  const navigate = useNavigate();
  const runs = usePayrollStore((state) => state.runs);
  const columns: TableProps<PayrollRun>['columns'] = [
    { title: 'Month', dataIndex: 'label' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: RunStatus) => <Tag color={color[status]}>{status}</Tag>,
    },
    { title: 'People', key: 'count', width: 100, render: (_, row) => row.employees.length },
    {
      title: '',
      key: 'open',
      width: 100,
      render: (_, row) => (
        <Button type="link" onClick={() => navigate(`/payroll/runs/${row.id}`)}>
          {isRunLocked(row.status) ? 'View' : 'Open'}
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Monthly payroll"
        subtitle="This month is open. Last month is locked. The open month includes one overtime line and one unpaid day."
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<PayrollRun> rowKey="id" columns={columns} dataSource={runs} pagination={false} />
      </Card>
    </>
  );
}
