import { Alert, Typography } from 'antd';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '@/shared/components';

const TOPICS: Record<string, { title: string; body: string }> = {
  '/settings/approval-authority': {
    title: 'Approval authority',
    body: 'This will list who may approve leave, attendance corrections, payroll, and exits, by role and level. Approvals inside each module stay as they are until this list is connected.',
  },
  '/settings/login-rules': {
    title: 'Login and session controls',
    body: 'This will set password rules, how long a session stays open, and how many devices can stay signed in. Sign-in, change password, and the audit log already work.',
  },
};

/** Placeholder for a Settings item that has no screen yet. */
export default function ComingNextPage() {
  const { pathname } = useLocation();
  const page = TOPICS[pathname] ?? {
    title: 'Coming next',
    body: 'This settings screen is part of Phase 1 and is not built yet.',
  };

  return (
    <>
      <PageHeader title={page.title} subtitle="Coming next" />
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="Sample data stays in this browser only. It is not saved on the server."
      />
      <Typography.Paragraph>{page.body}</Typography.Paragraph>
    </>
  );
}
