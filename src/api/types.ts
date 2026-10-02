/** Mirrors WIT.HRMS.API.Common.ApiResponse<T> – every endpoint returns this shape. */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string | null;
  errors?: Record<string, string[]> | null;
  meta?: PaginationMeta | null;
  traceId?: string | null;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** Mirrors WIT.HRMS.Application.Common.Models.PagedRequest. */
export interface PagedRequest {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PagedData<T> {
  items: T[];
  meta: PaginationMeta;
}

/** Normalised error thrown by the HTTP client for every failed request. */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: Record<string, string[]>;
  readonly traceId?: string;

  constructor(message: string, status: number, errors: Record<string, string[]> = {}, traceId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.traceId = traceId;
  }
}
