import { Alert, App, Form, Input, Select, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { FormDrawer } from '@/shared/components';
import { applyFormErrors, getErrorMessage } from '@/shared/utils/errors';
import { useCreateRole, useRole, useUpdateRole } from '../api/rolesApi';
import { DATA_SCOPE_OPTIONS, type RoleDetail, type SaveRoleRequest } from '../types';

interface RoleFormDrawerProps {
  open: boolean;
  roleId?: number;
  onClose: () => void;
  onCreated?: (role: RoleDetail) => void;
}

export function RoleFormDrawer({ open, roleId, onClose, onCreated }: RoleFormDrawerProps) {
  const isEdit = roleId !== undefined;
  const [form] = Form.useForm<SaveRoleRequest>();
  const { message } = App.useApp();
  const [error, setError] = useState<string | null>(null);
  const role = useRole(open ? roleId : undefined);
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (isEdit && role.data) {
      form.setFieldsValue({
        name: role.data.name,
        description: role.data.description,
        dataScope: role.data.dataScope,
      });
    }
  }, [open, isEdit, role.data, form]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    setError(null);
    const onError = (err: unknown) => {
      if (!applyFormErrors(form, err)) setError(getErrorMessage(err));
    };

    if (isEdit) {
      updateRole.mutate(
        { id: roleId, request: values },
        {
          onSuccess: () => {
            message.success('Role updated.');
            handleClose();
          },
          onError,
        },
      );
    } else {
      createRole.mutate(
        { ...values, permissions: [] },
        {
          onSuccess: (created) => {
            message.success('Role created. Now choose its permissions.');
            handleClose();
            onCreated?.(created);
          },
          onError,
        },
      );
    }
  };

  return (
    <FormDrawer
      open={open}
      title={isEdit ? 'Edit role' : 'New role'}
      onClose={handleClose}
      onSubmit={onSubmit}
      submitting={createRole.isPending || updateRole.isPending}
      submitText={isEdit ? 'Save changes' : 'Create role'}
      width={480}
    >
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {role.data?.isSystem && (
        <Alert
          type="info"
          showIcon
          title="System role – the name cannot be changed."
          style={{ marginBottom: 16 }}
        />
      )}
      <Form form={form} layout="vertical" initialValues={{ dataScope: 'Own' }}>
        <Form.Item
          name="name"
          label="Role name"
          rules={[{ required: true, message: 'Role name is required.' }, { max: 100 }]}
        >
          <Input disabled={role.data?.isSystem} />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ max: 500 }]}>
          <Input.TextArea rows={3} showCount maxLength={500} />
        </Form.Item>
        <Form.Item
          name="dataScope"
          label="Data scope"
          tooltip="How much employee data users with this role can see (used from the Employee module onwards)."
          rules={[{ required: true }]}
        >
          <Select
            options={DATA_SCOPE_OPTIONS.map((o) => ({
              value: o.value,
              label: (
                <span>
                  {o.label}{' '}
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    – {o.description}
                  </Typography.Text>
                </span>
              ),
            }))}
          />
        </Form.Item>
      </Form>
    </FormDrawer>
  );
}
