import { LockOutlined } from '@ant-design/icons';
import { Alert, App, Button, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { applyFormErrors, getErrorMessage } from '@/shared/utils/errors';
import { confirmPasswordRule, passwordRules } from '@/shared/utils/passwordRules';
import { useChangePassword, useLogout } from '../api/authApi';
import { AuthCardHeader } from '../components/AuthCardHeader';
import { PasswordPolicyHint } from '../components/PasswordPolicyHint';
import type { ChangePasswordRequest } from '../types';

type ChangeForm = ChangePasswordRequest & { confirmPassword: string };

export default function ChangePasswordPage() {
  const forced = useAuthStore((state) => state.user?.mustChangePassword ?? false);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<ChangeForm>();
  const newPassword = Form.useWatch('newPassword', form);
  const change = useChangePassword();
  const logout = useLogout();

  const onFinish = ({ currentPassword, newPassword: next }: ChangeForm) =>
    change.mutate(
      { currentPassword, newPassword: next },
      {
        onSuccess: (result) => {
          message.success(result.message ?? 'Password changed.');
          navigate('/', { replace: true });
        },
        onError: (error) => applyFormErrors(form, error),
      },
    );

  return (
    <>
      <AuthCardHeader
        title="Change password"
        subtitle={
          forced
            ? 'For your security, set a new password before continuing.'
            : 'Other devices will be signed out.'
        }
      />
      {change.isError && (
        <Alert type="error" showIcon title={getErrorMessage(change.error)} style={{ marginBottom: 16 }} />
      )}
      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
        <Form.Item
          name="currentPassword"
          label={forced ? 'Temporary password' : 'Current password'}
          rules={[{ required: true, message: 'Enter your current password.' }]}
        >
          <Input.Password prefix={<LockOutlined />} autoComplete="current-password" autoFocus />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="New password"
          dependencies={['currentPassword']}
          rules={[
            ...passwordRules,
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                value && value === getFieldValue('currentPassword')
                  ? Promise.reject(new Error('Choose a password different from the current one.'))
                  : Promise.resolve(),
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
        </Form.Item>
        <PasswordPolicyHint value={newPassword} />
        <Form.Item
          name="confirmPassword"
          label="Confirm new password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Confirm the new password.' },
            confirmPasswordRule('newPassword'),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={change.isPending}>
          Change password
        </Button>
        <Button
          type="link"
          block
          style={{ marginTop: 8 }}
          onClick={() =>
            forced ? logout.mutate(undefined, { onSettled: () => navigate('/login') }) : navigate(-1)
          }
        >
          {forced ? 'Sign out' : 'Cancel'}
        </Button>
      </Form>
    </>
  );
}
