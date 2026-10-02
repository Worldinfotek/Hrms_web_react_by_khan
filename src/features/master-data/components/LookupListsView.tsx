import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Empty, Flex, Input, Row, Skeleton, Tag, Tooltip, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { usePermission } from '@/shared/auth/usePermission';
import { Permissions } from '@/shared/auth/permissions';
import { MasterDataSection, MasterFormDrawer, useMasterList } from '@/shared/master-data';
import type { MasterConfig } from '@/shared/master-data';
import { lookupTypeConfig, lookupValueConfig } from '../api/masterDataConfigs';
import type { LookupType, LookupValue } from '../types';

/** Two panes: the lookup lists on the left, the values of the selected list on the right. */
export function LookupListsView() {
  const canCreate = usePermission(Permissions.MasterData.Create);
  const canEdit = usePermission(Permissions.MasterData.Edit);
  const types = useMasterList<LookupType>(lookupTypeConfig.queryKey, lookupTypeConfig.urls, {
    page: 1,
    pageSize: 100,
    sortBy: 'name',
  });
  const [selectedId, setSelectedId] = useState<number>();
  const [filter, setFilter] = useState('');
  const [drawer, setDrawer] = useState<{ open: boolean; record?: LookupType }>({ open: false });

  const all = useMemo(() => types.data?.items ?? [], [types.data]);
  const selected = all.find((t) => t.id === selectedId) ?? all[0];
  const visible = all.filter(
    (t) =>
      !filter ||
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.code.toLowerCase().includes(filter.toLowerCase()),
  );

  // The parent list's key for GET /lookups (keys are matched loosely, so the code works: City → "COUNTRY").
  const parentKey = selected?.parentTypeId
    ? all.find((t) => t.id === selected.parentTypeId)?.code
    : undefined;

  // The type form offers the other lists as possible parents.
  const typeConfig: MasterConfig<LookupType> = useMemo(
    () => ({
      ...lookupTypeConfig,
      fields: lookupTypeConfig.fields.map((f) =>
        f.name === 'parentTypeId'
          ? { ...f, options: all.filter((t) => !t.parentTypeId).map((t) => ({ value: t.id, label: t.name })) }
          : f,
      ),
    }),
    [all],
  );

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8} lg={7}>
        <Card
          title="Lists"
          styles={{ body: { padding: 8 } }}
          extra={
            canCreate && (
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setDrawer({ open: true })}
              >
                New list
              </Button>
            )
          }
        >
          <Input.Search
            allowClear
            placeholder="Filter lists"
            onChange={(e) => setFilter(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          {types.isLoading ? (
            <Skeleton active />
          ) : visible.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No lists" />
          ) : (
            <Flex vertical gap={2} role="listbox" aria-label="Lookup lists">
              {visible.map((type) => {
                const active = type.id === selected?.id;
                return (
                  <Flex
                    key={type.id}
                    role="option"
                    aria-selected={active}
                    tabIndex={0}
                    className="lookup-type-item"
                    justify="space-between"
                    align="center"
                    gap={8}
                    onClick={() => setSelectedId(type.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedId(type.id)}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: active ? 'var(--ant-color-primary-bg, rgba(22,119,255,0.08))' : undefined,
                    }}
                  >
                    <Flex vertical style={{ minWidth: 0 }}>
                      <Flex gap={6} align="center">
                        <Typography.Text strong={active} ellipsis>
                          {type.name}
                        </Typography.Text>
                        {!type.isActive && <Tag>Inactive</Tag>}
                      </Flex>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {type.code}
                        {type.parentTypeName ? ` · under ${type.parentTypeName}` : ''}
                      </Typography.Text>
                    </Flex>
                    <Flex gap={4} align="center">
                      <Badge count={type.valueCount} showZero color="#8c8c8c" overflowCount={999} />
                      {canEdit && (
                        <Tooltip title="Edit list">
                          <Button
                            size="small"
                            type="text"
                            icon={<EditOutlined />}
                            aria-label={`Edit ${type.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawer({ open: true, record: type });
                            }}
                          />
                        </Tooltip>
                      )}
                    </Flex>
                  </Flex>
                );
              })}
            </Flex>
          )}
        </Card>
      </Col>
      <Col xs={24} md={16} lg={17}>
        {selected ? (
          <>
            <Flex align="baseline" gap={8} style={{ marginBottom: 12 }} wrap>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {selected.name}
              </Typography.Title>
              {selected.isSystem && <Tag>System list</Tag>}
              {selected.description && (
                <Typography.Text type="secondary">{selected.description}</Typography.Text>
              )}
            </Flex>
            <MasterDataSection<LookupValue>
              key={selected.id}
              config={lookupValueConfig(selected, parentKey)}
            />
          </>
        ) : (
          <Card>
            <Empty description="Select a list" />
          </Card>
        )}
      </Col>
      <MasterFormDrawer<LookupType>
        config={typeConfig}
        open={drawer.open}
        record={drawer.record}
        onClose={() => setDrawer({ open: false })}
        onSaved={(saved) => setSelectedId(saved.id)}
      />
    </Row>
  );
}
