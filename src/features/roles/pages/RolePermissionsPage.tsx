import { ArrowLeftOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Checkbox, Flex, Table, Tag, Tooltip, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLoader } from '@/shared/components';
import { Permissions } from '@/shared/auth/permissions';
import { usePermission } from '@/shared/auth/usePermission';
import { getErrorMessage } from '@/shared/utils/errors';
import { usePermissionCatalog, useRole, useUpdateRolePermissions } from '../api/rolesApi';
import type { PermissionGroup } from '../types';

const ACTION_ORDER = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export', 'Import'];

/** Permission matrix: modules (rows) × actions (columns). */
export default function RolePermissionsPage() {
  const { id } = useParams();
  const roleId = Number(id);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const canEdit = usePermission(Permissions.Roles.Edit);
  const role = useRole(roleId);
  const catalog = usePermissionCatalog();
  const save = useUpdateRolePermissions();
  // Unsaved edits; null means "show what is saved on the server".
  const [draft, setDraft] = useState<Set<string> | null>(null);

  const actions = useMemo(() => {
    const all = new Set((catalog.data ?? []).flatMap((g) => g.permissions.map((p) => p.action)));
    return [...all].sort((a, b) => {
      const ia = ACTION_ORDER.indexOf(a);
      const ib = ACTION_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [catalog.data]);

  if (role.isLoading || catalog.isLoading) return <PageLoader />;
  if (!role.data || !catalog.data)
    return <Alert type="error" showIcon title="The role could not be loaded." />;

  const readOnly = role.data.isSuperAdmin || !canEdit;
  const original = new Set(role.data.permissions);
  const selected = draft ?? original;
  const dirty = selected.size !== original.size || [...selected].some((p) => !original.has(p));

  const toggle = (codes: string[], checked: boolean) => {
    const next = new Set(selected);
    codes.forEach((code) => (checked ? next.add(code) : next.delete(code)));
    setDraft(next);
  };

  const columns: TableProps<PermissionGroup>['columns'] = [
    {
      title: 'Module',
      key: 'module',
      fixed: 'left',
      render: (_, group) => {
        const codes = group.permissions.map((p) => p.code);
        const count = codes.filter((c) => selected.has(c)).length;
        return (
          <Checkbox
            disabled={readOnly}
            checked={count === codes.length}
            indeterminate={count > 0 && count < codes.length}
            onChange={(e) => toggle(codes, e.target.checked)}
          >
            <Typography.Text strong>{group.displayName}</Typography.Text>
          </Checkbox>
        );
      },
    },
    ...actions.map((action) => ({
      title: action,
      key: action,
      align: 'center' as const,
      render: (_: unknown, group: PermissionGroup) => {
        const permission = group.permissions.find((p) => p.action === action);
        if (!permission) return <Typography.Text type="secondary">—</Typography.Text>;
        return (
          <Tooltip title={permission.description}>
            <Checkbox
              disabled={readOnly}
              checked={selected.has(permission.code)}
              onChange={(e) => toggle([permission.code], e.target.checked)}
            />
          </Tooltip>
        );
      },
    })),
  ];

  const onSave = () =>
    save.mutate(
      { id: roleId, permissions: [...selected] },
      {
        onSuccess: () => {
          setDraft(null);
          message.success('Permissions saved. They apply to signed-in users immediately.');
        },
        onError: (error) => message.error(getErrorMessage(error)),
      },
    );

  return (
    <>
      <PageHeader
        title={`Permissions – ${role.data.name}`}
        subtitle={role.data.description ?? undefined}
        actions={
          <>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/roles')}>
              Back
            </Button>
            {!readOnly && (
              <>
                <Button icon={<UndoOutlined />} disabled={!dirty} onClick={() => setDraft(null)}>
                  Reset
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  disabled={!dirty}
                  loading={save.isPending}
                  onClick={onSave}
                >
                  Save permissions
                </Button>
              </>
            )}
          </>
        }
      />
      {role.data.isSuperAdmin && (
        <Alert
          type="info"
          showIcon
          title="Super Admin always has every permission and cannot be changed."
          style={{ marginBottom: 16 }}
        />
      )}
      <Card styles={{ body: { padding: 16 } }}>
        <Flex gap={8} wrap style={{ marginBottom: 16 }}>
          <Tag color="cyan">Data scope: {role.data.dataScope}</Tag>
          <Tag>{role.data.userCount} user(s)</Tag>
          <Tag color="blue">{selected.size} permission(s) selected</Tag>
          {dirty && <Tag color="orange">Unsaved changes</Tag>}
        </Flex>
        <Table<PermissionGroup>
          rowKey="module"
          columns={columns}
          dataSource={catalog.data}
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </Card>
    </>
  );
}
