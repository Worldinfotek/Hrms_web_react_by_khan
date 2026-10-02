import { Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { Link } from 'react-router-dom';
import { useEmployees } from '@/features/employees/api/employeesApi';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { QueueTable } from '../components/QueueTable';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { expiringDocuments, type ExpiringDocumentRow } from '../logic';
import { useDocumentStore } from '../store';

export default function ExpiringDocumentsPage() {
  const employees = useEmployees({ page: 1, pageSize: 100, sortBy: 'employeeCode', sortOrder: 'asc' });
  const types = useDocumentStore((state) => state.types);
  const documents = useDocumentStore((state) => state.documents);
  const byCode = new Map((employees.data?.items ?? []).map((employee) => [employee.employeeCode, employee]));
  const rows = expiringDocuments(documents, types);

  const columns: TableProps<ExpiringDocumentRow>['columns'] = [
    {
      title: 'Employee',
      dataIndex: 'employeeCode',
      render: (code: string) => {
        const employee = byCode.get(code);
        return (
          <div>
            {employee ? <Link to={`/employees/${employee.id}?tab=documents`}>{employee.fullName}</Link> : code}
            <div>
              <Typography.Text type="secondary">{code}</Typography.Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Document',
      dataIndex: 'documentType',
      render: (name: string, row) => (
        <div>
          <span>
            {name} {row.sensitive && <Tag color="gold">Sensitive</Tag>}
          </span>
          <div>
            <Typography.Text type="secondary">{row.documentNumber}</Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Expiry',
      dataIndex: 'expiryDate',
      width: 160,
      render: (value: string) => formatDate(value),
    },
    {
      title: 'Status',
      dataIndex: 'daysLeft',
      width: 180,
      render: (days: number) =>
        days < 0 ? (
          <Tag color="red">Expired {Math.abs(days)} days ago</Tag>
        ) : days === 0 ? (
          <Tag color="orange">Expires today</Tag>
        ) : (
          <Tag color="orange">Expires in {days} days</Tag>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Expiring documents"
        subtitle="Documents that expire within the next 30 days, including those already expired"
      />
      <SampleDataNotice />
      <QueueTable
        loading={employees.isLoading}
        columns={columns}
        data={rows}
        searchText={(row) =>
          `${row.employeeCode} ${byCode.get(row.employeeCode)?.fullName ?? ''} ${row.documentType} ${row.documentNumber}`
        }
        empty="No documents expire in the next 30 days"
      />
    </>
  );
}
