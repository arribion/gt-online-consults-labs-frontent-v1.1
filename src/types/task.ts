/** Task-log entries — the raw material every invoice is built from. */

/** Mirrors the backend `task_dispute_state_enum`. */
export const DISPUTE_STATES = ["NONE", "DISPUTED", "RESOLVED", "FORFEITED"] as const;
export type DisputeState = (typeof DISPUTE_STATES)[number];

/**
 * The six columns a bulk upload must carry, exact wording, case-insensitive,
 * any order. Kept here so the upload UI and its validator can't drift from
 * `backend-python/app/services/task_parsing.py`.
 */
export const REQUIRED_TASK_HEADERS = [
  "TASK ID",
  "TASK STATUS",
  "TASKING DATE",
  "TASK DURATION",
  "PAID DURATION",
  "ACCOUNT",
] as const;

/** Longer values are rejected outright by the backend, never truncated. */
export const ACCOUNT_MAX_LENGTH = 4;

export type TaskEntry = {
  id: string;
  task_id: string;
  task_status: string;
  task_date: string;
  /** "MM:SS", reconstructed server-side from the stored seconds. */
  duration_display: string;
  cap_minutes: number;
  /** Always min(ceil(duration), cap) — computed server-side, never taken from the file. */
  paid_minutes: number;
  account: string;
  dispute_state: DisputeState;
  submission_id: string | null;
  tasker_id: string | null;
  project_id: string | null;
  created_at: string;
};

/** Admin listing row — same entry, plus the names an admin table needs. */
export type TaskEntryWithParties = TaskEntry & {
  tasker_name: string | null;
  project_name: string | null;
};

export type TaskOverviewSummary = {
  total_entries: number;
  completed: number;
  disputed: number;
  forfeited: number;
  total_paid_minutes: number;
  taskers: number;
  projects: number;
};

export type TaskOverview = {
  summary: TaskOverviewSummary;
  entries: TaskEntryWithParties[];
};

export type TaskEntryCreate = {
  projectId: string;
  taskId: string;
  taskStatus: string;
  taskingDate: string;
  /** Strict "MM:SS". */
  taskDuration: string;
  /** "capped @N minutes" or "N minutes" — both declare a cap, never a payout. */
  paidDuration: string;
  account: string;
};

export type DisputedTaskInfo = {
  task_id: string;
  disputed_with: { id: string; full_name: string };
};

/** Returned by both the bulk import and the single-entry endpoint. */
export type TaskImportSummary = {
  message: string;
  submission_id: string | null;
  rows_created: number;
  duplicates_skipped: number;
  duplicate_task_ids: string[];
  disputes_raised: DisputedTaskInfo[];
};

export type DuplicateLog = {
  id: string;
  project_id: string | null;
  tasker_id: string | null;
  task_id: string;
  submission_id: string | null;
  attempted_at: string;
};

export type DuplicateLogReport = {
  count: number;
  counts_by_tasker: Record<string, number>;
  duplicates: DuplicateLog[];
};

export type TaskFilters = {
  projectId?: string;
  taskerId?: string;
  taskStatus?: string;
  disputeState?: DisputeState;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
};
