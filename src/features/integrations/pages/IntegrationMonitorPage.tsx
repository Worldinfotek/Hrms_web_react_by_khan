import { App, Button, Card, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useIntegrationStore } from '../store';
import type { FailedCall, Webhook } from '../types';

export default function IntegrationMonitorPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const webhooks = useIntegrationStore((state) => state.webhooks);
  const failures = useIntegrationStore((state) => state.failures);
  const sendSamplePunch = useIntegrationStore((state) => state.sendSamplePunch);

  return (
    <>
      <PageHeader
        title="Integration monitor"
        subtitle="Failed sample calls, webhooks, and one device punch."
        actions={
          <Button
            type="primary"
            onClick={() => {
              sendSamplePunch();
              message.success('Sample punch recorded for Fatima Noor. It is on today’s attendance board.');
            }}
          >
            Send sample punch
          </Button>
        }
      />
      <SampleDataNotice />
      <Card title="Webhooks" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        <Table<Webhook>
          rowKey="id"
          pagination={false}
          dataSource={webhooks}
          locale={{ emptyText: 'No records yet' }}
          columns={[
            { title: 'Event', dataIndex: 'event' },
            { title: 'URL', dataIndex: 'url' },
            {
              title: 'Last delivery',
              dataIndex: 'delivery',
              width: 140,
              render: (value: Webhook['delivery']) => (
                <Tag color={value === 'Delivered' ? 'green' : value === 'Failed' ? 'red' : 'gold'}>{value}</Tag>
              ),
            },
          ]}
        />
      </Card>
      <Card
        title="Failed calls"
        styles={{ body: { padding: 16 } }}
        extra={
          <Button type="link" onClick={() => navigate('/attendance')}>
            Open attendance
          </Button>
        }
      >
        <Table<FailedCall>
          rowKey="id"
          pagination={false}
          dataSource={failures}
          locale={{ emptyText: 'No records yet' }}
          columns={[
            { title: 'When', dataIndex: 'when', width: 140, render: (value: string) => formatDate(value) },
            { title: 'System', dataIndex: 'system', width: 180 },
            { title: 'Message', dataIndex: 'message' },
          ]}
        />
      </Card>
    </>
  );
}
