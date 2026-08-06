import { api } from "./api";

export interface NotificationPreferences {
    inApp: boolean;
    email: boolean;
    push: boolean;
}

export const preferencesService = {
    async getNotifications() {
        const { data } = await api.get("/preferences/notifications");
        return data.data as NotificationPreferences;
    },

    async updateNotifications(payload: Partial<NotificationPreferences>) {
        const { data } = await api.patch("/preferences/notifications", payload);
        return data.data as NotificationPreferences;
    },
};
