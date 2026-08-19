import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Bell, CheckCheck, Info, TriangleAlert } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { formatRelative } from "@/lib/format";
import { notificationLink, type AppNotification } from "@/types";

const SEVERITY_ICON = {
  INFO: Info,
  ACTION: AlertTriangle,
  WARNING: TriangleAlert,
} as const;

const SEVERITY_CLASS = {
  INFO: "text-sky2",
  ACTION: "text-warn",
  WARNING: "text-bad",
} as const;

/**
 * The notification bell.
 *
 * Several things in this product happen *to* a person rather than by them — a
 * dispute raised against their task, a deadline passing, an admin generating
 * their invoice, a deduction approved against their pay. Before this the only
 * way to learn any of it was to open the right page and notice.
 */
export function NotificationBell() {
  const { isAdmin } = useAuth();
  const { feed, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const row = (notification: AppNotification) => {
    const Icon = SEVERITY_ICON[notification.severity];
    const to = notificationLink(notification, isAdmin);
    const unread = !notification.read_at;

    const body = (
      <div className="flex gap-2.5">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${SEVERITY_CLASS[notification.severity]}`} />
        <div className="min-w-0 flex-1">
          <p className={`text-sm ${unread ? "font-semibold text-frost" : "text-mist"}`}>
            {notification.title}
          </p>
          <p className="mt-0.5 line-clamp-3 text-xs text-mist">{notification.body}</p>
          <p className="mt-1 text-[11px] text-dim">{formatRelative(notification.created_at)}</p>
        </div>
        {unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-azure" />}
      </div>
    );

    const className = `block w-full rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-panel2/60 ${
      unread ? "bg-ink2/40" : ""
    }`;

    return to ? (
      <Link
        key={notification.id}
        to={to}
        className={className}
        onClick={() => {
          void markRead(notification.id);
          setOpen(false);
        }}
      >
        {body}
      </Link>
    ) : (
      <button
        key={notification.id}
        type="button"
        className={className}
        onClick={() => void markRead(notification.id)}
      >
        {body}
      </button>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={feed.unread ? `Notifications, ${feed.unread} unread` : "Notifications"}
          className="relative rounded-lg border border-line bg-ink2/60 p-2 text-mist transition-colors hover:text-frost"
        >
          <Bell className="h-4 w-4" />
          {feed.unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-azure px-1 text-[10px] font-bold text-white">
              {feed.unread > 9 ? "9+" : feed.unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-2">
        <div className="flex items-center justify-between px-1.5 pb-2">
          <p className="text-sm font-semibold text-frost">Notifications</p>
          {feed.unread > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => void markAllRead()}
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>

        {feed.items.length === 0 ? (
          <p className="px-2.5 py-6 text-center text-sm text-mist">Nothing yet.</p>
        ) : (
          <div className="max-h-[min(26rem,60vh)] space-y-1 overflow-y-auto">
            {feed.items.map(row)}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
