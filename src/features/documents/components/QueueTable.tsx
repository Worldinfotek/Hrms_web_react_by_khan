import { SearchOutlined } from '@ant-design/icons';
import { Card, Input, Table } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import { PageLoader } from '@/shared/components';

export function QueueTable<T extends { key: string }>({
  loading,
  columns,
  data,
  searchText,
  empty,
}: {
  loading: boolean;
  columns: TableProps<T>['columns'];
  data: T[];
  searchText: (row: T) => string;
  empty: string;
}) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const filtered = query ? data.filter((row) => searchText(row).toLowerCase().includes(query)) : data;

  if (loading) return <PageLoader />;

  return (
    <Card styles={{ body: { padding: 16 } }}>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Search employee or document"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        style={{ maxWidth: 320, marginBottom: 16 }}
      />
      <Table<T>
        rowKey="key"
        columns={columns}
        dataSource={filtered}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: empty }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} records` }}
      />
    </Card>
  );
}
