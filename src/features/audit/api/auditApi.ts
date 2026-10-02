import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/api/httpClient';
import type {
  AuditLogDetail,
  AuditLogListItem,
  AuditLogQuery,
  LoginHistoryItem,
  LoginHistoryQuery,
} from '../types';

export const auditKeys = {
  list: (query: AuditLogQuery) => ['audit-logs', 'list', query] as const,
  detail: (id: number) => ['audit-logs', 'detail', id] as const,
  loginHistory: (query: LoginHistoryQuery) => ['login-history', query] as const,
};

export function useAuditLogs(query: AuditLogQuery) {
  return useQuery({
    queryKey: auditKeys.list(query),
    queryFn: () => api.getPaged<AuditLogListItem>('/audit-logs', query),
    placeholderData: keepPreviousData,
  });
}

export function useAuditLog(id: number | undefined) {
  return useQuery({
    queryKey: auditKeys.detail(id ?? 0),
    queryFn: () => api.get<AuditLogDetail>(`/audit-logs/${id}`),
    enabled: !!id,
  });
}

export function useLoginHistory(query: LoginHistoryQuery) {
  return useQuery({
    queryKey: auditKeys.loginHistory(query),
    queryFn: () => api.getPaged<LoginHistoryItem>('/login-history', query),
    placeholderData: keepPreviousData,
  });
}
