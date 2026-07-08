import { api } from "./api";
import { ApiResponse, ConversationMessagesPage, ConversationSummary, ConversationAttachment, MessageType } from "@/types";

export const conversationService = {
    async list() {
        const { data } = await api.get<ApiResponse<ConversationSummary[]>>("/conversations");
        return data.data;
    },

    async get(id: string) {
        const { data } = await api.get<ApiResponse<ConversationSummary>>(`/conversations/${id}`);
        return data.data;
    },

    async listMessages(id: string, params?: { cursor?: string; limit?: number }) {
        const { data } = await api.get<ApiResponse<ConversationMessagesPage>>(`/conversations/${id}/messages`, { params });
        return data.data;
    },

    async create(payload: { propertyId?: string; roommateStudentId?: string; initialMessage?: string }) {
        const { data } = await api.post<ApiResponse<ConversationSummary>>("/conversations", payload);
        return data.data;
    },

    async sendMessage(conversationId: string, payload: { content?: string; messageType?: MessageType; attachments?: ConversationAttachment[] }) {
        const { data } = await api.post<ApiResponse<any>>(`/conversations/${conversationId}/messages`, payload);
        return data.data;
    },

    async uploadMessageFile(payload: { file: string; fileName?: string; mimeType: string }) {
        const { data } = await api.post<ApiResponse<ConversationAttachment>>("/conversations/messages/upload", payload);
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
