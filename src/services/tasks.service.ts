import { apiClient, cleanParams } from "./api";
import type {
  DuplicateLogReport,
  TaskEntry,
  TaskEntryCreate,
  TaskFilters,
  TaskImportSummary,
  TaskOverview,
} from "@/types";

export const tasksService = {
  /**
   * Bulk import. The whole file is rejected if any row fails to parse or a
   * required header is missing — nothing posts partially.
   */
  import: async (
    file: File,
    projectId: string,
    onProgress?: (percent: number) => void,
  ): Promise<TaskImportSummary> => {
    const form = new FormData();
    form.append("file", file);
    form.append("projectId", projectId);

    const { data } = await apiClient.post<TaskImportSummary>("/tasks/import", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return data;
  },

  /** Single "log as you go" entry — same validation as the bulk path. */
  create: async (payload: TaskEntryCreate): Promise<TaskImportSummary> => {
    const { data } = await apiClient.post<TaskImportSummary>("/tasks", payload);
    return data;
  },

  /** The caller's own entries, carrying `dispute_state` so a tasker sees disputes. */
  mine: async (projectId?: string): Promise<TaskEntry[]> => {
    const { data } = await apiClient.get<TaskEntry[]>("/tasks/mine", {
      params: cleanParams({ projectId }),
    });
    return data;
  },

  /** Admin: every entry plus aggregates over the same filter set. */
  overview: async (filters: TaskFilters = {}): Promise<TaskOverview> => {
    const { data } = await apiClient.get<TaskOverview>("/tasks", {
      params: cleanParams(filters),
    });
    return data;
  },

  /** Admin: log of skipped duplicate uploads, with a per-tasker count. */
  duplicates: async (filters: { taskerId?: string; projectId?: string } = {}) => {
    const { data } = await apiClient.get<DuplicateLogReport>("/tasks/duplicates", {
      params: cleanParams(filters),
    });
    return data;
  },
};
