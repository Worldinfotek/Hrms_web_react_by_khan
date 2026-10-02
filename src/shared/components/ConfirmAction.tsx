import { Popconfirm } from 'antd';
import type { ReactNode } from 'react';

interface ConfirmActionProps {
  title: string;
  description?: string;
  onConfirm: () => void | Promise<unknown>;
  okText?: string;
  danger?: boolean;
  children: ReactNode;
}

/** Wraps a button/link with a confirmation popover (delete, deactivate, approve…). */
export function ConfirmAction({
  title,
  description,
  onConfirm,
  okText = 'Yes',
  danger = true,
  children,
}: ConfirmActionProps) {
  return (
    <Popconfirm
      title={title}
      description={description}
      onConfirm={onConfirm}
      okText={okText}
      cancelText="No"
      okButtonProps={{ danger }}
    >
      {children}
    </Popconfirm>
  );
}
