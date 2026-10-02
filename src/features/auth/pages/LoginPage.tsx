import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input } from 'antd';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/shared/utils/errors';
import { useLogin } from '../api/authApi';
import { AuthCardHeader } from '../components/AuthCardHeader';
import type { LoginRequest } from '../types';

export default function LoginPage() {
  const status = useAuthStore((state) => state.status);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string; message?: string } | null)?.from ?? '/';
  const notice = (location.state as { message?: string } | null)?.message;
  const login = useLogin();

  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  const onFinish = (values: LoginRequest) =>
    login.mutate(values, {
      onSuccess: (session) =>
        navigate(session.user.mustChangePassword ? '/change-password' : from, { replace: true }),
    });

  return (
    <>
      <AuthCardHeader title="Sign in to WIT HRMS" subtitle="Use your username or work e-mail" />
      {notice && <Alert type="success" showIcon title={notice} style={{ marginBottom: 16 }} />}
      {login.isError && (
        <Alert type="error" showIcon title={getErrorMessage(login.error)} style={{ marginBottom: 16 }} />
      )}
      <Form<LoginRequest> layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
        <Form.Item
          name="userNameOrEmail"
          label="Username or e-mail"
          rules={[{ required: true, message: 'Enter your username or e-mail.' }]}
        >
          <Input prefix={<UserOutlined />} autoComplete="username" autoFocus />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Enter your password.' }]}
        >
          <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
        </Form.Item>
        <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <Button type="primary" htmlType="submit" block loading={login.isPending}>
          Sign in
        </Button>
      </Form>
    </>
  );
}
