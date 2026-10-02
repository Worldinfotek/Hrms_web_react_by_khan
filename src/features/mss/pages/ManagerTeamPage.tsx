import { Card, Table, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useEmployees } from '@/features/employees/api/employeesApi';
import { PageHeader } from '@/shared/components';
import { ManagerViewGate } from '../components/ManagerViewGate';
import { TEAM } from '../team';

export default function ManagerTeamPage() {
  const employees = useEmployees({ page: 1, pageSize: 100, sortBy: 'fullName', sortOrder: 'asc' });
  const rows = TEAM.map((person) => ({
    ...person,
    id: employees.data?.items.find((item) => item.employeeCode === person.code)?.id,
  }));

  return (
    <>
      <PageHeader title="Team directory" subtitle="Direct reports of Usman Khan." />
      <ManagerViewGate>
        <Card styles={{ body: { padding: 16 } }}>
          <Table
            rowKey="code"
            pagination={false}
            dataSource={rows}
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                render: (name: string, row) =>
                  row.id ? <Link to={`/employees/${row.id}`}>{name}</Link> : <span>{name}</span>,
              },
              { title: 'Code', dataIndex: 'code' },
              { title: 'Designation', dataIndex: 'designation' },
            ]}
          />
          <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
            Hira Shah, Ali Raza, and Hamza Yousaf report to Usman on the sample org chart.
          </Typography.Paragraph>
        </Card>
      </ManagerViewGate>
    </>
  );
}
