/** Invoices. One invoice = one tasker × one project × one billing period. */

export const INVOICE_STATUSES = ["Draft", "Issued", "Paid", "Overdue", "Invalidated"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/**
 * The statuses an admin can move an invoice between.
 *
 * `Invalidated` is not one of them: it is terminal and has its own action,
 * because voiding also releases the work the invoice billed so it can be
 * invoiced again. Nothing comes back out of it.
 */
export const INVOICE_TRANSITIONS = ["Draft", "Issued", "Paid", "Overdue"] as const;
export type InvoiceTransition = (typeof INVOICE_TRANSITIONS)[number];

/** A frozen snapshot of one billed task row, taken at generation time. */
export type InvoiceItem = {
  task_id: string;
  task_date: string;
  task_status: string;
  duration_display: string;
  cap_minutes: number;
  paid_minutes: number;
  account: string;
};

/** One deduction applied to this invoice from an earlier overpayment. */
export type InvoiceAdjustmentLine = {
  adjustment_id: string;
  task_id: string | null;
  amount: number;
  outstanding_after: number;
  reason: string | null;
};

/** Rows found in the period but left off the invoice, and why. */
export type InvoiceExclusions = {
  count: number;
  disputed: number;
  forfeited: number;
  not_completed: number;
};

export type Invoice = {
  id: string;
  external_id: string;
  party_type: string;
  /** The tasker's user id, stored as a string. */
  party_id: string | null;
  period_id: string;
  project_id: string | null;
  period_start: string | null;
  period_end: string | null;
  /** $/hr, frozen at generation. */
  rate: number | null;
  /** Revenue share %, frozen at generation. */
  payment_rate: number | null;
  items: InvoiceItem[] | null;
  exclusions: InvoiceExclusions | null;
  subtotal: number;
  /** Negative when money was recovered from an earlier overpayment. */
  adjustments: number;
  adjustment_detail: InvoiceAdjustmentLine[] | null;
  total: number;
  status: InvoiceStatus;
  issued_at: string | null;
  paid_at: string | null;
  invalidated_at: string | null;
  invalidated_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceInvalidateRequest = {
  reason: string;
};

export type InvoiceGenerateRequest = {
  project_id: string;
  period_start: string;
  period_end: string;
  invoice_number?: string;
  /**
   * Also bill never-invoiced work dated before the period — typically a task
   * that was under dispute when its own period was billed and has since
   * resolved. Defaults to true server-side.
   */
  include_carryover?: boolean;
  /** Admin-only. A TASKER sending any of the three below gets a 403. */
  tasker_id?: string;
  rate?: number;
  payment_rate?: number;
};

export type BulkInvoiceGenerateRequest = {
  period_start: string;
  period_end: string;
  /** Omit for every non-deactivated project / every assigned tasker. */
  project_ids?: string[];
  tasker_ids?: string[];
  include_carryover?: boolean;
  /** Report what would happen without writing anything. */
  dry_run?: boolean;
};

/** One tasker x project pair considered by a bulk run. */
export type BulkInvoiceLine = {
  project_id: string;
  project_name: string;
  tasker_id: string;
  tasker_name: string;
  generated: boolean;
  reason: string | null;
  invoice_id: string | null;
  external_id: string | null;
  billable_tasks: number;
  billable_minutes: number;
  /** Billed here but dated before period_start — resolved-since-last-time work. */
  carried_over: number;
  total: number;
};

export type BulkInvoiceResult = {
  dry_run: boolean;
  period_start: string;
  period_end: string;
  generated_count: number;
  skipped_count: number;
  total_value: number;
  lines: BulkInvoiceLine[];
};

export type InvoiceFilters = {
  projectId?: string;
  taskerId?: string;
  status?: InvoiceStatus;
};

/** Total billable minutes on an invoice, from its frozen line items. */
export const invoiceBilledMinutes = (invoice: Invoice): number =>
  (invoice.items ?? []).reduce((sum, item) => sum + item.paid_minutes, 0);

/**
 * Line items dated before the invoice period — work that only became billable
 * after its own period had already been invoiced (a dispute resolving late is
 * the usual cause). Derived from the frozen items, so no extra field is needed.
 */
export const invoiceCarryOverItems = (invoice: Invoice): InvoiceItem[] => {
  if (!invoice.period_start) return [];
  return (invoice.items ?? []).filter((item) => item.task_date < invoice.period_start!);
};
