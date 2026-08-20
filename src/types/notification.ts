/**
 * In-app notifications.
 *
 * Several things in this system happen *to* a tasker rather than by them: a
 * dispute raised against their task, a deadline passing, an admin generating
 * their invoice, a deduction approved against their next payment. Before this
 * the only way to learn any of it was to open the app and notice.
 */

export const NOTIFICATION_SEVERITIES = ["INFO", "ACTION", "WARNING"] as const;
export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];

export type AppNotification = {
  id: string;
  /** Machine-readable event name, e.g. "dispute.raised", "invoice.generated". */
  event: string;
  title: string;
  body: string;
  entity_type: string | null;
  entity_id: string | null;
  /** The rendered facts behind the message — amounts, names, periods. */
  meta: Record<string, unknown> | null;
  severity: NotificationSeverity;
  read_at: string | null;
  created_at: string;
};

export type NotificationFeed = {
  unread: number;
  items: AppNotification[];
};

/** Where a notification should take you when opened. */
export const notificationLink = (notification: AppNotification, isAdmin: boolean): string | null => {
  const { entity_type: type, entity_id: id } = notification;
  if (!type || !id) return null;

  switch (type) {
    case "dispute":
      return isAdmin ? "/admin/disputes" : "/app/disputes";
    case "invoice":
      return isAdmin ? `/admin/invoices/${id}` : `/app/invoices/${id}`;
    case "adjustment":
      return isAdmin ? "/admin/adjustments" : "/app/invoices";
    default:
      return null;
  }
};
