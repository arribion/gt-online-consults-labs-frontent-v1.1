import { apiClient, cleanParams, unwrap } from "./api";
import type { ApiEnvelope, Resource, ResourceUpload } from "@/types";

export const resourcesService = {
  /**
   * A TASKER only ever gets resources for projects they're actively assigned
   * to; admins see everything. Passing a `projectID` a tasker isn't on is a 403.
   */
  list: async (projectID?: string): Promise<Resource[]> => {
    const { data } = await apiClient.get<ApiEnvelope<Resource[]>>("/resources/get", {
      params: cleanParams({ projectID }),
    });
    return unwrap(data);
  },

  upload: async (
    payload: ResourceUpload,
    onProgress?: (percent: number) => void,
  ): Promise<{ resourceId: string; fileUrl: string; publicId: string; type: string }> => {
    const form = new FormData();
    form.append("file", payload.file);
    form.append("projectID", payload.projectID);
    form.append("title", payload.title);
    form.append("description", payload.description);
    form.append("version", payload.version);

    const { data } = await apiClient.post<
      ApiEnvelope<{ resourceId: string; fileUrl: string; publicId: string; type: string }>
    >("/resources/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return unwrap(data);
  },

  remove: async (resourceId: string): Promise<void> => {
    await apiClient.delete(`/resources/delete/${resourceId}`);
  },
};
