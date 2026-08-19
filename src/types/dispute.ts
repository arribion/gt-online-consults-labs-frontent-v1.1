/**
 * Task-ID disputes — raised automatically when two taskers log the same TASK ID
 * on the same project. One party claims, the other confirms; if neither happens
 * within the 5-day window both forfeit payment for that task.
 */

export const DISPUTE_STATUSES = ["PENDING", "RESOLVED", "FORFEITED"] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

/** Days from `raised_at` before a PENDING dispute auto-forfeits for both parties. */
export const DISPUTE_RESOLUTION_DAYS = 5;

export type DisputeParty = {
  id: string;
  full_name: string;
};

export type Dispute = {
  id: string;
  project_id: string;
  task_id: string;
  user_1: DisputeParty;
  user_2: DisputeParty;
  status: DisputeStatus;
  raised_at: string;
  claimed_by: DisputeParty | null;
  claimed_at: string | null;
  resolved_owner: DisputeParty | null;
  resolved_at: string | null;
  forfeited_at: string | null;
};

export type ConfirmDisputeRequest = {
  confirm_task_id: string;
  transfer_to_user_id: string;
};

export type DisputeFilters = {
  status?: DisputeStatus;
  projectId?: string;
  taskerId?: string;
  raisedFrom?: string;
  raisedTo?: string;
};

/** Days left before a pending dispute forfeits; negative once the window has passed. */
export const disputeDaysRemaining = (raisedAt: string): number => {
  const deadline = new Date(raisedAt).getTime() + DISPUTE_RESOLUTION_DAYS * 86_400_000;
  return Math.ceil((deadline - Date.now()) / 86_400_000);
};

/** What the signed-in tasker can do about a dispute right now. */
export type DisputeAction = "claim" | "confirm" | "waiting" | "none";

export const disputeActionFor = (dispute: Dispute, userId: string | null): DisputeAction => {
  if (dispute.status !== "PENDING" || !userId) return "none";
  if (!dispute.claimed_by) return "claim";
  if (dispute.claimed_by.id === userId) return "waiting";
  return "confirm";
};
