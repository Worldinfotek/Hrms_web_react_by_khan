import { LogoutOutlined } from '@ant-design/icons';
import { App, Button, Modal, Table, Typography } from 'antd';
import { ConfirmAction, EmptyState } from '@/shared/components';
import { Can } from '@/shared/auth/Can';
import { Permissions } from '@/shared/auth/permissions';
import { getErrorMessage } from '@/shared/utils/errors';
import { formatDateTime } from '@/shared/utils/format';
import { useRevokeUserSessions, useUserSessions } from '../api/usersApi';
import type { UserSession } from '../types';

interface UserSessionsModalProps {
  userId?: number;
  userName?: string;
  onClose: () => void;
}

/** Signed-in devices of a user, with "sign out everywhere". */
export function UserSessionsModal({ userId, userName, onClose }: UserSessionsModalProps) {
  const sessions = useUserSessions(userId);
  const revoke = useRevokeUserSessions();
  const { message } = App.useApp();

  return (
    <Modal
      open={userId !== undefined}
      title={`Active sessions – ${userName ?? ''}`}
      onCancel={onClose}
      footer={null}
      width={760}
    >
      <Table<UserSession>
        rowKey="id"
        size="small"
        loading={sessions.isLoading}
        dataSource={sessions.data}
        pagination={false}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <EmptyState description="No active sessions" /> }}
        columns={[
          { title: 'Signed in', dataIndex: 'createdAt', render: (v: string) => formatDateTime(v) },
          { title: 'Expires', dataIndex: 'expiresAt', render: (v: string) => formatDateTime(v) },
          { title: 'IP address', dataIndex: 'ipAddress', render: (v: string | null) => v ?? '—' },
          {
            title: 'Device',
            dataIndex: 'userAgent',
            render: (v: string | null) => (
              <Typography.Text ellipsis={{ tooltip: v }} style={{ maxWidth: 280 }}>
                {v ?? '—'}
              </Typography.Text>
            ),
          },
        ]}
      />
      <Can permission={Permissions.Users.Edit}>
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <ConfirmAction
            title="Sign this user out of all devices?"
            onConfirm={() =>
              revoke.mutateAsync(userId!).then(
                () => message.success('All sessions have been signed out.'),
                (error) => message.error(getErrorMessage(error)),
              )
            }
          >
            <Button
              danger
              icon={<LogoutOutlined />}
              disabled={!sessions.data?.length}
              loading={revoke.isPending}
            >
              Sign out all devices
            </Button>
          </ConfirmAction>
        </div>
      </Can>
    </Modal>
  );
}
