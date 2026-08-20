import { apiClient, unwrap } from "./api";
import type { ApiEnvelope, Project, ProjectCreate, ProjectUpdate } from "@/types";

export const projectsService = {
  list: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<ApiEnvelope<Project[]>>("/projects/");
    return unwrap(data);
  },

  get: async (id: string): Promise<Project> => {
    const { data } = await apiClient.get<ApiEnvelope<Project>>(`/projects/${id}`);
    return unwrap(data);
  },

  create: async (payload: ProjectCreate): Promise<Project> => {
    const { data } = await apiClient.post<ApiEnvelope<Project>>("/projects/", payload);
    return unwrap(data);
  },

  update: async (id: string, payload: ProjectUpdate): Promise<Project> => {
    const { data } = await apiClient.put<ApiEnvelope<Project>>(`/projects/${id}`, payload);
    return unwrap(data);
  },

  /**
   * Deactivates rather than deletes: the project's Cloudinary resources are
   * purged and its status becomes DEACTIVATED, but assignments and historical
   * task/invoice data survive. The row stays in every list.
   */
  deactivate: async (id: string): Promise<Project> => {
    const { data } = await apiClient.delete<ApiEnvelope<Project>>(`/projects/${id}`);
    return unwrap(data);
  },
};
