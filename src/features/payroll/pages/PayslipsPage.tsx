import { Button, Card, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { usePayrollStore } from '../store';
import { lineNet } from '../types';

interface SlipRow {
  key: string;
  month: string;
  runId: string;
  employeeCode: string;
  employeeName: string;
  net: number;
}

/** Payslips already calculated inside a payroll month. */
export default function PayslipsPage() {
  const navigate = useNavigate();
  const access = usePayrollStore((state) => state.payrollAccess);
  const runs = usePayrollStore((state) => state.runs);
  const components = usePayrollStore((state) => state.components);
  const rows: SlipRow[] = runs
    .filter((run) => run.status !== 'Draft')
    .flatMap((run) =>
      run.employees.map((person) => ({
        key: `${run.id}-${person.employeeCode}`,
        month: run.label,
        runId: run.id,
        employeeCode: person.employeeCode,
        employeeName: person.employeeName,
        net: lineNet(person.lines, components),
      })),
    );

  return (
    <>
      <PageHeader title="Payslips" subtitle="One payslip for each employee and month after the month is processed." />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<SlipRow>
          rowKey="key"
          pagination={false}
          dataSource={rows}
          columns={[
            { title: 'Month', dataIndex: 'month' },
            { title: 'Employee', dataIndex: 'employeeName' },
            { title: 'Code', dataIndex: 'employeeCode', width: 140 },
            { title: 'Net', dataIndex: 'net', width: 140, render: (value: number) => (access ? value.toLocaleString() : 'Hidden') },
            {
              title: '',
              key: 'open',
              width: 120,
              render: (_, row) => (
                <Button type="link" onClick={() => navigate(`/payroll/runs/${row.runId}/${row.employeeCode}`)}>
                  Payslip
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
