import { Card, Select, Table } from 'antd';
import { useState } from 'react';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { usePayrollStore } from '../store';

export default function PayrollSummaryPage() {
  const runs = usePayrollStore((state) => state.runs);
  const components = usePayrollStore((state) => state.components);
  const [runId, setRunId] = useState(runs[0]?.id ?? 'run-current');
  const run = runs.find((item) => item.id === runId) ?? runs[0];
  const totals = components.map((component) => ({
    id: component.id,
    name: component.name,
    kind: component.kind,
    total: (run?.employees ?? []).reduce((sum, person) => {
      const line = person.lines.find((item) => item.componentId === component.id);
      return sum + (line?.amount ?? 0);
    }, 0),
  }));

  return (
    <>
      <PageHeader title="Payroll summary" subtitle="Component totals only. Individual amounts stay on the run and the payslip." />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        <Select
          style={{ minWidth: 240 }}
          value={run?.id}
          onChange={setRunId}
          options={runs.map((item) => ({ value: item.id, label: `${item.label} (${item.status})` }))}
        />
      </Card>
      <Card styles={{ body: { padding: 16 } }}>
        <Table
          rowKey="id"
          pagination={false}
          dataSource={totals}
          columns={[
            { title: 'Component', dataIndex: 'name' },
            { title: 'Kind', dataIndex: 'kind', width: 140 },
            { title: 'Total', dataIndex: 'total', width: 160, render: (value: number) => value.toLocaleString() },
          ]}
        />
      </Card>
    </>
  );
}
