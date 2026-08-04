// src/hooks/useAdminApi.ts
import axios from "axios";
import { useCallback } from "react";
import toast from "react-hot-toast";
import type { PaymentItem } from "../types/admin";

const BASE = import.meta.env.VITE_BASE_URL || "";
const API = `${BASE}/api/v1/admin`;

const client = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const DEFAULT_STATS = {
  totalMembers: 0,
  totalProjects: 0,
  paidUsers: 0,
  pendingPayments: 0,
  totalPaidOut: 0,
  activeProjects: 0,
  membersChange: "+0%",
  projectsChange: "+0%",
  paidChange: "+0%",
  pendingChange: "+0%",
  membersTrend: "up",
  projectsTrend: "up",
  paidTrend: "up",
  pendingTrend: "down",
};

export default function useAdminApi() {
  const getStats = useCallback(async () => {
    try {
      const res = await client.get("/stats");
      return res.data || DEFAULT_STATS;
    } catch (err: any) {
      // optional toast but still return defaults
      toast.error("Failed to load admin stats — showing defaults.");
      return DEFAULT_STATS;
    }
  }, []);

  const getRecentPayments = useCallback(async (): Promise<PaymentItem[]> => {
    try {
      const res = await client.get("/payments/recent");
      return res.data || [];
    } catch (err: any) {
      toast.error("Failed to load recent payments.");
      return [];
    }
  }, []);

  return { getStats, getRecentPayments };
}
