import { Alert, Modal, Typography } from 'antd';

interface TemporaryPasswordModalProps {
  open: boolean;
  title: string;
  userName?: string;
  password: string | null;
  onClose: () => void;
}

/** Shows a generated password exactly once, with a copy button. */
export function TemporaryPasswordModal({
  open,
  title,
  userName,
  password,
  onClose,
}: TemporaryPasswordModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      onOk={onClose}
      okText="Done"
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <Alert
        type="warning"
        showIcon
        title="Copy this password now – it will not be shown again."
        description="Share it securely with the user. They must change it at first sign-in."
        style={{ marginBottom: 16 }}
      />
      {userName && (
        <Typography.Paragraph>
          Username:{' '}
          <Typography.Text strong copyable>
            {userName}
          </Typography.Text>
        </Typography.Paragraph>
      )}
      <Typography.Paragraph>
        Temporary password:{' '}
        <Typography.Text code copyable style={{ fontSize: 16 }}>
          {password}
        </Typography.Text>
      </Typography.Paragraph>
    </Modal>
  );
}
