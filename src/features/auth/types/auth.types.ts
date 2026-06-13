import type { AppAsyncError, AsyncStatus } from "@/store";

export const USER_ROLES = {
  admin: "Admin",
  chef: "Chef",
  customer: "Customer",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export interface AuthState {
  accessToken: string | null;
  loginError: AppAsyncError | null;
  loginStatus: AsyncStatus;
  logoutStatus: AsyncStatus;
  restoreStarted: boolean;
  status: AuthStatus;
  user: AuthUser | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
