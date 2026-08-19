import { apiClient, cleanParams, downloadFile } from "./api";
import type {
  BulkInvoiceGenerateRequest,
  BulkInvoiceResult,
  Invoice,
  InvoiceFilters,
  InvoiceGenerateRequest,
  InvoiceTransition,
} from "@/types";

export const invoicesService = {
  /**
   * One invoice covers one tasker × one project × one period. A tasker working
   * several projects needs one call per project — the PDF carries a single
   * rate and cap, so a combined invoice was ruled out deliberately.
   *
   * A TASKER caller must not send `rate`/`payment_rate`/another `tasker_id`;
   * those are server-computed and the backend returns 403 if they appear.
   */
  generate: async (payload: InvoiceGenerateRequest): Promise<Invoice> => {
    const { data } = await apiClient.post<Invoice>("/invoices/generate", payload);
    return data;
  },

  /**
   * Admin: invoice a whole period in one pass, one invoice per tasker per
   * project. Send `dry_run` first — an invoice cannot be un-generated.
   */
  generateBulk: async (payload: BulkInvoiceGenerateRequest): Promise<BulkInvoiceResult> => {
    const { data } = await apiClient.post<BulkInvoiceResult>("/invoices/generate-bulk", payload);
    return data;
  },

  /** Role-scoped: a TASKER only ever sees their own. */
  list: async (filters: InvoiceFilters = {}): Promise<Invoice[]> => {
    const { data } = await apiClient.get<Invoice[]>("/invoices", {
      params: cleanParams(filters),
    });
    return data;
  },

  get: async (id: string): Promise<Invoice> => {
    const { data } = await apiClient.get<Invoice>(`/invoices/${id}`);
    return data;
  },

  /** Admin only. Marking Paid stamps `paid_at`; moving away from Paid clears it. */
  setStatus: async (id: string, status: InvoiceTransition): Promise<Invoice> => {
    const { data } = await apiClient.patch<Invoice>(`/invoices/${id}/status`, { status });
    return data;
  },

  downloadPdf: async (invoice: Invoice): Promise<void> => {
    await downloadFile(`/invoices/${invoice.id}/pdf`, `${invoice.external_id}.pdf`);
  },

  /**
   * Admin: void an invoice for good and release the work it billed, so the
   * next generation picks up whatever is still rightfully theirs.
   *
   * Terminal. An invoice is only invalidated because it bills work that turned
   * out not to be this tasker's, and clearing a flag could not make that
   * document correct again. A paid invoice cannot be invalidated at all —
   * that money is out of the door, and an adjustment is what recovers it.
   */
  invalidate: async (id: string, reason: string): Promise<Invoice> => {
    const { data } = await apiClient.post<Invoice>(`/invoices/${id}/invalidate`, { reason });
    return data;
  },
};
