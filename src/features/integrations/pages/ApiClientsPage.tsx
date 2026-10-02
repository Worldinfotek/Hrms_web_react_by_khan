import { Card, Table, Tag } from 'antd';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useIntegrationStore } from '../store';
import type { ApiClient, ReadinessNote } from '../types';

export default function ApiClientsPage() {
  const clients = useIntegrationStore((state) => state.clients);
  const readiness = useIntegrationStore((state) => state.readiness);

  return (
    <>
      <PageHeader title="API clients" subtitle="Names, scopes, and masked keys. Nothing here can call a real system." />
      <SampleDataNotice />
      <Card title="Clients" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        <Table<ApiClient>
          rowKey="id"
          pagination={false}
          dataSource={clients}
          locale={{ emptyText: 'No records yet' }}
          columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Scopes', dataIndex: 'scopes' },
            { title: 'Key', dataIndex: 'maskedKey' },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 120,
              render: (value: ApiClient['status']) => <Tag color={value === 'Active' ? 'green' : 'default'}>{value}</Tag>,
            },
          ]}
        />
      </Card>
      <Card title="Readiness" styles={{ body: { padding: 16 } }}>
        <Table<ReadinessNote>
          rowKey="name"
          pagination={false}
          dataSource={readiness}
          locale={{ emptyText: 'No records yet' }}
          columns={[
            { title: 'Connection', dataIndex: 'name' },
            { title: 'Status', dataIndex: 'status' },
          ]}
        />
      </Card>
    </>
  );
}
