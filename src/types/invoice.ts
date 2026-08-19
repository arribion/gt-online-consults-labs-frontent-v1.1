/** Invoices. One invoice = one tasker × one project × one billing period. */

export const INVOICE_STATUSES = ["Draft", "Issued", "Paid", "Overdue"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

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
  adjustments: number;
  total: number;
  status: InvoiceStatus;
  issued_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceGenerateRequest = {
  project_id: string;
  period_start: string;
  period_end: string;
  invoice_number?: string;
  /** Admin-only. A TASKER sending any of the three below gets a 403. */
  tasker_id?: string;
  rate?: number;
  payment_rate?: number;
};

export type InvoiceFilters = {
  projectId?: string;
  taskerId?: string;
  status?: InvoiceStatus;
};

/** Total billable minutes on an invoice, from its frozen line items. */
export const invoiceBilledMinutes = (invoice: Invoice): number =>
  (invoice.items ?? []).reduce((sum, item) => sum + item.paid_minutes, 0);
