import { Descriptions, Drawer, Empty, Flex, Skeleton, Table, Tag, Typography } from 'antd';
import { formatDateTime } from '@/shared/utils/format';
import { useAuditLog } from '../api/auditApi';
import { AuditActionTag } from './AuditActionTag';

interface ChangeRow {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

function parse(json: string | null): Record<string, unknown> {
  if (!json) return {};
  try {
    const value: unknown = JSON.parse(json);
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : { value };
  } catch {
    return { value: json };
  }
}

function display(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return <Typography.Text type="secondary">—</Typography.Text>;
  }
  if (Array.isArray(value)) {
    return (
      <Flex wrap gap={4} style={{ maxWidth: 240 }}>
        {value.map((item) => (
          <Tag key={String(item)}>{String(item)}</Tag>
        ))}
      </Flex>
    );
  }
  if (typeof value === 'object') {
    return <Typography.Text code>{JSON.stringify(value)}</Typography.Text>;
  }
  return String(value);
}

/** Full audit entry with a field-by-field before/after comparison. */
export function AuditLogDrawer({ id, onClose }: { id?: number; onClose: () => void }) {
  const entry = useAuditLog(id);
  const oldValues = parse(entry.data?.oldValues ?? null);
  const newValues = parse(entry.data?.newValues ?? null);
  const rows: ChangeRow[] = [...new Set([...Object.keys(oldValues), ...Object.keys(newValues)])].map(
    (field) => ({
      field,
      oldValue: oldValues[field],
      newValue: newValues[field],
    }),
  );

  return (
    <Drawer open={id !== undefined} onClose={onClose} title="Audit entry" size={640} destroyOnHidden>
      {entry.isLoading || !entry.data ? (
        <Skeleton active />
      ) : (
        <>
          <Descriptions column={1} size="small" bordered style={{ marginBottom: 24 }}>
            <Descriptions.Item label="When">{formatDateTime(entry.data.occurredAt)}</Descriptions.Item>
            <Descriptions.Item label="Who">{entry.data.userName ?? 'system'}</Descriptions.Item>
            <Descriptions.Item label="Action">
              <AuditActionTag action={entry.data.action} />
            </Descriptions.Item>
            <Descriptions.Item label="Record">
              {entry.data.entityName} #{entry.data.entityId ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="IP address">{entry.data.ipAddress ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Correlation id">
              <Typography.Text copyable style={{ fontSize: 12 }}>
                {entry.data.correlationId ?? '—'}
              </Typography.Text>
            </Descriptions.Item>
          </Descriptions>
          <Typography.Title level={5}>Changes</Typography.Title>
          {rows.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No field changes recorded" />
          ) : (
            <Table<ChangeRow>
              rowKey="field"
              size="small"
              pagination={false}
              dataSource={rows}
              scroll={{ x: 'max-content' }}
              columns={[
                {
                  title: 'Field',
                  dataIndex: 'field',
                  render: (v: string) => <Typography.Text strong>{v}</Typography.Text>,
                },
                { title: 'Before', dataIndex: 'oldValue', render: display },
                { title: 'After', dataIndex: 'newValue', render: display },
              ]}
            />
          )}
        </>
      )}
    </Drawer>
  );
}
