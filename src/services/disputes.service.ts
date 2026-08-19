import { apiClient, cleanParams, downloadFile } from "./api";
import type { ConfirmDisputeRequest, Dispute, DisputeFilters } from "@/types";

export const disputesService = {
  /** The signed-in tasker's disputes, either side of them. */
  mine: async (): Promise<Dispute[]> => {
    const { data } = await apiClient.get<Dispute[]>("/disputes/mine");
    return data;
  },

  /** Admin listing, filterable by status/project/tasker/date. */
  list: async (filters: DisputeFilters = {}): Promise<Dispute[]> => {
    const { data } = await apiClient.get<Dispute[]>("/disputes", {
      params: cleanParams(filters),
    });
    return data;
  },

  /** Claim ownership; the other party then has to confirm for it to resolve. */
  claim: async (disputeId: string): Promise<Dispute> => {
    const { data } = await apiClient.post<Dispute>(`/disputes/${disputeId}/claim`);
    return data;
  },

  /**
   * The non-claiming party confirms the transfer. Naming both the task and the
   * recipient is deliberate — it stops a confirm landing on the wrong dispute.
   */
  confirm: async (disputeId: string, payload: ConfirmDisputeRequest): Promise<Dispute> => {
    const { data } = await apiClient.post<Dispute>(`/disputes/${disputeId}/confirm`, payload);
    return data;
  },

  /**
   * Undo a confirmation: the dispute goes back to PENDING with no claim, so
   * either party can claim it again. Only the confirming party may do this,
   * only inside the 5-day window, and only while neither entry is invoiced —
   * all enforced server-side; `dispute.can_revoke` mirrors the answer.
   */
  revoke: async (disputeId: string): Promise<Dispute> => {
    const { data } = await apiClient.post<Dispute>(`/disputes/${disputeId}/revoke`);
    return data;
  },

  exportPdf: async (filters: DisputeFilters = {}): Promise<void> => {
    // The export route names the status param `status_filter`, unlike the list
    // route which aliases it to `status`.
    const { status, ...rest } = filters;
    const query = new URLSearchParams(
      cleanParams({ ...rest, status_filter: status }) as Record<string, string>,
    ).toString();
    await downloadFile(`/disputes/export/pdf${query ? `?${query}` : ""}`, "dispute-report.pdf");
  },
};
