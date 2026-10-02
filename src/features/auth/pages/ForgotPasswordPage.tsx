import { MailOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Result } from 'antd';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '@/shared/utils/errors';
import { useForgotPassword } from '../api/authApi';
import { AuthCardHeader } from '../components/AuthCardHeader';
import type { ForgotPasswordRequest } from '../types';

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();

  if (forgot.isSuccess) {
    return (
      <Result
        status="success"
        title="Check your e-mail"
        subTitle={forgot.data.message ?? 'If an account exists for this e-mail, a reset link has been sent.'}
        extra={<Link to="/login">Back to sign in</Link>}
      />
    );
  }

  return (
    <>
      <AuthCardHeader
        title="Forgot password"
        subtitle="Enter your work e-mail and we will send you a reset link."
      />
      {forgot.isError && (
        <Alert type="error" showIcon title={getErrorMessage(forgot.error)} style={{ marginBottom: 16 }} />
      )}
      <Form<ForgotPasswordRequest>
        layout="vertical"
        onFinish={(v) => forgot.mutate(v)}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            { required: true, message: 'Enter your e-mail.' },
            { type: 'email', message: 'Enter a valid e-mail.' },
          ]}
        >
          <Input prefix={<MailOutlined />} autoComplete="email" autoFocus />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={forgot.isPending}>
          Send reset link
        </Button>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login">Back to sign in</Link>
        </div>
      </Form>
    </>
  );
}
