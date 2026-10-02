import { Alert, App, Col, Form, Input, Radio, Row, Select, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { PasswordPolicyHint } from '@/features/auth/components/PasswordPolicyHint';
import { useRoleLookup } from '@/features/roles/api/rolesApi';
import { FormDrawer } from '@/shared/components';
import { applyFormErrors, getErrorMessage } from '@/shared/utils/errors';
import { passwordRules } from '@/shared/utils/passwordRules';
import { useCreateUser, useUpdateUser, useUser } from '../api/usersApi';
import type { CreateUserResponse } from '../types';

interface UserFormValues {
  userName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  roleIds: number[];
  isActive: boolean;
  passwordMode: 'generate' | 'manual';
  password?: string;
}

interface UserFormDrawerProps {
  open: boolean;
  /** Undefined = create a new user. */
  userId?: number;
  onClose: () => void;
  onCreated: (result: CreateUserResponse) => void;
}

export function UserFormDrawer({ open, userId, onClose, onCreated }: UserFormDrawerProps) {
  const isEdit = userId !== undefined;
  const [form] = Form.useForm<UserFormValues>();
  const { message } = App.useApp();
  const [error, setError] = useState<string | null>(null);
  const passwordMode = Form.useWatch('passwordMode', form);
  const password = Form.useWatch('password', form);

  const roles = useRoleLookup(open);
  const user = useUser(open ? userId : undefined);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (isEdit && user.data) {
      form.setFieldsValue({
        userName: user.data.userName,
        fullName: user.data.fullName,
        email: user.data.email,
        phoneNumber: user.data.phoneNumber ?? undefined,
        roleIds: user.data.roleIds,
        isActive: user.data.isActive,
      });
    }
  }, [open, isEdit, user.data, form]);

  const handleError = (err: unknown) => {
    if (!applyFormErrors(form, err)) setError(getErrorMessage(err));
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    setError(null);
    if (isEdit) {
      updateUser.mutate(
        {
          id: userId,
          request: {
            email: values.email,
            fullName: values.fullName,
            phoneNumber: values.phoneNumber || null,
            roleIds: values.roleIds,
          },
        },
        {
          onSuccess: () => {
            message.success('User updated.');
            handleClose();
          },
          onError: handleError,
        },
      );
      return;
    }

    createUser.mutate(
      {
        userName: values.userName,
        email: values.email,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber || null,
        password: values.passwordMode === 'manual' ? values.password : null,
        roleIds: values.roleIds,
        isActive: values.isActive,
      },
      {
        onSuccess: (result) => {
          onCreated(result);
          handleClose();
        },
        onError: handleError,
      },
    );
  };

  return (
    <FormDrawer
      open={open}
      title={isEdit ? 'Edit user' : 'Add user'}
      onClose={handleClose}
      onSubmit={onSubmit}
      submitting={createUser.isPending || updateUser.isPending}
      submitText={isEdit ? 'Save changes' : 'Create user'}
    >
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      <Form
        form={form}
        layout="vertical"
        initialValues={{ isActive: true, passwordMode: 'generate', roleIds: [] }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="userName"
              label="Username"
              tooltip={
                isEdit ? 'The username cannot be changed.' : 'Letters, digits, dot, dash and underscore.'
              }
              rules={[
                { required: true, message: 'Username is required.' },
                { min: 3, max: 50, message: '3–50 characters.' },
                { pattern: /^[a-zA-Z0-9._-]+$/, message: 'Only letters, digits, dot, dash and underscore.' },
              ]}
            >
              <Input disabled={isEdit} autoComplete="off" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="fullName"
              label="Full name"
              rules={[{ required: true, message: 'Full name is required.' }, { max: 150 }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="E-mail"
              rules={[
                { required: true, message: 'E-mail is required.' },
                { type: 'email', message: 'Enter a valid e-mail.' },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="phoneNumber"
              label="Phone"
              rules={[{ pattern: /^\+?[0-9\s-]{7,20}$/, message: 'Enter a valid phone number.' }]}
            >
              <Input placeholder="+92 300 1234567" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="roleIds"
          label="Roles"
          rules={[{ required: true, message: 'Select at least one role.' }]}
        >
          <Select
            mode="multiple"
            loading={roles.isLoading}
            placeholder="Select roles"
            optionFilterProp="label"
            options={(roles.data ?? []).map((r) => ({ value: r.id, label: r.name }))}
          />
        </Form.Item>

        {!isEdit && (
          <>
            <Form.Item name="passwordMode" label="Initial password">
              <Radio.Group
                options={[
                  { value: 'generate', label: 'Generate a temporary password' },
                  { value: 'manual', label: 'Set it myself' },
                ]}
              />
            </Form.Item>
            {passwordMode === 'manual' && (
              <>
                <Form.Item name="password" label="Password" rules={passwordRules}>
                  <Input.Password autoComplete="new-password" />
                </Form.Item>
                <PasswordPolicyHint value={password} />
              </>
            )}
            <Alert
              type="info"
              showIcon
              title="The user must change this password at first sign-in."
              style={{ marginBottom: 16 }}
            />
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </>
        )}
      </Form>
    </FormDrawer>
  );
}
