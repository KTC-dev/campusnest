import { api } from "./api";
import { ApiResponse } from "@/types";

export interface NotificationPreferences {
    inApp: boolean;
    email: boolean;
    push: boolean;
    securityNotifEnabled: boolean;
}

export const preferencesService = {
    async getNotifications() {
        const { data } = await api.get<ApiResponse<NotificationPreferences>>("/preferences/notifications");
        return data.data;
    },

    async updateNotifications(input: Partial<NotificationPreferences>) {
        const { data } = await api.patch("/preferences/notifications", input);
        return data.data;
    },
};
