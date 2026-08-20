/**
 * Task-ID disputes.
 *
 * A dispute is a *claim set*, not a pair. Everyone who logged the same TASK ID
 * on the same project is a claimant, because logging it is what asserts
 * ownership. It settles when every claimant but one has withdrawn: the last
 * one standing keeps the task. If more than one is still standing when the
 * window closes, nobody agreed, so nobody is paid.
 *
 * Withdrawal rather than confirmation is what makes three claimants no harder
 * to reason about than two — nobody confirms *to* anyone, so a late claimant
 * invalidates nothing.
 */

export const DISPUTE_STATUSES = ["PENDING", "RESOLVED", "FORFEITED"] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

/** Days from `raised_at` before an unsettled dispute forfeits for everyone. */
export const DISPUTE_RESOLUTION_DAYS = 5;

export type DisputeParty = {
  id: string;
  full_name: string;
  email?: string | null;
};

export type DisputeClaimant = DisputeParty & {
  joined_at: string | null;
  withdrawn_at: string | null;
  withdrawn: boolean;
  /** Logged the task first. Carries no procedural weight; useful context. */
  is_original: boolean;
  is_you: boolean;
  /** Their entry was already billed, so it can't be un-billed by a resolution. */
  already_invoiced: boolean;
};

export type Dispute = {
  id: string;
  project_id: string;
  task_id: string;
  status: DisputeStatus;
  raised_at: string;

  claimants: DisputeClaimant[];
  original_person: DisputeParty | null;
  standing_count: number;
  withdrawn_count: number;

  /** Deadline and countdown, computed server-side so every client agrees. */
  expires_at: string;
  days_remaining: number;
  hours_remaining: number;
  /** An admin bought the parties more time. */
  extended: boolean;

  /**
   * What the signed-in user may do right now. Resolved server-side so the UI
   * doesn't re-derive three rules and get one of them subtly wrong.
   */
  can_withdraw: boolean;
  can_revoke: boolean;

  /** At least one claimant was already paid for this task. */
  involves_billed_work: boolean;

  resolved_owner: DisputeParty | null;
  resolved_at: string | null;
  forfeited_at: string | null;

  adjudicated_by: DisputeParty | null;
  adjudicated_at: string | null;
  adjudication_reason: string | null;
};

export type WithdrawRequest = {
  confirm_task_id: string;
};

export type ExtendDisputeRequest = {
  days: number;
  reason: string;
};

export type AdjudicateDisputeRequest = {
  /** Omit to rule that nobody is paid — a decision worth recording, not silence. */
  award_to_user_id?: string | null;
  reason: string;
};

export type DisputeFilters = {
  status?: DisputeStatus;
  projectId?: string;
  taskerId?: string;
  raisedFrom?: string;
  raisedTo?: string;
  awaitingAdjudication?: boolean;
};

/** What the signed-in tasker can do about a dispute right now. */
export type DisputeAction = "withdraw" | "revoke" | "waiting" | "none";

export const disputeActionFor = (dispute: Dispute): DisputeAction => {
  if (dispute.can_withdraw) return "withdraw";
  if (dispute.can_revoke) return "revoke";
  if (dispute.status === "PENDING") return "waiting";
  return "none";
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

/** "2 of 3 have stepped back" — the only genuinely new idea in an N-party view. */
export const disputeProgress = (dispute: Dispute): string => {
  const total = dispute.claimants.length;
  return `${dispute.withdrawn_count} of ${total} ${
    dispute.withdrawn_count === 1 ? "has" : "have"
  } stepped back`;
};

/** Everyone except the signed-in user, for "you and X, Y" phrasing. */
export const otherClaimants = (dispute: Dispute): DisputeClaimant[] =>
  dispute.claimants.filter((claimant) => !claimant.is_you);

/** A dispute an admin can still rule on — expired, unsettled, never adjudicated. */
export const awaitsAdjudication = (dispute: Dispute): boolean =>
  dispute.status === "FORFEITED" && !dispute.adjudicated_at;
