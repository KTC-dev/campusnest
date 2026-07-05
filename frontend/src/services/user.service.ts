import { api } from "./api";
import { ApiResponse, UserProfile } from "@/types";

export interface UpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    faculty?: string | null;
    level?: string | null;
    avatarUrl?: string | null;
    businessName?: string | null;
    universityId?: string;
}

export const userService = {
    async getMe() {
        const { data } = await api.get<ApiResponse<UserProfile>>("/users/me");
        return data.data;
    },

    async update(payload: UpdateProfilePayload) {
        const { data } = await api.patch<ApiResponse<UserProfile>>("/users", payload);
        return data.data;
    },
};
