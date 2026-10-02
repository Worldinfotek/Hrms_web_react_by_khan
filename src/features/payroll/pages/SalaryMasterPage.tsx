import { Card, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '@/features/employees/api/employeesApi';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { usePayrollStore } from '../store';
import { lineNet, type PayEmployee } from '../types';

/** Read-only salaries for the sample month. A row opens the employee Salary tab. */
export default function SalaryMasterPage() {
  const navigate = useNavigate();
  const access = usePayrollStore((state) => state.payrollAccess);
  const components = usePayrollStore((state) => state.components);
  const structures = usePayrollStore((state) => state.structures);
  const runs = usePayrollStore((state) => state.runs);
  const current = runs.find((run) => run.id === 'run-current') ?? runs[0];
  const directory = useEmployees({ page: 1, pageSize: 100 });
  const people = directory.data?.items ?? [];

  const openSalary = (code: string) => {
    const match = people.find((person) => person.employeeCode === code);
    const id = match?.id ?? Number(code.replace(/\D/g, ''));
    if (id) navigate(`/employees/${id}?tab=salary`);
  };

  const columns: TableProps<PayEmployee>['columns'] = [
    { title: 'Employee', dataIndex: 'employeeName' },
    { title: 'Code', dataIndex: 'employeeCode', width: 140 },
    { title: 'Structure', key: 'structure', render: () => structures[0]?.name ?? 'Monthly staff' },
    {
      title: 'Current salary',
      key: 'net',
      width: 160,
      render: (_, row) => (access ? lineNet(row.lines, components).toLocaleString() : 'Hidden'),
    },
  ];

  return (
    <>
      <PageHeader title="Salary master" subtitle={current ? `Current salary for ${current.label}.` : 'Current salary.'} />
      <SampleDataNotice />
      {!access && (
        <Typography.Paragraph type="secondary">Amounts stay hidden until payroll access is turned on.</Typography.Paragraph>
      )}
      <Card styles={{ body: { padding: 16 } }}>
        <Table<PayEmployee>
          rowKey="employeeCode"
          columns={columns}
          dataSource={current?.employees ?? []}
          pagination={false}
          onRow={(row) => ({ onClick: () => openSalary(row.employeeCode), style: { cursor: 'pointer' } })}
        />
      </Card>
    </>
  );
}
