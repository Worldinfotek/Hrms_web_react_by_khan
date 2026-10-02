import { DeleteOutlined, EditOutlined, PlusOutlined, SafetyOutlined } from '@ant-design/icons';
import { App, Button, Flex, Tag, Tooltip, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmAction, DataTable, PageHeader } from '@/shared/components';
import { Can } from '@/shared/auth/Can';
import { Permissions } from '@/shared/auth/permissions';
import { useTableQuery } from '@/shared/hooks/useTableQuery';
import { getErrorMessage } from '@/shared/utils/errors';
import { useDeleteRole, useRoles } from '../api/rolesApi';
import { RoleFormDrawer } from '../components/RoleFormDrawer';
import type { RoleListItem } from '../types';

const SUPER_ADMIN = 'Super Admin';

export default function RolesPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { query, updateQuery } = useTableQuery({ sortBy: 'name', sortOrder: 'asc' });
  const roles = useRoles(query);
  const deleteRole = useDeleteRole();
  const [drawer, setDrawer] = useState<{ open: boolean; roleId?: number }>({ open: false });

  const columns: TableProps<RoleListItem>['columns'] = [
    {
      title: 'Role',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, role) => (
        <Flex vertical>
          <Flex gap={6} align="center">
            <Typography.Text strong>{role.name}</Typography.Text>
            {role.isSystem && <Tag>System</Tag>}
          </Flex>
          {role.description && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {role.description}
            </Typography.Text>
          )}
        </Flex>
      ),
    },
    {
      title: 'Data scope',
      dataIndex: 'dataScope',
      key: 'dataScope',
      sorter: true,
      render: (v: string) => <Tag color="cyan">{v}</Tag>,
    },
    { title: 'Users', dataIndex: 'userCount', key: 'userCount', align: 'right' },
    {
      title: 'Permissions',
      dataIndex: 'permissionCount',
      key: 'permissionCount',
      align: 'right',
      render: (count: number, role) => (role.name === SUPER_ADMIN ? <Tag color="gold">All</Tag> : count),
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 140,
      render: (_, role) => {
        const isSuperAdmin = role.name === SUPER_ADMIN;
        return (
          <Flex gap={4} justify="flex-end">
            <Tooltip title="Permissions">
              <Button
                type="text"
                icon={<SafetyOutlined />}
                onClick={() => navigate(`/roles/${role.id}/permissions`)}
              />
            </Tooltip>
            <Can permission={Permissions.Roles.Edit}>
              <Tooltip title={isSuperAdmin ? 'Super Admin cannot be edited' : 'Edit'}>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  disabled={isSuperAdmin}
                  onClick={() => setDrawer({ open: true, roleId: role.id })}
                />
              </Tooltip>
            </Can>
            <Can permission={Permissions.Roles.Delete}>
              {role.isSystem || role.userCount > 0 ? (
                <Tooltip title={role.isSystem ? 'System roles cannot be deleted' : 'Assigned to users'}>
                  <Button type="text" icon={<DeleteOutlined />} disabled />
                </Tooltip>
              ) : (
                <ConfirmAction
                  title={`Delete the role "${role.name}"?`}
                  onConfirm={() =>
                    deleteRole.mutateAsync(role.id).then(
                      () => message.success('Role deleted.'),
                      (error) => message.error(getErrorMessage(error)),
                    )
                  }
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </ConfirmAction>
              )}
            </Can>
          </Flex>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Roles group permissions and decide how much data a user can see"
        actions={
          <Can permission={Permissions.Roles.Create}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawer({ open: true })}>
              New role
            </Button>
          </Can>
        }
      />
      <DataTable<RoleListItem>
        rowKey="id"
        columns={columns}
        data={roles.data?.items}
        meta={roles.data?.meta}
        loading={roles.isFetching}
        query={query}
        onQueryChange={updateQuery}
        searchPlaceholder="Search roles"
      />
      <RoleFormDrawer
        open={drawer.open}
        roleId={drawer.roleId}
        onClose={() => setDrawer({ open: false })}
        onCreated={(role) => navigate(`/roles/${role.id}/permissions`)}
      />
    </>
  );
}
