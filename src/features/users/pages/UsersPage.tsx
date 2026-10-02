import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  LaptopOutlined,
  MoreOutlined,
  PlusOutlined,
  StopOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { App, Button, Dropdown, Flex, Select, Tag, Typography } from 'antd';
import type { MenuProps, TableProps } from 'antd';
import { useState } from 'react';
import { useRoleLookup } from '@/features/roles/api/rolesApi';
import { useAuthStore } from '@/stores/authStore';
import { DataTable, PageHeader, StatusTag } from '@/shared/components';
import { Can } from '@/shared/auth/Can';
import { Permissions } from '@/shared/auth/permissions';
import { usePermission } from '@/shared/auth/usePermission';
import { useTableQuery } from '@/shared/hooks/useTableQuery';
import { getErrorMessage } from '@/shared/utils/errors';
import { formatDateTime } from '@/shared/utils/format';
import {
  useDeleteUser,
  useResetUserPassword,
  useSetUserStatus,
  useUnlockUser,
  useUsers,
} from '../api/usersApi';
import { TemporaryPasswordModal } from '../components/TemporaryPasswordModal';
import { UserFormDrawer } from '../components/UserFormDrawer';
import { UserSessionsModal } from '../components/UserSessionsModal';
import type { UserListItem } from '../types';

type StatusFilter = 'all' | 'active' | 'inactive';

