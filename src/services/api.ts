import axios, { AxiosError, type AxiosRequestConfig, type AxiosInstance } from "axios";
import type { ApiEnvelope } from "@/types";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/+$/, "");

if (!BASE_URL) {
  console.error("VITE_BASE_URL is missing — set it in client/.env before starting the app.");
}

export const API_ROOT = `${BASE_URL}/api/v1`;

/**
 * The one HTTP client in the app.
 *
 * Auth is an httpOnly cookie the backend sets at login, so every request must
 * carry credentials — there is no bearer token in localStorage to attach, and
 * any code that looks for one is dead.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/** Pull a human-readable message out of whatever shape the error arrived in. */
export const errorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    // FastAPI returns a string for HTTPException and an array for 422s.
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const first = detail[0];
      if (first?.msg) {
        const field = Array.isArray(first.loc) ? first.loc.slice(1).join(".") : "";
        return field ? `${field}: ${first.msg}` : first.msg;
      }
    }
    /*
     * The task-upload endpoints reject a whole file with a structured body —
     * `{ message, errors, duplicate_task_ids }` — because a file can fail for
     * several reasons at once and naming only the first is useless. Without
     * this branch that body falls through to "Something went wrong", which is
     * the least helpful possible response to a spreadsheet with a bad row in it.
     */
    if (detail && typeof detail === "object" && !Array.isArray(detail)) {
      const { message, errors } = detail as { message?: string; errors?: string[] };
      if (message && errors?.length) return `${message} ${errors.join(" ")}`;
      if (message) return message;
      if (errors?.length) return errors.join(" ");
    }
    if (typeof error.response?.data?.message === "string") return error.response.data.message;
    if (error.response?.status === 403) return "You don't have permission to do that.";
    if (!error.response) return "Can't reach the server. Check your connection and try again.";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

let refreshInFlight: Promise<unknown> | null = null;

/**
 * A 401 on an authenticated call usually just means the 1-hour access cookie
 * lapsed while the tab was open. Refresh once and replay the request; only give
 * up (and let the route guard bounce to /login) if the refresh itself fails.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const url = config?.url ?? "";
    const isAuthCall = url.startsWith("/auth/");

    if (error.response?.status === 401 && config && !config._retried && !isAuthCall) {
      config._retried = true;
      try {
        refreshInFlight ??= axios
          .post(`${API_ROOT}/auth/refresh`, {}, { withCredentials: true })
          .finally(() => {
            refreshInFlight = null;
          });
        await refreshInFlight;
        return apiClient.request(config);
      } catch {
        // fall through to the rejection below
      }
    }

    return Promise.reject(new Error(errorMessage(error)));
  },
);

/** Unwrap the `{ success, data }` envelope the older routers still use. */
export const unwrap = <T,>(payload: ApiEnvelope<T>): T => payload.data;

/** Drop undefined/empty values so they never reach the URL as `?x=`. */
export const cleanParams = <T extends object>(params: T): Record<string, string | number> => {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = value as string | number;
  }
  return out;
};

/** Trigger a browser download for an endpoint that streams a PDF. */
export const downloadFile = async (path: string, filename: string): Promise<void> => {
  const response = await apiClient.get(path, { responseType: "blob" });
  const url = URL.createObjectURL(response.data as Blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
