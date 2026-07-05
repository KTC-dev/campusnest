import { api } from "./api";
import { ApiResponse, AuthTokens, University } from "@/types";

export interface RegisterStudentPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  universityId: string;
  phone?: string;
  acceptedTerms?: boolean;
  acceptedTermsVersion?: string;
  acceptedTermsAt?: string;
}

export interface RegisterLandlordPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  businessName?: string;
  acceptedTerms?: boolean;
  acceptedTermsVersion?: string;
  acceptedTermsAt?: string;
}

export const authService = {
  async loginStudentOrLandlord(email: string, password: string) {
    const { data } = await api.post<ApiResponse<AuthTokens>>("/auth/login", { email, password });
    return data.data;
  },

  async registerStudent(payload: RegisterStudentPayload) {
    const { data } = await api.post<ApiResponse<AuthTokens>>("/auth/register/student", payload);
    return data.data;
  },

  async registerLandlord(payload: RegisterLandlordPayload) {
    const { data } = await api.post<ApiResponse<AuthTokens>>("/auth/register/landlord", payload);
    return data.data;
  },

  async listUniversities() {
    const { data } = await api.get<ApiResponse<University[]>>("/universities");
    return data.data;
  },

  async me() {
    const { data } = await api.get("/auth/me");
    return data.data;
  },
};