export default function UsersPage() {
  const { message, modal } = App.useApp();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const canEdit = usePermission(Permissions.Users.Edit);
  const canDelete = usePermission(Permissions.Users.Delete);
  const canViewRoles = usePermission(Permissions.Roles.View);

  const { query, updateQuery } = useTableQuery({ sortBy: 'fullName', sortOrder: 'asc' });
  const [status, setStatus] = useState<StatusFilter>('all');
  const [roleId, setRoleId] = useState<number>();
  const users = useUsers({
    ...query,
    isActive: status === 'all' ? undefined : status === 'active',
    roleId,
  });
  const roles = useRoleLookup(canViewRoles);

  const [drawer, setDrawer] = useState<{ open: boolean; userId?: number }>({ open: false });
  const [sessionsFor, setSessionsFor] = useState<UserListItem>();
  const [password, setPassword] = useState<{ title: string; userName: string; value: string | null } | null>(
    null,
  );

  const setUserStatus = useSetUserStatus();
  const resetPassword = useResetUserPassword();
  const unlock = useUnlockUser();
  const deleteUser = useDeleteUser();

  const run = (promise: Promise<unknown>, success: string) =>
    promise.then(
      () => message.success(success),
      (error) => message.error(getErrorMessage(error)),
    );

  const actionsFor = (user: UserListItem): MenuProps['items'] => {
    const isSelf = user.id === currentUserId;
    return [
      { key: 'sessions', icon: <LaptopOutlined />, label: 'Active sessions' },
      ...(canEdit
        ? [
            { key: 'reset', icon: <KeyOutlined />, label: 'Reset password' },
            ...(user.isLockedOut
              ? [{ key: 'unlock', icon: <UnlockOutlined />, label: 'Unlock account' }]
              : []),
            user.isActive
              ? { key: 'deactivate', icon: <StopOutlined />, label: 'Deactivate', disabled: isSelf }
              : { key: 'activate', icon: <CheckCircleOutlined />, label: 'Activate' },
          ]
        : []),
      ...(canDelete
        ? [
            { type: 'divider' as const },
            { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true, disabled: isSelf },
          ]
        : []),
    ];
  };

  const onAction = (user: UserListItem, key: string) => {
    switch (key) {
      case 'sessions':
        setSessionsFor(user);
        break;
      case 'reset':
        modal.confirm({
          title: `Reset password for ${user.fullName}?`,
          content: 'A temporary password will be generated and the user will be signed out of all devices.',
          okText: 'Reset password',
          onOk: () =>
            resetPassword.mutateAsync({ id: user.id }).then(
              (result) =>
                setPassword({
                  title: 'Password reset',
                  userName: user.userName,
                  value: result.temporaryPassword,
                }),
              (error) => message.error(getErrorMessage(error)),
            ),
        });
        break;
      case 'unlock':
        void run(unlock.mutateAsync(user.id), 'Account unlocked.');
        break;
      case 'activate':
        void run(setUserStatus.mutateAsync({ id: user.id, isActive: true }), 'User activated.');
        break;
      case 'deactivate':
        modal.confirm({
          title: `Deactivate ${user.fullName}?`,
          content: 'The user will be signed out immediately and will not be able to sign in.',
          okText: 'Deactivate',
          okButtonProps: { danger: true },
          onOk: () => run(setUserStatus.mutateAsync({ id: user.id, isActive: false }), 'User deactivated.'),
        });
        break;
      case 'delete':
        modal.confirm({
          title: `Delete ${user.fullName}?`,
          content: 'The account will be removed. History and audit records are kept.',
          okText: 'Delete',
          okButtonProps: { danger: true },
          onOk: () => run(deleteUser.mutateAsync(user.id), 'User deleted.'),
        });
        break;
    }
  };

  const columns: TableProps<UserListItem>['columns'] = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, user) => (
        <Flex vertical>
          <Typography.Text strong>{user.fullName}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            @{user.userName}
          </Typography.Text>
        </Flex>
      ),
    },
    { title: 'E-mail', dataIndex: 'email', key: 'email', sorter: true },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roleNames: string[]) => (
        <Flex wrap gap={4}>
          {roleNames.map((name) => (
            <Tag key={name} color={name === 'Super Admin' ? 'gold' : 'blue'}>
              {name}
            </Tag>
          ))}
        </Flex>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, user) => (
        <Flex wrap gap={4}>
          <StatusTag status={user.isActive ? 'Active' : 'Inactive'} />
          {user.isLockedOut && <Tag color="red">Locked</Tag>}
          {user.mustChangePassword && <Tag color="orange">Password change pending</Tag>}
        </Flex>
      ),
    },
    {
      title: 'Last sign-in',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      sorter: true,
      render: (value: string | null) =>
        value ? formatDateTime(value) : <Typography.Text type="secondary">Never</Typography.Text>,
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 96,
      render: (_, user) => (
        <Flex gap={4} justify="flex-end">
          <Can permission={Permissions.Users.Edit}>
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label="Edit user"
              onClick={() => setDrawer({ open: true, userId: user.id })}
            />
          </Can>
          <Dropdown
            trigger={['click']}
            menu={{ items: actionsFor(user), onClick: ({ key }) => onAction(user, key) }}
          >
            <Button type="text" icon={<MoreOutlined />} aria-label="More actions" />
          </Dropdown>
        </Flex>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Manage who can sign in and what they can access"
        actions={
          <Can permission={Permissions.Users.Create}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawer({ open: true })}>
              Add user
            </Button>
          </Can>
        }
      />
      <DataTable<UserListItem>
        rowKey="id"
        columns={columns}
        data={users.data?.items}
        meta={users.data?.meta}
        loading={users.isFetching}
        query={query}
        onQueryChange={updateQuery}
        searchPlaceholder="Search name, username or e-mail"
        toolbar={
          <>
            <Select<StatusFilter>
              value={status}
              style={{ width: 140 }}
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
            {canViewRoles && (
              <Select<number>
                allowClear
                placeholder="All roles"
                style={{ width: 180 }}
                value={roleId}
                onChange={(value) => {
                  setRoleId(value);
                  updateQuery({ page: 1 });
                }}
                options={(roles.data ?? []).map((r) => ({ value: r.id, label: r.name }))}
              />
            )}
          </>
        }
      />

      <UserFormDrawer
        open={drawer.open}
        userId={drawer.userId}
        onClose={() => setDrawer({ open: false })}
        onCreated={(result) => {
          message.success('User created.');
          if (result.temporaryPassword) {
            setPassword({
              title: 'User created',
              userName: result.user.userName,
              value: result.temporaryPassword,
            });
          }
        }}
      />
      <UserSessionsModal
        userId={sessionsFor?.id}
        userName={sessionsFor?.fullName}
        onClose={() => setSessionsFor(undefined)}
      />
      <TemporaryPasswordModal
        open={!!password?.value}
        title={password?.title ?? ''}
        userName={password?.userName}
        password={password?.value ?? null}
        onClose={() => setPassword(null)}
      />
    </>
  );
}
