import { Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { Link } from 'react-router-dom';
import { useEmployees } from '@/features/employees/api/employeesApi';
import { PageHeader } from '@/shared/components';
import { QueueTable } from '../components/QueueTable';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { missingDocuments, type MissingDocumentRow } from '../logic';
import { useDocumentStore } from '../store';

export default function MissingDocumentsPage() {
  const employees = useEmployees({ page: 1, pageSize: 100, sortBy: 'employeeCode', sortOrder: 'asc' });
  const types = useDocumentStore((state) => state.types);
  const documents = useDocumentStore((state) => state.documents);
  const rows = missingDocuments(
    (employees.data?.items ?? []).map((employee) => ({
      id: employee.id,
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      department: employee.department,
    })),
    types,
    documents,
  );

  const columns: TableProps<MissingDocumentRow>['columns'] = [
    {
      title: 'Employee',
      dataIndex: 'fullName',
      render: (name: string, row) => (
        <div>
          <Link to={`/employees/${row.employeeId}?tab=documents`}>{name}</Link>
          <div>
            <Typography.Text type="secondary">{row.employeeCode}</Typography.Text>
          </div>
        </div>
      ),
    },
    { title: 'Department', dataIndex: 'department' },
    {
      title: 'Missing document',
      dataIndex: 'documentType',
      render: (name: string, row) => (
        <div>
          <div>{name}</div>
          <Typography.Text type="secondary">{row.category}</Typography.Text>
        </div>
      ),
    },
    {
      title: '',
      key: 'flag',
      width: 120,
      render: () => <Tag color="red">Missing</Tag>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Missing documents"
        subtitle="Active mandatory document types that are not on the employee file"
      />
      <SampleDataNotice />
      <QueueTable
        loading={employees.isLoading}
        columns={columns}
        data={rows}
        searchText={(row) => `${row.fullName} ${row.employeeCode} ${row.department} ${row.documentType}`}
        empty="Every employee has the mandatory documents"
      />
    </>
  );
}
