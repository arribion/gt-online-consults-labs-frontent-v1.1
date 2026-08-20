import { apiClient } from "./api";
import type { AuthUser, LoginResponse, VerifyResponse } from "@/types";

export const authService = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", { email, password });
    return data.user;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout", {});
  },

  /** Resolves the session from the httpOnly cookie; rejects when there isn't one. */
  verify: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get<VerifyResponse>("/auth/verify");
    return data.user;
  },

  refresh: async (): Promise<void> => {
    await apiClient.post("/auth/refresh", {});
  },
};
