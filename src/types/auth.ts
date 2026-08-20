import type { MemberRole } from "./member";

/** What `POST /auth/login` and `GET /auth/verify` return about the session. */
export type AuthUser = {
  full_name: string;
  email: string;
  role: MemberRole;
  phone?: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export type VerifyResponse = {
  success: boolean;
  user: AuthUser;
};

export const isAdminRole = (role: MemberRole | undefined | null): boolean =>
  role === "ADMIN" || role === "SUPERADMIN";
