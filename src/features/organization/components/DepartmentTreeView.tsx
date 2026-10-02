import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  StopOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Dropdown,
  Empty,
  Flex,
  Input,
  Select,
  Skeleton,
  Switch,
  Tag,
  Tooltip,
  Tree,
  Typography,
} from 'antd';
import type { MenuProps, TreeDataNode } from 'antd';
import { useMemo, useState } from 'react';
import { usePermission } from '@/shared/auth/usePermission';
import { Permissions } from '@/shared/auth/permissions';
import { toOptions, useLookups } from '@/shared/lookups/useLookups';
import { MasterFormDrawer, useMasterMutations } from '@/shared/master-data';
import { api } from '@/api/httpClient';
import { getErrorMessage } from '@/shared/utils/errors';
import { departmentConfig } from '../api/organizationConfigs';
import { filterTree, useDepartmentTree } from '../api/departmentsApi';
import type { Department, DepartmentTreeNode } from '../types';

type DrawerState =
  { open: false } | { open: true; record?: Department; initialValues?: Record<string, unknown> };

/**
 * Department hierarchy as a tree: search, show/hide inactive, add sub-departments.
 * The parent of a department is changed from its Edit form.
 */
export function DepartmentTreeView() {
  const { message, modal } = App.useApp();
  const canCreate = usePermission(Permissions.Organization.Create);
  const canEdit = usePermission(Permissions.Organization.Edit);
  const canDelete = usePermission(Permissions.Organization.Delete);

  const lookups = useLookups(['companies']);
  const companies = lookups.data?.companies ?? [];
  const [companyId, setCompanyId] = useState<number>();
  const effectiveCompanyId = companyId ?? companies[0]?.id;
  const [showInactive, setShowInactive] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<React.Key[] | null>(null);
  const [drawer, setDrawer] = useState<DrawerState>({ open: false });

  const tree = useDepartmentTree(effectiveCompanyId, showInactive);
  const { changeStatus, remove } = useMasterMutations<Department>(
    departmentConfig.queryKey,
    departmentConfig.urls,
  );

  const visible = useMemo(() => filterTree(tree.data ?? [], search), [tree.data, search]);
  const allKeys = useMemo(() => collectKeys(visible), [visible]);

  const openEdit = async (id: number) => {
    try {
      const record = await api.get<Department>(`/departments/${id}`);
      setDrawer({ open: true, record });
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const run = (promise: Promise<unknown>, success: string) =>
    promise.then(
      () => message.success(success),
      (error) => message.error(getErrorMessage(error)),
    );

  const nodeMenu = (node: DepartmentTreeNode): MenuProps['items'] => [
    ...(canCreate && node.isActive
      ? [
          {
            key: 'add',
            icon: <PlusOutlined />,
            label: 'Add sub-department',
            onClick: () =>
              setDrawer({ open: true, initialValues: { companyId: node.companyId, parentId: node.id } }),
          },
        ]
      : []),
    ...(canEdit
      ? [
          { key: 'edit', icon: <EditOutlined />, label: 'Edit', onClick: () => void openEdit(node.id) },
          {
            key: 'status',
            icon: node.isActive ? <StopOutlined /> : <CheckCircleOutlined />,
            label: node.isActive ? 'Deactivate' : 'Activate',
            onClick: () =>
              modal.confirm({
                title: `${node.isActive ? 'Deactivate' : 'Activate'} "${node.name}"?`,
                content: node.isActive ? 'Sub-departments and teams must be deactivated first.' : undefined,
                okButtonProps: { danger: node.isActive },
                onOk: () =>
                  run(
                    changeStatus.mutateAsync({ id: node.id, isActive: !node.isActive }),
                    `Department ${node.isActive ? 'deactivated' : 'activated'}.`,
                  ),
              }),
          },
        ]
      : []),
    ...(canDelete
      ? [
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            danger: true,
            label: 'Delete',
            disabled: node.children.length > 0 || node.teamCount > 0,
            onClick: () =>
              modal.confirm({
                title: `Delete "${node.name}"?`,
                okButtonProps: { danger: true },
                okText: 'Delete',
                onOk: () => run(remove.mutateAsync(node.id), 'Department deleted.'),
              }),
          },
        ]
      : []),
  ];

  const toTreeData = (nodes: DepartmentTreeNode[]): TreeDataNode[] =>
    nodes.map((node) => ({
      key: node.id,
      title: (
        <Flex justify="space-between" align="center" gap={8} className="dept-node">
          <Flex gap={8} align="center" wrap>
            <Typography.Text
              strong={!node.parentId}
              type={node.isActive ? undefined : 'secondary'}
              delete={!node.isActive}
            >
              {node.name}
            </Typography.Text>
            <Typography.Text code style={{ fontSize: 11 }}>
              {node.code}
            </Typography.Text>
            {node.teamCount > 0 && (
              <Tooltip title="Teams">
                <Tag icon={<TeamOutlined />} variant="filled">
                  {node.teamCount}
                </Tag>
              </Tooltip>
            )}
            {!node.isActive && <Tag>Inactive</Tag>}
          </Flex>
          {(canCreate || canEdit || canDelete) && (
            <Dropdown menu={{ items: nodeMenu(node) }} trigger={['click']}>
              <Button
                size="small"
                type="text"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Actions for ${node.name}`}
              />
            </Dropdown>
          )}
        </Flex>
      ),
      children: toTreeData(node.children),
    }));

  return (
    <Card styles={{ body: { padding: 16 } }}>
      <Flex justify="space-between" wrap gap={12} style={{ marginBottom: 16 }}>
        <Flex gap={8} wrap align="center">
          <Input.Search
            allowClear
            placeholder="Search departments"
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          {companies.length > 1 && (
            <Select
              style={{ width: 220 }}
              value={effectiveCompanyId}
              onChange={setCompanyId}
              options={toOptions(companies)}
            />
          )}
          <Flex gap={6} align="center">
            <Switch size="small" checked={showInactive} onChange={setShowInactive} />
            <Typography.Text type="secondary">Show inactive</Typography.Text>
          </Flex>
        </Flex>
        <Flex gap={8} wrap>
          <Button onClick={() => setExpanded(expanded?.length ? [] : allKeys)}>
            {expanded?.length ? 'Collapse all' : 'Expand all'}
          </Button>
          {canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setDrawer({ open: true, initialValues: { companyId: effectiveCompanyId } })}
            >
              New department
            </Button>
          )}
        </Flex>
      </Flex>

      {tree.isLoading ? (
        <Skeleton active />
      ) : visible.length === 0 ? (
        <Empty description={search ? 'No department matches your search' : 'No departments yet'} />
      ) : (
        <Tree
          blockNode
          showLine={{ showLeafIcon: false }}
          expandedKeys={search ? allKeys : (expanded ?? allKeys)}
          onExpand={(keys) => setExpanded(keys)}
          treeData={toTreeData(visible)}
          selectable={false}
        />
      )}

      <MasterFormDrawer<Department>
        config={departmentConfig}
        open={drawer.open}
        record={drawer.open ? drawer.record : undefined}
        initialValues={drawer.open ? drawer.initialValues : undefined}
        onClose={() => setDrawer({ open: false })}
      />
    </Card>
  );
}

function collectKeys(nodes: DepartmentTreeNode[]): React.Key[] {
  return nodes.flatMap((n) => [n.id, ...collectKeys(n.children)]);
}
