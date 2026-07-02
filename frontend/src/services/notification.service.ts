import { api } from "./api";
import { ApiResponse, Notification } from "@/types";

export const notificationService = {
  async list() {
    const { data } = await api.get<ApiResponse<{ notifications: Notification[]; unreadCount: number }>>(
      "/notifications"
    );
    return data.data;
  },

  async markRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead() {
    await api.patch("/notifications/read-all");
  },
};
