import { apiClient } from "./api";

export type HealthStatus = {
  status: string;
  env: string;
};

export const healthService = {
  /** Unauthenticated liveness probe — used by the admin system panel. */
  check: async (): Promise<HealthStatus> => {
    const { data } = await apiClient.get<HealthStatus>("/health");
    return data;
  },
};
