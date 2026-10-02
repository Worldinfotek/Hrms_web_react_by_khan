import { DatePicker, Flex, Select, Typography } from 'antd';
import type { TableProps } from 'antd';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';
import { DataTable, PageHeader } from '@/shared/components';
import { useTableQuery } from '@/shared/hooks/useTableQuery';
import { formatDateTime } from '@/shared/utils/format';
import { useAuditLogs } from '../api/auditApi';
import { AuditActionTag } from '../components/AuditActionTag';
import { AuditLogDrawer } from '../components/AuditLogDrawer';
import type { AuditLogListItem } from '../types';

const ENTITY_OPTIONS = ['User', 'Role'].map((value) => ({ value, label: value }));
const ACTION_OPTIONS = [
  'Create',
  'Update',
  'Delete',
  'User.RolesAssigned',
  'User.RolesChanged',
  'User.PasswordChanged',
  'User.PasswordReset',
  'User.PasswordResetByAdmin',
  'User.SessionsRevoked',
  'Role.PermissionsChanged',
].map((value) => ({ value, label: value }));

export default function AuditLogsPage() {
  const { query, updateQuery } = useTableQuery({ sortBy: 'occurredAt', sortOrder: 'desc' });
  const [entityName, setEntityName] = useState<string>();
  const [action, setAction] = useState<string>();
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedId, setSelectedId] = useState<number>();

  const logs = useAuditLogs({
    ...query,
    entityName,
    action,
    from: range?.[0]?.startOf('day').toISOString(),
    to: range?.[1]?.endOf('day').toISOString(),
  });

  const columns: TableProps<AuditLogListItem>['columns'] = [
    {
      title: 'When',
      dataIndex: 'occurredAt',
      key: 'occurredAt',
      sorter: true,
      defaultSortOrder: 'descend',
      render: (v: string) => formatDateTime(v),
    },
    { title: 'User', dataIndex: 'userName', key: 'userName', render: (v: string | null) => v ?? 'system' },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (v: string) => <AuditActionTag action={v} />,
    },
    {
      title: 'Record',
      key: 'record',
      render: (_, row) => (
        <Typography.Text>
          {row.entityName} <Typography.Text type="secondary">#{row.entityId ?? '—'}</Typography.Text>
        </Typography.Text>
      ),
    },
    {
      title: 'Changed fields',
      dataIndex: 'changedColumns',
      key: 'changedColumns',
      render: (v: string | null) => (
        <Typography.Text type="secondary" ellipsis={{ tooltip: v }} style={{ maxWidth: 260 }}>
          {v?.replaceAll(',', ', ') ?? '—'}
        </Typography.Text>
      ),
    },
    { title: 'IP address', dataIndex: 'ipAddress', key: 'ipAddress', render: (v: string | null) => v ?? '—' },
  ];

  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Who changed what, and when" />
      <DataTable<AuditLogListItem>
        rowKey="id"
        columns={columns}
        data={logs.data?.items}
        meta={logs.data?.meta}
        loading={logs.isFetching}
        query={query}
        onQueryChange={updateQuery}
        searchPlaceholder="Search action, record or user"
        toolbar={
          <Flex gap={8} wrap>
            <Select
              allowClear
              placeholder="All records"
              style={{ width: 140 }}
              options={ENTITY_OPTIONS}
              value={entityName}
              onChange={(v) => {
                setEntityName(v);
                updateQuery({ page: 1 });
              }}
            />
            <Select
              allowClear
              showSearch
              placeholder="All actions"
              style={{ width: 220 }}
              options={ACTION_OPTIONS}
              value={action}
              onChange={(v) => {
                setAction(v);
                updateQuery({ page: 1 });
              }}
            />
            <DatePicker.RangePicker
              value={range}
              onChange={(value) => {
                setRange(value);
                updateQuery({ page: 1 });
              }}
            />
          </Flex>
        }
        onRowClick={(row) => setSelectedId(row.id)}
      />
      <AuditLogDrawer id={selectedId} onClose={() => setSelectedId(undefined)} />
    </>
  );
}
