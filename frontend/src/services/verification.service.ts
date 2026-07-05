import { api } from "./api";
import { ApiResponse, VerificationStatus } from "@/types";

export interface VerificationSubmissionPayload {
    idDocument: string;
    selfie?: string;
    proofOfOwnership?: string;
}

export interface VerificationRequest {
    id: string;
    userId: string;
    idDocumentUrl: string;
    selfieUrl?: string | null;
    proofOfOwnershipUrl?: string | null;
    status: VerificationStatus;
    adminNotes?: string | null;
    createdAt: string;
    reviewedAt?: string | null;
}

export const verificationService = {
    async submit(payload: VerificationSubmissionPayload) {
        const { data } = await api.post<ApiResponse<VerificationRequest>>("/landlords/verification", payload);
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
