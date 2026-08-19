import type { MemberBrief, MemberStatus, MemberRole } from "./member";
import type { ProjectStatus } from "./project";

/** Mirrors the backend `assignment_status_enum`. */
export const ASSIGNMENT_STATUSES = [
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REMOVED",
] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

/** Statuses an admin may set via PATCH — `REMOVED` is only reachable via the remove route. */
export const SETTABLE_ASSIGNMENT_STATUSES = [
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

/**
 * `GET /project-assignments/` row. The backend still keys the id as `_id` here
 * (Mongo-era leftover) — the service layer normalises it to `id`.
 */
export type Assignment = {
  id: string;
  project_id: string;
  tasker_id: string;
  status: AssignmentStatus;
  custom_rate: number | null;
  assigned_at: string | null;
  removed_at: string | null;
  project: {
    id: string;
    name: string;
    status: ProjectStatus;
    avg_pay: number;
  } | null;
  tasker: MemberBrief | null;
};

/** One row of `GET /project-assignments/project/{id}` (admin view of a project's roster). */
export type ProjectRosterEntry = {
  assignment_id: string;
  tasker: {
    id: string;
    full_name: string;
    email: string;
    role: MemberRole;
    avatar: string | null;
    status: MemberStatus;
  } | null;
  custom_rate: number | null;
  status: AssignmentStatus;
  assigned_at: string | null;
};

export type ProjectRoster = {
  project: {
    id: string;
    name: string;
    default_rate: number;
    status: ProjectStatus;
  };
  taskers: ProjectRosterEntry[];
  total_taskers: number;
};

/** One row of `GET /project-assignments/my-projects` (the tasker's own view). */
export type MyProject = {
  assignment_id: string;
  project: {
    id: string;
    project_name: string;
    status: ProjectStatus;
    avg_pay: number;
    description: string;
    platform: string;
    created_at: string | null;
  } | null;
  custom_rate: number | null;
  assigned_at: string | null;
  status: AssignmentStatus;
  taskers_count: number;
};

/** One row of `GET /project-assignments/project/{id}/taskers` (teammates). */
export type Teammate = {
  assignment_id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  /** The teammate's account status, not the assignment's. */
  status: MemberStatus;
  assignment_status: AssignmentStatus;
  assigned_at: string | null;
  is_me: boolean;
};

export type ProjectTeam = {
  project: {
    id: string;
    name: string;
    status: ProjectStatus;
    rate: number;
  } | null;
  taskers: Teammate[];
  total_taskers: number;
};

export type AssignTaskersRequest = {
  project_id: string;
  tasker_ids: string[];
  custom_rate?: number | null;
};
