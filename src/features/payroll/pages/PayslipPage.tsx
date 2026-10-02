import { Button, Card, Descriptions, Table, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { usePayrollStore } from '../store';
import { lineNet } from '../types';

export default function PayslipPage() {
  const { runId = '', employeeCode = '' } = useParams();
  const navigate = useNavigate();
  const runs = usePayrollStore((state) => state.runs);
  const components = usePayrollStore((state) => state.components);
  const run = runs.find((item) => item.id === runId);
  const person = run?.employees.find((item) => item.employeeCode === employeeCode);

  if (!run || !person || run.status === 'Draft') {
    return (
      <>
        <PageHeader title="Payslip" />
        <Typography.Paragraph>This payslip is available after the run is calculated.</Typography.Paragraph>
        <Button onClick={() => navigate('/payroll/payslips')}>Payslips</Button>
      </>
    );
  }

  const rows = person.lines.map((line) => ({
    ...line,
    name: components.find((item) => item.id === line.componentId)?.name ?? line.componentId,
    kind: components.find((item) => item.id === line.componentId)?.kind ?? 'Earning',
  }));

  return (
    <>
      <PageHeader
        title={`${person.employeeName} — ${run.label}`}
        subtitle="Payslip"
        actions={<Button onClick={() => navigate('/payroll/payslips')}>Payslips</Button>}
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Descriptions size="small" column={1} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Employee">{person.employeeName}</Descriptions.Item>
          <Descriptions.Item label="Code">{person.employeeCode}</Descriptions.Item>
          <Descriptions.Item label="Net">{lineNet(person.lines, components).toLocaleString()}</Descriptions.Item>
        </Descriptions>
        <Table
          rowKey="componentId"
          pagination={false}
          dataSource={rows}
          columns={[
            { title: 'Component', dataIndex: 'name' },
            { title: 'Kind', dataIndex: 'kind', width: 120 },
            { title: 'Amount', dataIndex: 'amount', width: 140, render: (value: number) => value.toLocaleString() },
            { title: 'Note', dataIndex: 'note', render: (value: string) => value || '—' },
          ]}
        />
      </Card>
    </>
  );
}
