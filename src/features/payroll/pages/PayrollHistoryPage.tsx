import { Button, Card, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { usePayrollStore } from '../store';
import { isRunLocked, payrollStepLabel, type PayrollRun } from '../types';

/** Locked months only. Opening a row uses the same month screen, which stays read-only. */
export default function PayrollHistoryPage() {
  const navigate = useNavigate();
  const runs = usePayrollStore((state) => state.runs);
  const history = runs.filter((run) => isRunLocked(run.status));

  return (
    <>
      <PageHeader title="Payroll history" subtitle="Locked months. These cannot be edited." />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<PayrollRun>
          rowKey="id"
          pagination={false}
          dataSource={history}
          columns={[
            { title: 'Month', dataIndex: 'label' },
            { title: 'Step', dataIndex: 'status', width: 140, render: (status) => payrollStepLabel(status) },
            { title: 'People', key: 'count', width: 100, render: (_, row) => row.employees.length },
            {
              title: '',
              key: 'open',
              width: 100,
              render: (_, row) => (
                <Button type="link" onClick={() => navigate(`/payroll/runs/${row.id}`)}>
                  View
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
