import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/httpClient';

export interface SystemInfo {
  application: string;
  version: string;
  environment: string;
  serverTimeUtc: string;
}

export const systemKeys = {
  info: ['system', 'info'] as const,
};

export function useSystemInfo() {
  return useQuery({
    queryKey: systemKeys.info,
    queryFn: () => api.get<SystemInfo>('/system/info'),
  });
}
