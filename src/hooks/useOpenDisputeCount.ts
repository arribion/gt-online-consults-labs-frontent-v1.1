import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { disputesService } from "@/services";

/**
 * Open disputes, for the nav badge.
 *
 * There is no notification channel behind disputes — a tasker only ever finds
 * out by opening the app — so the badge is the notification, and it is fetched
 * once per shell mount rather than per page.
 */
export function useOpenDisputeCount(): number {
  const { user, isAdmin } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      try {
        const disputes = isAdmin
          ? await disputesService.list({ status: "PENDING" })
          : (await disputesService.mine()).filter((dispute) => dispute.status === "PENDING");
        if (!cancelled) setCount(disputes.length);
      } catch {
        // A badge is not worth interrupting the page for.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin]);

  return count;
}
