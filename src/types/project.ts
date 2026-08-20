/** Mirrors the backend `project_status_enum`. `DEACTIVATED` is what DELETE produces. */
export const PROJECT_STATUSES = [
  "DRAFT",
  "PENDING",
  "ACTIVE",
  "PAUSED",
  "CLOSED",
  "DEACTIVATED",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type RevenueSplit = {
  tasker: number;
  admin: number;
  owner: number;
};

export type Project = {
  id: string;
  project_name: string;
  platform: string;
  /** Default hourly rate used as the invoice `rate` unless an admin overrides it. */
  avg_pay: number;
  description: string;
  revenue_split: RevenueSplit | null;
  status: ProjectStatus;
  category: string | null;
  created_at: string;
  updated_at: string;
};

/** Minimal project embedded in assignment responses. */
export type ProjectBrief = {
  id: string;
  name: string;
  status: ProjectStatus;
  avg_pay: number;
};

export type ProjectCreate = {
  project_name: string;
  platform: string;
  avg_pay: number;
  description: string;
  status: ProjectStatus;
  category?: string | null;
  revenue_split?: RevenueSplit | null;
};

export type ProjectUpdate = Partial<ProjectCreate>;
