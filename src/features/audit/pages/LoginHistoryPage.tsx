import { DatePicker, Select, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';
import { DataTable, PageHeader } from '@/shared/components';
import { useTableQuery } from '@/shared/hooks/useTableQuery';
import { formatDateTime } from '@/shared/utils/format';
import { useLoginHistory } from '../api/auditApi';
import type { LoginHistoryItem } from '../types';

const REASONS: Record<string, string> = {
  InvalidPassword: 'Wrong password',
  UnknownUser: 'Unknown user',
  LockedOut: 'Account locked',
  AccountDisabled: 'Account disabled',
};

type ResultFilter = 'all' | 'success' | 'failed';

export default function LoginHistoryPage() {
  const { query, updateQuery } = useTableQuery({ sortBy: 'occurredAt', sortOrder: 'desc' });
  const [result, setResult] = useState<ResultFilter>('all');
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const history = useLoginHistory({
    ...query,
    succeeded: result === 'all' ? undefined : result === 'success',
    from: range?.[0]?.startOf('day').toISOString(),
    to: range?.[1]?.endOf('day').toISOString(),
  });

  const columns: TableProps<LoginHistoryItem>['columns'] = [
    {
      title: 'When',
      dataIndex: 'occurredAt',
      key: 'occurredAt',
      sorter: true,
      defaultSortOrder: 'descend',
      render: (v: string) => formatDateTime(v),
    },
    { title: 'User', dataIndex: 'userName', key: 'userName', sorter: true },
    {
      title: 'Result',
      dataIndex: 'succeeded',
      key: 'succeeded',
      render: (ok: boolean, row) =>
        ok ? (
          <Tag color="green">Success</Tag>
        ) : (
          <Tag color="red">{REASONS[row.failureReason ?? ''] ?? row.failureReason ?? 'Failed'}</Tag>
        ),
    },
    { title: 'IP address', dataIndex: 'ipAddress', key: 'ipAddress', render: (v: string | null) => v ?? '—' },
    {
      title: 'Device',
      dataIndex: 'userAgent',
      key: 'userAgent',
      render: (v: string | null) => (
        <Typography.Text type="secondary" ellipsis={{ tooltip: v }} style={{ maxWidth: 320 }}>
          {v ?? '—'}
        </Typography.Text>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Login History" subtitle="Every sign-in attempt, successful or not" />
      <DataTable<LoginHistoryItem>
        rowKey="id"
        columns={columns}
        data={history.data?.items}
        meta={history.data?.meta}
        loading={history.isFetching}
        query={query}
        onQueryChange={updateQuery}
        searchPlaceholder="Search user or IP"
        toolbar={
          <>
            <Select<ResultFilter>
              value={result}
              style={{ width: 150 }}
              onChange={(v) => {
                setResult(v);
                updateQuery({ page: 1 });
              }}
              options={[
                { value: 'all', label: 'All results' },
                { value: 'success', label: 'Successful' },
                { value: 'failed', label: 'Failed' },
              ]}
            />
            <DatePicker.RangePicker
              value={range}
              onChange={(value) => {
                setRange(value);
                updateQuery({ page: 1 });
              }}
            />
          </>
        }
      />
    </>
  );
}
