import { apiClient, cleanParams } from "./api";
import type { Adjustment, AdjustmentFilters, AdjustmentSummary } from "@/types";

export const adjustmentsService = {
  /** ADMIN: the outstanding list. */
  list: async (filters: AdjustmentFilters = {}): Promise<Adjustment[]> => {
    const { data } = await apiClient.get<Adjustment[]>("/adjustments", {
      params: cleanParams(filters),
    });
    return data;
  },

  /** ADMIN: headline figures, so the list doesn't have to be read to be understood. */
  summary: async (): Promise<AdjustmentSummary> => {
    const { data } = await apiClient.get<AdjustmentSummary>("/adjustments/summary");
    return data;
  },

  /** What the signed-in tasker owes, before it lands on an invoice. */
  mine: async (): Promise<Adjustment[]> => {
    const { data } = await apiClient.get<Adjustment[]>("/adjustments/mine");
    return data;
  },

  /** ADMIN: make the debt collectable — it comes off their next invoice. */
  approve: async (id: string, note?: string): Promise<Adjustment> => {
    const { data } = await apiClient.post<Adjustment>(`/adjustments/${id}/approve`, { note });
    return data;
  },

  /** SUPERADMIN: give up on recovering it. Forgiving money is a money decision. */
  writeOff: async (id: string, reason: string): Promise<Adjustment> => {
    const { data } = await apiClient.post<Adjustment>(`/adjustments/${id}/write-off`, { reason });
    return data;
  },

  /** ADMIN: retract one raised in error, before any of it was applied. */
  cancel: async (id: string, reason: string): Promise<Adjustment> => {
    const { data } = await apiClient.post<Adjustment>(`/adjustments/${id}/cancel`, { reason });
    return data;
  },
};
