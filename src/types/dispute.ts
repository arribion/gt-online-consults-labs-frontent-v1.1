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

  /** Deadline and countdown, computed server-side so every client agrees. */
  expires_at: string;
  days_remaining: number;
  hours_remaining: number;

  claimed_by: DisputeParty | null;
  claimed_at: string | null;
  resolved_owner: DisputeParty | null;
  resolved_at: string | null;
  forfeited_at: string | null;

  /**
   * Whether this resolution can still be undone. False once the window closes
   * or either entry has been billed — the server decides, the UI just obeys.
   */
  can_revoke: boolean;
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

/** What the signed-in tasker can do about a dispute right now. */
export type DisputeAction = "claim" | "confirm" | "waiting" | "revoke" | "none";

export const disputeActionFor = (dispute: Dispute, userId: string | null): DisputeAction => {
  if (!userId) return "none";

  if (dispute.status === "RESOLVED") {
    // Only the party who confirmed can undo it, and only while the server
    // still says so.
    const confirmedByMe = dispute.resolved_owner?.id !== userId;
    return dispute.can_revoke && confirmedByMe ? "revoke" : "none";
  }

  if (dispute.status !== "PENDING") return "none";
  if (!dispute.claimed_by) return "claim";
  if (dispute.claimed_by.id === userId) return "waiting";
  return "confirm";
};

/** How urgent the countdown is, for styling the deadline. */
export const disputeUrgency = (dispute: Dispute): "expired" | "urgent" | "soon" | "calm" => {
  if (dispute.status !== "PENDING") return "calm";
  if (dispute.hours_remaining <= 0) return "expired";
  if (dispute.days_remaining < 1) return "urgent";
  if (dispute.days_remaining <= 2) return "soon";
  return "calm";
};

/** "2 days left" / "9 hours left" — hours once it's down to the last day. */
export const disputeCountdown = (dispute: Dispute): string => {
  if (dispute.hours_remaining <= 0) return "window closed";
  if (dispute.days_remaining >= 1) {
    return `${dispute.days_remaining} day${dispute.days_remaining === 1 ? "" : "s"} left`;
  }
  return `${dispute.hours_remaining} hour${dispute.hours_remaining === 1 ? "" : "s"} left`;
};
