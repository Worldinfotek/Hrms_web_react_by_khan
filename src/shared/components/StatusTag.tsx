import { Tag } from 'antd';
import { getStatusColor } from '@/shared/utils/status';

interface StatusTagProps {
  status: string;
  /** Override the automatic colour. */
  color?: string;
}

export function StatusTag({ status, color }: StatusTagProps) {
  return <Tag color={color ?? getStatusColor(status)}>{status}</Tag>;
}
