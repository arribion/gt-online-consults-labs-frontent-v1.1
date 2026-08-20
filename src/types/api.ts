/**
 * Shapes the API wraps its payloads in.
 *
 * The backend is not uniform about this: members/projects/resources/assignments
 * return a `{ success, data }` envelope, while tasks/disputes/invoices return
 * the payload bare. The service layer unwraps both, so nothing above
 * `src/services/` ever has to know which is which.
 */

export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type ApiListEnvelope<T> = ApiEnvelope<T[]> & {
  count?: number;
};

export type ApiMessage = {
  success: boolean;
  message: string;
};

/** Loading/error/data triple every data hook returns. */
export type AsyncState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};
