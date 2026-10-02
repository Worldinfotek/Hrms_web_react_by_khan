import { Card, Flex } from 'antd';
import { Outlet } from 'react-router-dom';
import { brandColors } from '@/theme/themeConfig';

/** Centered card layout for login / forgot-password pages (used from Phase 1). */
export function AuthLayout() {
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        minHeight: '100vh',
        padding: 16,
        background: `linear-gradient(135deg, ${brandColors.primaryLight}, ${brandColors.secondaryLight})`,
      }}
    >
      <Card style={{ width: '100%', maxWidth: 420 }}>
        <Outlet />
      </Card>
    </Flex>
  );
}
