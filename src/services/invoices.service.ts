import { apiClient, cleanParams, downloadFile } from "./api";
import type { Invoice, InvoiceFilters, InvoiceGenerateRequest, InvoiceStatus } from "@/types";

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
  setStatus: async (id: string, status: InvoiceStatus): Promise<Invoice> => {
    const { data } = await apiClient.patch<Invoice>(`/invoices/${id}/status`, { status });
    return data;
  },

  downloadPdf: async (invoice: Invoice): Promise<void> => {
    await downloadFile(`/invoices/${invoice.id}/pdf`, `${invoice.external_id}.pdf`);
  },
};
