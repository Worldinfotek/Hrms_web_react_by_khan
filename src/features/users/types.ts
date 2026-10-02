import type { PagedRequest } from '@/api/types';

export interface UserListItem {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  isLockedOut: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: string[];
}

export interface UserDetail {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lockoutEndUtc: string | null;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  employeeId: number | null;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  roleIds: number[];
  roles: string[];
}

export interface UserListQuery extends PagedRequest {
  isActive?: boolean;
  roleId?: number;
}

export interface CreateUserRequest {
  userName: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  password?: string | null;
  roleIds: number[];
  isActive: boolean;
}

export interface UpdateUserRequest {
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  roleIds: number[];
}

export interface CreateUserResponse {
  user: UserDetail;
  temporaryPassword: string | null;
}

export interface UserSession {
  id: number;
  createdAt: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}
