import { apiClient, cleanParams } from "./api";
import type { AppNotification, NotificationFeed } from "@/types";

export const notificationsService = {
  feed: async (options: { unreadOnly?: boolean; limit?: number } = {}): Promise<NotificationFeed> => {
    const { data } = await apiClient.get<NotificationFeed>("/notifications", {
      params: cleanParams(options),
    });
    return data;
  },

  /** Just the number, for the shell badge — cheap enough to poll. */
  unread: async (): Promise<number> => {
    const { data } = await apiClient.get<{ unread: number }>("/notifications/unread");
    return data.unread;
  },

  markRead: async (id: string): Promise<AppNotification> => {
    const { data } = await apiClient.patch<AppNotification>(`/notifications/${id}/read`);
    return data;
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.post("/notifications/read-all");
  },
};
