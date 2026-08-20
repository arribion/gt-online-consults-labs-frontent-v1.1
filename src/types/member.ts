/** Users. The backend calls the resource "members"; the model behind it is `User`. */

/** Mirrors the backend `user_role_enum`. `MANAGER` no longer exists. */
export const MEMBER_ROLES = ["TASKER", "ADMIN", "SUPERADMIN"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

/** Mirrors the backend `user_status_enum`. */
export const MEMBER_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export type PayoutMethod = {
  type: string;
  phone: string;
};

export type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: MemberRole;
  status: MemberStatus;
  avatar: string | null;
  payout_method: PayoutMethod | null;
  /** Negotiated revenue share (0-100). Admin-settable only — never via PUT /members/me. */
  payment_rate: number;
  added_by: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
};

/** Minimal user embedded in assignment/dispute responses. */
export type MemberBrief = {
  id: string;
  full_name: string;
  email?: string;
  role?: MemberRole | null;
  avatar?: string | null;
  status?: MemberStatus | null;
};

export type MemberCreate = {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role: MemberRole;
  status: MemberStatus;
  payment_rate: number;
};

export type MemberUpdate = Partial<Omit<MemberCreate, "password">> & {
  avatar?: string;
  payout_method?: PayoutMethod;
};

/** The subset a user may change on their own profile. */
export type MemberSelfUpdate = {
  full_name?: string;
  phone?: string;
  avatar?: string;
  payout_method?: PayoutMethod;
};

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type AdminResetPasswordRequest = {
  new_password: string;
  confirm_new_password: string;
};
