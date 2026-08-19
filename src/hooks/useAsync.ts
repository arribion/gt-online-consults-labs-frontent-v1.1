import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { errorMessage } from "@/services";

type AsyncResult<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T>>;
};

/**
 * Fetch-on-mount with refetch, used by every screen that reads from the API.
 *
 * `deps` drives re-fetching the same way `useEffect` does. Responses that land
 * after the inputs changed (or after unmount) are dropped, so switching a
 * filter quickly can't leave stale rows on screen.
 */
export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
  initial: T,
  options: { enabled?: boolean } = {},
): AsyncResult<T> {
  const { enabled = true } = options;
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const runId = useRef(0);

  const run = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const current = ++runId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (current === runId.current) setData(result);
    } catch (err) {
      if (current === runId.current) setError(errorMessage(err));
    } finally {
      if (current === runId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    const generation = runId;
    void run();
    return () => {
      // invalidate whatever is in flight when the inputs change or we unmount
      generation.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  return { data, loading, error, refetch: run, setData };
}

/**
 * One-shot actions (create, delete, upload). Surfaces the outcome as a toast so
 * every mutation in the app reports itself the same way.
 */
export function useMutation<Args extends unknown[], T>(
  action: (...args: Args) => Promise<T>,
  options: { success?: string; onDone?: (result: T) => void } = {},
) {
  const [pending, setPending] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const actionRef = useRef(action);
  actionRef.current = action;

  const mutate = useCallback(async (...args: Args): Promise<T | null> => {
    setPending(true);
    try {
      const result = await actionRef.current(...args);
      if (optionsRef.current.success) toast.success(optionsRef.current.success);
      optionsRef.current.onDone?.(result);
      return result;
    } catch (err) {
      toast.error(errorMessage(err));
      return null;
    } finally {
      setPending(false);
    }
  }, []);

  return { mutate, pending };
}
