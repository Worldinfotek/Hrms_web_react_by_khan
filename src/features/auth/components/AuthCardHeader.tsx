import { Flex, Typography } from 'antd';

export function AuthCardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Flex vertical align="center" gap={4} style={{ marginBottom: 24 }}>
      <img src="/favicon.svg" alt="WIT HRMS" width={48} height={48} />
      <Typography.Title level={3} style={{ margin: '8px 0 0' }}>
        {title}
      </Typography.Title>
      {subtitle && (
        <Typography.Text type="secondary" style={{ textAlign: 'center' }}>
          {subtitle}
        </Typography.Text>
      )}
    </Flex>
  );
}
