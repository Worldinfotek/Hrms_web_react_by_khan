import { SearchOutlined } from '@ant-design/icons';
import { Card, Flex, Input, Table } from 'antd';
import type { TableProps } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import type { ReactNode } from 'react';
import type { PaginationMeta } from '@/api/types';
import type { TableQueryState } from '@/shared/hooks/useTableQuery';

interface DataTableProps<T> {
  rowKey: keyof T & string;
  columns: TableProps<T>['columns'];
  data: T[] | undefined;
  meta: PaginationMeta | undefined;
  loading?: boolean;
  query: TableQueryState;
  onQueryChange: (patch: Partial<TableQueryState>) => void;
  searchPlaceholder?: string;
  /** Extra filters or buttons rendered next to the search box. */
  toolbar?: ReactNode;
  /** Makes rows clickable (e.g. to open a details drawer). */
  onRowClick?: (record: T) => void;
}

/**
 * Standard server-side table used by every list page:
 * paging, sorting and search are sent to the API, not done in the browser.
 */
export function DataTable<T extends object>({
  rowKey,
  columns,
  data,
  meta,
  loading,
  query,
  onQueryChange,
  searchPlaceholder = 'Search…',
  toolbar,
  onRowClick,
}: DataTableProps<T>) {
  const handleChange: TableProps<T>['onChange'] = (pagination, _filters, sorter) => {
    const single = (Array.isArray(sorter) ? sorter[0] : sorter) as SorterResult<T> | undefined;
    const field = single?.order ? String(single.field ?? single.columnKey ?? '') : undefined;
    onQueryChange({
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? query.pageSize,
      sortBy: field || undefined,
      sortOrder: single?.order === 'descend' ? 'desc' : single?.order === 'ascend' ? 'asc' : undefined,
    });
  };

  return (
    <Card styles={{ body: { padding: 16 } }}>
      <Flex justify="space-between" wrap gap={12} style={{ marginBottom: 16 }}>
        <Input.Search
          allowClear
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined />}
          defaultValue={query.search}
          onSearch={(value) => onQueryChange({ search: value || undefined, page: 1 })}
          style={{ maxWidth: 320 }}
        />
        {toolbar && (
          <Flex gap={8} wrap>
            {toolbar}
          </Flex>
        )}
      </Flex>
      <Table<T>
        rowKey={rowKey}
        columns={columns}
        dataSource={data}
        loading={loading}
        onChange={handleChange}
        scroll={{ x: 'max-content' }}
        onRow={
          onRowClick
            ? (record) => ({ onClick: () => onRowClick(record), style: { cursor: 'pointer' } })
            : undefined
        }
        pagination={{
          current: meta?.page ?? query.page,
          pageSize: meta?.pageSize || query.pageSize,
          total: meta?.totalCount ?? 0,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`,
        }}
      />
    </Card>
  );
}
