import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { notificationsService } from "@/services";
import type { NotificationFeed } from "@/types";

/** How often the bell re-checks. Polling, not websockets — the event rate here
 *  is a handful a day per person, which does not justify a socket. */
const POLL_MS = 60_000;

const EMPTY: NotificationFeed = { unread: 0, items: [] };

/**
 * The notification feed behind the bell.
 *
 * Polls on an interval and refreshes whenever the tab regains focus, which
 * covers the common case of leaving the app open on a second monitor. Failures
 * are swallowed: a stale badge is not worth interrupting the page for.
 */
export function useNotifications() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<NotificationFeed>(EMPTY);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const next = await notificationsService.feed({ limit: 30 });
      if (mounted.current) setFeed(next);
    } catch {
      // Ignored on purpose — see the note above.
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    mounted.current = true;
    if (!user) {
      setFeed(EMPTY);
      return;
    }

    void refresh();
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      mounted.current = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, refresh]);

  const markRead = useCallback(async (id: string) => {
    // Optimistic: the badge should drop the instant it is clicked.
    setFeed((current) => ({
      unread: Math.max(0, current.unread - 1),
      items: current.items.map((item) =>
        item.id === id && !item.read_at
          ? { ...item, read_at: new Date().toISOString() }
          : item,
      ),
    }));
    try {
      await notificationsService.markRead(id);
    } catch {
      void refresh();
    }
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    setFeed((current) => ({
      unread: 0,
      items: current.items.map((item) => ({
        ...item,
        read_at: item.read_at ?? new Date().toISOString(),
      })),
    }));
    try {
      await notificationsService.markAllRead();
    } catch {
      void refresh();
    }
  }, [refresh]);

  return { feed, loading, refresh, markRead, markAllRead };
}
