import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/shared/components';
import { themeConfig } from '@/theme/themeConfig';
import { queryClient } from './queryClient';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={themeConfig} locale={enUS}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
}
