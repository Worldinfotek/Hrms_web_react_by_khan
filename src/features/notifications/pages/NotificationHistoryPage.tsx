import { Card, Select, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useNotificationStore } from '../store';
import type { AppNotification, DeliveryStatus } from '../types';

const STATUSES: Array<DeliveryStatus | 'All'> = ['All', 'Queued', 'Sent', 'Failed'];

export default function NotificationHistoryPage() {
  const notifications = useNotificationStore((state) => state.notifications);
  const [status, setStatus] = useState<DeliveryStatus | 'All'>('All');
  const rows = useMemo(
    () => notifications.filter((item) => status === 'All' || item.delivery === status),
    [notifications, status],
  );

  return (
    <>
      <PageHeader title="Notification history" subtitle="Queued, sent, and failed alerts from the sample events." />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Select
          style={{ minWidth: 200, marginBottom: 16 }}
          value={status}
          onChange={setStatus}
          options={STATUSES.map((value) => ({ value, label: value }))}
        />
        <Table<AppNotification>
          rowKey="id"
          pagination={false}
          dataSource={rows}
          columns={[
            { title: 'When', dataIndex: 'date', width: 140, render: (value: string) => formatDate(value) },
            { title: 'Event', dataIndex: 'event', width: 180 },
            { title: 'Title', dataIndex: 'title' },
            {
              title: 'Delivery',
              dataIndex: 'delivery',
              width: 120,
              render: (value: DeliveryStatus) => (
                <Tag color={value === 'Sent' ? 'green' : value === 'Failed' ? 'red' : 'gold'}>{value}</Tag>
              ),
            },
            {
              title: 'Read',
              dataIndex: 'read',
              width: 100,
              render: (value: boolean) => (value ? 'Read' : 'Unread'),
            },
          ]}
        />
      </Card>
    </>
  );
}
