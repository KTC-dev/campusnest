import { api } from "./api";
import { ApiResponse } from "@/types";

export const conversationService = {
    async list() {
        const { data } = await api.get<ApiResponse<any[]>>("/conversations");
        return data.data;
    },

    async get(id: string) {
        const { data } = await api.get<ApiResponse<any>>(`/conversations/${id}`);
        return data.data;
    },

    async create(payload: { propertyId: string; initialMessage?: string }) {
        const { data } = await api.post<ApiResponse<any>>("/conversations", payload);
        return data.data;
    },

    async sendMessage(conversationId: string, payload: { content?: string; image?: string; messageType?: string }) {
        const { data } = await api.post<ApiResponse<any>>(`/conversations/${conversationId}/messages`, payload);
        return data.data;
    },

    async markAsRead(messageId: string) {
        const { data } = await api.patch<ApiResponse<any>>(`/conversations/messages/${messageId}/read`);
        return data.data;
    },

    async archive(id: string) {
        const { data } = await api.delete<ApiResponse<any>>(`/conversations/${id}`);
        return data.data;
    },
};
