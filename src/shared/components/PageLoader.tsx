import { Flex, Spin } from 'antd';

export function PageLoader({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <Flex align="center" justify="center" style={{ minHeight: fullScreen ? '100vh' : 320 }}>
      <Spin size="large" />
    </Flex>
  );
}
