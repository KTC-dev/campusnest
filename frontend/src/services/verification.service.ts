import { api } from "./api";
import { ApiResponse, VerificationRequest as VerificationRequestType } from "@/types";

export interface VerificationSubmissionPayload {
    idDocument: string;
    selfie?: string;
    proofOfOwnership?: string;
}

export type VerificationRequest = VerificationRequestType;

export const verificationService = {
    async submit(payload: VerificationSubmissionPayload) {
        const { data } = await api.post<ApiResponse<VerificationRequest>>("/agents/verification", payload);
        return data.data;
    },

    async getMyVerification() {
        const { data } = await api.get<ApiResponse<VerificationRequest>>("/agents/verification/my");
        return data.data;
    },

    async listForAdmin() {
        const { data } = await api.get<ApiResponse<VerificationRequest[]>>("/admin/verifications");
        return data.data;
    },

    async getById(id: string) {
        const { data } = await api.get<ApiResponse<VerificationRequest>>(`/admin/verifications/${id}`);
        return data.data;
    },

    async approve(id: string, adminNotes?: string) {
        const { data } = await api.patch<ApiResponse<VerificationRequest>>(`/admin/verifications/${id}/approve`, { adminNotes });
        return data.data;
    },

    async reject(id: string, adminNotes?: string) {
        const { data } = await api.patch<ApiResponse<VerificationRequest>>(`/admin/verifications/${id}/reject`, { adminNotes });
        return data.data;
    },
};
