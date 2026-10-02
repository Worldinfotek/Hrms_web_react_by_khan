import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { App, Button, Flex, Select, Tag, Tooltip, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useState, type ReactNode } from 'react';
import { ConfirmAction, DataTable } from '@/shared/components';
import { usePermission } from '@/shared/auth/usePermission';
import { toOptions, useLookups } from '@/shared/lookups/useLookups';
import { useTableQuery } from '@/shared/hooks/useTableQuery';
import { getErrorMessage } from '@/shared/utils/errors';
import { formatDateTime } from '@/shared/utils/format';
import { useMasterList, useMasterMutations } from './masterApi';
import { MasterFormDrawer } from './MasterFormDrawer';
import type { MasterConfig, MasterRecord } from './types';

type StatusFilter = 'all' | 'active' | 'inactive';

interface MasterDataSectionProps<T extends MasterRecord> {
  config: MasterConfig<T>;
  /** Extra buttons in the toolbar (e.g. a view switch). */
  extraToolbar?: ReactNode;
  /** Fixed filter values (e.g. the selected lookup type). */
  fixedFilters?: Record<string, string | number | boolean | undefined>;
}

/**
 * Complete list + create/edit/activate/delete screen for one master-data table,
 * generated from a MasterConfig. Used by every simple master (designations, statuses, lookups …).
 */
export function MasterDataSection<T extends MasterRecord>({
  config,
  extraToolbar,
  fixedFilters,
}: MasterDataSectionProps<T>) {
  const { message } = App.useApp();
  const canCreate = usePermission(config.permissions.Create);
  const canEdit = usePermission(config.permissions.Edit);
  const canDelete = usePermission(config.permissions.Delete);

  const { query, updateQuery } = useTableQuery(config.defaultSort ?? { sortBy: 'name', sortOrder: 'asc' });
  const [status, setStatus] = useState<StatusFilter>('all');
  const [filters, setFilters] = useState<Record<string, number | string | undefined>>({});
  const list = useMasterList<T>(config.queryKey, config.urls, {
    ...query,
    ...filters,
    ...fixedFilters,
    isActive: status === 'all' ? undefined : status === 'active',
  });
  const { changeStatus, remove } = useMasterMutations<T>(config.queryKey, config.urls);
  const filterLookups = useLookups(
    (config.filters ?? []).filter((f) => f.lookupKey).map((f) => f.lookupKey!),
  );
  const [drawer, setDrawer] = useState<{ open: boolean; record?: T }>({ open: false });

  const toggleStatus = (record: T) =>
    changeStatus.mutateAsync({ id: record.id, isActive: !record.isActive }).then(
      () => message.success(`${config.label} ${record.isActive ? 'deactivated' : 'activated'}.`),
      (error) => message.error(getErrorMessage(error)),
    );

  const columns: TableProps<T>['columns'] = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      width: 130,
      render: (code: string) => <Typography.Text code>{code}</Typography.Text>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      defaultSortOrder: config.defaultSort?.sortBy === 'name' || !config.defaultSort ? 'ascend' : undefined,
      render: (_, record) =>
        config.renderName?.(record) ?? (
          <Flex vertical>
            <Flex gap={6} align="center">
              <Typography.Text strong>{record.name}</Typography.Text>
              {record.isSystem && <Tag>System</Tag>}
            </Flex>
            {record.description && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {record.description}
              </Typography.Text>
            )}
          </Flex>
        ),
    },
    ...(config.columns ?? []),
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      sorter: true,
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Updated',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      responsive: ['xl'],
      render: (_, record) => (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {formatDateTime(record.updatedAt ?? record.createdAt)}
        </Typography.Text>
      ),
    },
  ];

  if (canEdit || canDelete) {
    columns.push({
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 130,
      render: (_, record) => {
        const lockStatus = record.isSystem && config.systemCannotDeactivate && record.isActive;
        return (
          <Flex gap={4} justify="flex-end" onClick={(e) => e.stopPropagation()}>
            {canEdit && (
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => setDrawer({ open: true, record })}
                />
              </Tooltip>
            )}
            {canEdit &&
              (lockStatus ? (
                <Tooltip title="System records cannot be deactivated">
                  <Button type="text" icon={<StopOutlined />} disabled />
                </Tooltip>
              ) : (
                <ConfirmAction
                  title={`${record.isActive ? 'Deactivate' : 'Activate'} "${record.name}"?`}
                  description={record.isActive ? 'It will no longer appear in dropdowns.' : undefined}
                  danger={record.isActive}
                  onConfirm={() => toggleStatus(record)}
                >
                  <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
                    <Button
                      type="text"
                      icon={
                        record.isActive ? (
                          <StopOutlined />
                        ) : (
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        )
                      }
                    />
                  </Tooltip>
                </ConfirmAction>
              ))}
            {canDelete &&
              (record.isSystem ? (
                <Tooltip title="System records cannot be deleted">
                  <Button type="text" icon={<DeleteOutlined />} disabled />
                </Tooltip>
              ) : (
                <ConfirmAction
                  title={`Delete "${record.name}"?`}
                  description="Records that are in use cannot be deleted – deactivate them instead."
                  onConfirm={() =>
                    remove.mutateAsync(record.id).then(
                      () => message.success(`${config.label} deleted.`),
                      (error) => message.error(getErrorMessage(error)),
                    )
                  }
                >
                  <Tooltip title="Delete">
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </ConfirmAction>
              ))}
          </Flex>
        );
      },
    });
  }

  return (
    <>
      <DataTable<T>
        rowKey="id"
        columns={columns}
        data={list.data?.items}
        meta={list.data?.meta}
        loading={list.isFetching}
        query={query}
        onQueryChange={updateQuery}
        searchPlaceholder={config.searchPlaceholder ?? 'Search by code or name'}
        onRowClick={canEdit ? (record) => setDrawer({ open: true, record }) : undefined}
        toolbar={
          <>
            {(config.filters ?? []).map((filter) => (
              <Select
                key={filter.name}
                allowClear
                showSearch={{ optionFilterProp: 'label' }}
                placeholder={filter.placeholder}
                style={{ width: filter.width ?? 200 }}
                value={filters[filter.name]}
                onChange={(value) => {
                  setFilters((current) => ({ ...current, [filter.name]: value }));
                  updateQuery({ page: 1 });
                }}
                options={
                  filter.lookupKey ? toOptions(filterLookups.data?.[filter.lookupKey]) : filter.options
                }
              />
            ))}
            <Select<StatusFilter>
              value={status}
              style={{ width: 130 }}
              onChange={(value) => {
                setStatus(value);
                updateQuery({ page: 1 });
              }}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            {extraToolbar}
            {canCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawer({ open: true })}>
                New {config.label.toLowerCase()}
              </Button>
            )}
          </>
        }
      />
      <MasterFormDrawer<T>
        config={config}
        open={drawer.open}
        record={drawer.record}
        onClose={() => setDrawer({ open: false })}
      />
    </>
  );
}
