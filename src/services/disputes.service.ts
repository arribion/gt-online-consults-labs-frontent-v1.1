import { apiClient, cleanParams, downloadFile } from "./api";
import type {
  AdjudicateDisputeRequest,
  Dispute,
  DisputeFilters,
  ExtendDisputeRequest,
  WithdrawRequest,
} from "@/types";

export const disputesService = {
  /** Every dispute the signed-in tasker is a claimant in. */
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

  /**
   * Give up your claim. Once you are the only claimant who has *not* withdrawn,
   * the task is yours; until then it belongs to nobody. Naming the task is
   * deliberate — withdrawing gives up payment for it, and a mis-click on the
   * wrong row should not be able to do that quietly.
   */
  withdraw: async (disputeId: string, payload: WithdrawRequest): Promise<Dispute> => {
    const { data } = await apiClient.post<Dispute>(`/disputes/${disputeId}/withdraw`, payload);
    return data;
  },

  /**
   * Take your claim back. Only your own withdrawal can be revoked, only while
   * the window is open, and only while no entry has been billed — all enforced
   * server-side; `dispute.can_revoke` mirrors the answer.
   */
  revoke: async (disputeId: string): Promise<Dispute> => {
    const { data } = await apiClient.post<Dispute>(`/disputes/${disputeId}/revoke`);
    return data;
  },

  /**
   * ADMIN: buy the claimants more time. The only intervention allowed while a
   * dispute is live, because it is the only one that decides nothing.
   */
  extend: async (disputeId: string, payload: ExtendDisputeRequest): Promise<Dispute> => {
    const { data } = await apiClient.post<Dispute>(`/disputes/${disputeId}/extend`, payload);
    return data;
  },

  /**
   * SUPERADMIN: rule on a dispute that expired without agreement. Refused
   * while the window is open — the claimants own that period.
   */
  adjudicate: async (disputeId: string, payload: AdjudicateDisputeRequest): Promise<Dispute> => {
    const { data } = await apiClient.post<Dispute>(`/disputes/${disputeId}/adjudicate`, payload);
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
