import { apiClient, unwrap } from "./api";
import type {
  AdminResetPasswordRequest,
  ApiEnvelope,
  ChangePasswordRequest,
  Member,
  MemberCreate,
  MemberSelfUpdate,
  MemberUpdate,
} from "@/types";

/**
 * `POST /auth/register` was removed as a privilege-escalation hole — account
 * creation goes through `POST /members` and is role-gated: an ADMIN may only
 * create/edit TASKERs, and only a SUPERADMIN may touch ADMIN/SUPERADMIN rows.
 */
export const membersService = {
  me: async (): Promise<Member> => {
    const { data } = await apiClient.get<ApiEnvelope<Member>>("/members/me");
    return unwrap(data);
  },

  updateMe: async (payload: MemberSelfUpdate): Promise<Member> => {
    const { data } = await apiClient.put<ApiEnvelope<Member>>("/members/me", payload);
    return unwrap(data);
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<string> => {
    const { data } = await apiClient.put<{ message: string }>("/members/me/password", payload);
    return data.message;
  },

  deleteMe: async (): Promise<void> => {
    await apiClient.delete("/members/me");
  },

  list: async (): Promise<Member[]> => {
    const { data } = await apiClient.get<ApiEnvelope<Member[]>>("/members/");
    return unwrap(data);
  },

  get: async (id: string): Promise<Member> => {
    const { data } = await apiClient.get<ApiEnvelope<Member>>(`/members/${id}`);
    return unwrap(data);
  },

  create: async (payload: MemberCreate): Promise<Member> => {
    const { data } = await apiClient.post<ApiEnvelope<Member>>("/members/", payload);
    return unwrap(data);
  },

  update: async (id: string, payload: MemberUpdate): Promise<Member> => {
    const { data } = await apiClient.put<ApiEnvelope<Member>>(`/members/${id}`, payload);
    return unwrap(data);
  },

  resetPassword: async (id: string, payload: AdminResetPasswordRequest): Promise<string> => {
    const { data } = await apiClient.put<{ message: string }>(
      `/members/${id}/reset-password`,
      payload,
    );
    return data.message;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/members/${id}`);
  },
};
