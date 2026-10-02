export type DataScope = 'Own' | 'Team' | 'Department' | 'Branch' | 'All';

/** Mirrors CurrentUserDto – everything the UI needs to decide what to show. */
export interface CurrentUser {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  mustChangePassword: boolean;
  isSuperAdmin: boolean;
  dataScope: DataScope;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: CurrentUser;
}

export interface LoginRequest {
  userNameOrEmail: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
