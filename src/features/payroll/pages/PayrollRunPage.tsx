import { App, Alert, Button, Card, Flex, Steps, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { usePayrollStore } from '../store';
import { RUN_FLOW, isRunLocked, lineNet, payrollStepIndex, payrollStepLabel, PAYROLL_STEP_LABELS, type PayEmployee } from '../types';

export default function PayrollRunPage() {
  const { message } = App.useApp();
  const { runId = '' } = useParams();
  const navigate = useNavigate();
  const runs = usePayrollStore((state) => state.runs);
  const components = usePayrollStore((state) => state.components);
  const advance = usePayrollStore((state) => state.advance);
  const run = runs.find((item) => item.id === runId);
  if (!run) {
    return (
      <>
        <PageHeader title="Monthly payroll" />
        <Button onClick={() => navigate('/payroll')}>Monthly payroll</Button>
      </>
    );
  }

  const locked = isRunLocked(run.status) || run.id === 'run-last';
  const next = RUN_FLOW[RUN_FLOW.indexOf(run.status) + 1];

  const columns: TableProps<PayEmployee>['columns'] = [
    { title: 'Employee', dataIndex: 'employeeName', render: (name: string, row) => (
      <div>
        <div>{name}</div>
        <Typography.Text type="secondary">{row.employeeCode}</Typography.Text>
      </div>
    ) },
    {
      title: 'Notes',
      key: 'notes',
      render: (_, row) => row.lines.filter((line) => line.note).map((line) => line.note).join(' ') || '—',
    },
    {
      title: 'Net',
      key: 'net',
      width: 120,
      render: (_, row) => lineNet(row.lines, components).toLocaleString(),
    },
    {
      title: 'Last month',
      dataIndex: 'lastNet',
      width: 120,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Variance',
      key: 'variance',
      width: 120,
      render: (_, row) => {
        const diff = lineNet(row.lines, components) - row.lastNet;
        return <Tag color={diff < 0 ? 'red' : diff > 0 ? 'green' : 'default'}>{diff.toLocaleString()}</Tag>;
      },
    },
    {
      title: '',
      key: 'slip',
      width: 110,
      render: (_, row) =>
        run.status === 'Draft' ? (
          <Typography.Text type="secondary">After calculate</Typography.Text>
        ) : (
          <Button type="link" onClick={() => navigate(`/payroll/runs/${run.id}/${row.employeeCode}`)}>
            Payslip
          </Button>
        ),
    },
  ];

  return (
    <>
      <PageHeader title={run.label} subtitle={payrollStepLabel(run.status)} actions={<Button onClick={() => navigate('/payroll')}>Monthly payroll</Button>} />
      <SampleDataNotice />
      <Steps
        style={{ marginBottom: 16 }}
        current={payrollStepIndex(run.status)}
        items={PAYROLL_STEP_LABELS.map((title) => ({ title }))}
      />
      {locked && <Alert type="warning" showIcon style={{ marginBottom: 16 }} title="This payroll run is locked and cannot be edited." />}
      <Flex gap={8} wrap style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          disabled={!next || run.id === 'run-last' || run.status === 'Payslips published'}
          onClick={() => {
            const error = advance(run.id);
            if (error) message.error(error);
            else if (run.status === 'Draft') message.success('Payroll calculated.');
            else if (next) message.success(`Moved to ${payrollStepLabel(next)}.`);
          }}
        >
          {run.status === 'Draft' ? 'Calculate' : next ? `Move to ${payrollStepLabel(next)}` : 'Finished'}
        </Button>
        <Button
          disabled={locked}
          onClick={() => message.info(locked ? 'This payroll run is locked and cannot be edited.' : 'Sample amounts come from the salary structure.')}
        >
          Edit amounts
        </Button>
        <Button onClick={() => downloadSheet(run, components)}>Download sample bank sheet</Button>
        <Button onClick={() => navigate('/reports?report=payroll-summary')}>Payroll summary</Button>
      </Flex>
      <Card styles={{ body: { padding: 16 } }}>
        <Table<PayEmployee> rowKey="employeeCode" columns={columns} dataSource={run.employees} pagination={false} />
      </Card>
    </>
  );
}

function downloadSheet(run: PayrollRunLike, components: { id: string; kind: 'Earning' | 'Deduction'; name: string }[]) {
  const header = 'SAMPLE FILE - not a live bank transfer';
  const rows = run.employees.map((person) => {
    const net = person.lines.reduce((sum, line) => {
      const component = components.find((item) => item.id === line.componentId);
      if (!component) return sum;
      return component.kind === 'Earning' ? sum + line.amount : sum - line.amount;
    }, 0);
    return `${person.employeeCode},${person.employeeName},${net}`;
  });
  const blob = new Blob([[header, 'Employee code,Employee name,Net pay', ...rows].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `sample-bank-sheet-${run.month}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

interface PayrollRunLike {
  month: string;
  employees: PayEmployee[];
}
