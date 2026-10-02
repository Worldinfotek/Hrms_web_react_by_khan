import { Button, Card, Table, Typography } from 'antd';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePayrollStore } from '@/features/payroll/store';
import { lineNet } from '@/features/payroll/types';
import { PageHeader } from '@/shared/components';
import { EmployeeViewGate } from '../components/EmployeeViewGate';
import { ESS_EMPLOYEE } from '../types';

export default function EssPayslipsPage() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const runs = usePayrollStore((state) => state.runs);
  const components = usePayrollStore((state) => state.components);
  const slips = useMemo(
    () =>
      runs
        .filter((run) => run.status !== 'Draft')
        .map((run) => ({ run, person: run.employees.find((item) => item.employeeCode === ESS_EMPLOYEE.code) }))
        .filter((item) => item.person),
    [runs],
  );
  const selected = runId ? slips.find((item) => item.run.id === runId) : undefined;

  return (
    <>
      <PageHeader title="My payslips" subtitle={`${ESS_EMPLOYEE.name} only`} />
      <EmployeeViewGate>
        {selected?.person ? (
          <Card
            title={selected.run.label}
            extra={<Button onClick={() => navigate('/ess/payslips')}>All payslips</Button>}
            styles={{ body: { padding: 16 } }}
          >
            <Typography.Title level={4}>{lineNet(selected.person.lines, components).toLocaleString()}</Typography.Title>
            {selected.person.lines.map((line) => (
              <div key={line.componentId}>
                {components.find((item) => item.id === line.componentId)?.name}: {line.amount.toLocaleString()}
                {line.note ? <Typography.Text type="secondary"> — {line.note}</Typography.Text> : null}
              </div>
            ))}
          </Card>
        ) : (
          <Card styles={{ body: { padding: 16 } }}>
            <Table
              rowKey={(row) => row.run.id}
              pagination={false}
              dataSource={slips}
              locale={{ emptyText: 'No payslip yet. Calculate the open payroll run first. Last month is already locked.' }}
              columns={[
                { title: 'Month', render: (_, row) => row.run.label },
                { title: 'Status', render: (_, row) => row.run.status },
                {
                  title: 'Net',
                  render: (_, row) => (row.person ? lineNet(row.person.lines, components).toLocaleString() : '—'),
                },
                {
                  title: '',
                  render: (_, row) => (
                    <Button type="link" onClick={() => navigate(`/ess/payslips/${row.run.id}`)}>
                      Open
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        )}
      </EmployeeViewGate>
    </>
  );
}
