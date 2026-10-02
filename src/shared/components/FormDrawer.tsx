import { Button, Drawer, Flex } from 'antd';
import type { ReactNode } from 'react';

interface FormDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitting?: boolean;
  submitText?: string;
  width?: number;
  children: ReactNode;
}

/** Side drawer used for create/edit forms across all modules. */
export function FormDrawer({
  open,
  title,
  onClose,
  onSubmit,
  submitting,
  submitText = 'Save',
  width = 560,
  children,
}: FormDrawerProps) {
  return (
    <Drawer
      open={open}
      title={title}
      onClose={onClose}
      size={width}
      destroyOnHidden
      maskClosable={!submitting}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="primary" onClick={onSubmit} loading={submitting}>
            {submitText}
          </Button>
        </Flex>
      }
    >
      {children}
    </Drawer>
  );
}
