/**
 * Invoice adjustments — money owed back after a paid invoice turned out to
 * bill someone else's work.
 *
 * Narrow by design. It only opens when an invoice reached Paid while its work
 * was still contestable, which the 14-day logging window and the block on
 * paying a disputed invoice both work to prevent. When it does happen the paid
 * invoice is never rewritten: the amount is deducted from the next one.
 */

export const ADJUSTMENT_STATUSES = [
  "PENDING_APPROVAL",
  "APPROVED",
  "PARTIALLY_APPLIED",
  "SETTLED",
  "WRITTEN_OFF",
  "CANCELLED",
] as const;
export type AdjustmentStatus = (typeof ADJUSTMENT_STATUSES)[number];

export type Adjustment = {
  id: string;
  tasker_id: string | null;
  tasker_name: string | null;
  project_id: string | null;
  project_name: string | null;
  source_invoice_id: string | null;
  source_invoice_number: string | null;
  task_id: string | null;
  dispute_id: string | null;

  amount: number;
  applied_amount: number;
  outstanding: number;

  status: AdjustmentStatus;
  reason: string | null;
  closed_reason: string | null;

  created_at: string;
  approved_at: string | null;
  closed_at: string | null;

  age_days: number;
  /** Sitting long enough that waiting is just letting it go stale. */
  stale: boolean;
  /** No live assignment means no future invoice to deduct from. */
  tasker_has_active_assignment: boolean;
};

export type AdjustmentSummary = {
  total_outstanding: number;
  pending_approval: number;
  open_count: number;
  stale_count: number;
  uncollectable_count: number;
  written_off_total: number;
};

export type AdjustmentFilters = {
  status?: AdjustmentStatus;
  taskerId?: string;
  openOnly?: boolean;
};

const OPEN: AdjustmentStatus[] = ["PENDING_APPROVAL", "APPROVED", "PARTIALLY_APPLIED"];

export const isAdjustmentOpen = (adjustment: Adjustment): boolean =>
  OPEN.includes(adjustment.status);

/** Realistically unrecoverable in-app: nothing left to deduct it from. */
export const isUncollectable = (adjustment: Adjustment): boolean =>
  isAdjustmentOpen(adjustment) && !adjustment.tasker_has_active_assignment;

export const ADJUSTMENT_STATUS_LABEL: Record<AdjustmentStatus, string> = {
  PENDING_APPROVAL: "Awaiting approval",
  APPROVED: "Approved",
  PARTIALLY_APPLIED: "Part applied",
  SETTLED: "Settled",
  WRITTEN_OFF: "Written off",
  CANCELLED: "Cancelled",
};
