import type { PagedRequest } from '@/api/types';

export interface AuditLogListItem {
  id: number;
  occurredAt: string;
  action: string;
  entityName: string;
  entityId: string | null;
  changedColumns: string | null;
  userId: string | null;
  userName: string | null;
  ipAddress: string | null;
}

export interface AuditLogDetail extends AuditLogListItem {
  oldValues: string | null;
  newValues: string | null;
  correlationId: string | null;
}

export interface LoginHistoryItem {
  id: number;
  occurredAt: string;
  userId: number | null;
  userName: string;
  succeeded: boolean;
  failureReason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AuditLogQuery extends PagedRequest {
  entityName?: string;
  action?: string;
  from?: string;
  to?: string;
}

export interface LoginHistoryQuery extends PagedRequest {
  succeeded?: boolean;
  from?: string;
  to?: string;
}
