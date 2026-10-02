import { LockOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Result } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { applyFormErrors, getErrorMessage } from '@/shared/utils/errors';
import { confirmPasswordRule, passwordRules } from '@/shared/utils/passwordRules';
import { useResetPassword } from '../api/authApi';
import { AuthCardHeader } from '../components/AuthCardHeader';
import { PasswordPolicyHint } from '../components/PasswordPolicyHint';

interface ResetForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [form] = Form.useForm<ResetForm>();
  const newPassword = Form.useWatch('newPassword', form);
  const reset = useResetPassword();

  if (!email || !token) {
    return (
      <Result
        status="warning"
        title="Invalid reset link"
        subTitle="The link is incomplete. Please request a new password reset."
        extra={<Link to="/forgot-password">Request a new link</Link>}
      />
    );
  }

  const onFinish = (values: ResetForm) =>
    reset.mutate(
      { email, token, newPassword: values.newPassword },
      {
        onSuccess: (result) =>
          navigate('/login', {
            replace: true,
            state: { message: result.message ?? 'Password reset. Please sign in.' },
          }),
        onError: (error) => applyFormErrors(form, error),
      },
    );

  return (
    <>
      <AuthCardHeader title="Choose a new password" subtitle={email} />
      {reset.isError && (
        <Alert type="error" showIcon title={getErrorMessage(reset.error)} style={{ marginBottom: 16 }} />
      )}
      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
        <Form.Item name="newPassword" label="New password" rules={passwordRules}>
          <Input.Password prefix={<LockOutlined />} autoComplete="new-password" autoFocus />
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
        <Button type="primary" htmlType="submit" block loading={reset.isPending}>
          Reset password
        </Button>
      </Form>
    </>
  );
}
