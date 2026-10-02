import { Tag } from 'antd';

const COLORS: Record<string, string> = { Create: 'green', Update: 'blue', Delete: 'red' };

export function AuditActionTag({ action }: { action: string }) {
  return <Tag color={COLORS[action] ?? 'purple'}>{action}</Tag>;
}
