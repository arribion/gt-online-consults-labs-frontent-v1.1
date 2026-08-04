export type MemberRole = "TASKER" | "MANAGER" | "ADMIN";

export type Member = {
  id: string;
  fullName: string;
  email?: string;
  role: MemberRole;
  phone?: string;
  activeProjects?: number;
  meta?: Record<string, unknown>;
};
