import { Alert, App, Form, Input, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useRoleLookup } from '@/features/roles/api/rolesApi';
import { TemporaryPasswordModal } from '@/features/users/components/TemporaryPasswordModal';
import { applyFormErrors, getErrorMessage } from '@/shared/utils/errors';
import { useCreateEmployeeUser } from '../api/employeesApi';
import type { EmployeeDetail } from '../types';

interface CreateLoginModalProps {
  open: boolean;
  employee: EmployeeDetail;
  onClose: () => void;
}

/** One-click login for an employee: username + roles; e-mail defaults to the work e-mail. */
export function CreateLoginModal({ open, employee, onClose }: CreateLoginModalProps) {
  const [form] = Form.useForm<{ userName: string; email?: string; roleIds: number[] }>();
  const { message } = App.useApp();
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [createdUserName, setCreatedUserName] = useState<string>();
  const roles = useRoleLookup(open);
  const create = useCreateEmployeeUser();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    const suggested = `${employee.firstName}.${employee.lastName}`.toLowerCase().replace(/[^a-z0-9._-]/g, '');
    form.setFieldsValue({ userName: suggested, email: employee.workEmail ?? undefined });
  }, [open, employee, form]);

  const submit = async () => {
    const values = await form.validateFields();
    setError(null);
    create.mutate(
      {
        id: employee.id,
        body: { userName: values.userName, email: values.email || null, roleIds: values.roleIds },
      },
      {
        onSuccess: (result) => {
          message.success('Login created.');
          onClose();
          setCreatedUserName(result.user.userName);
          setPassword(result.temporaryPassword);
        },
        onError: (err) => {
          if (!applyFormErrors(form, err)) setError(getErrorMessage(err));
        },
      },
    );
  };

  return (
    <>
      <Modal
        open={open}
        title="Create login"
        onCancel={onClose}
        onOk={submit}
        okText="Create login"
        confirmLoading={create.isPending}
        destroyOnHidden
      >
        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical">
          <Form.Item
            name="userName"
            label="Username"
            rules={[
              { required: true },
              { min: 3, max: 50 },
              { pattern: /^[a-zA-Z0-9._-]+$/, message: 'Letters, digits, dot, dash and underscore only.' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="E-mail"
            rules={[{ type: 'email' }]}
            extra="Used for password reset. Defaults to the work e-mail."
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="roleIds"
            label="Roles"
            rules={[{ required: true, message: 'Select at least one role.' }]}
          >
            <Select
              mode="multiple"
              loading={roles.isLoading}
              options={(roles.data ?? []).map((r) => ({ value: r.id, label: r.name }))}
              placeholder="e.g. Employee"
            />
          </Form.Item>
        </Form>
      </Modal>
      <TemporaryPasswordModal
        open={password !== null}
        title="Login created"
        userName={createdUserName}
        password={password}
        onClose={() => setPassword(null)}
      />
    </>
  );
}
