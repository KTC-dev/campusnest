import { api } from "./api";
import { ApiResponse, RoommateProfile, RoommateMatchRequest, RoommateMatchCandidate, MatchFilters, Student, SavedMatch } from "@/types";

export interface RoommateProfilePayload {
  budgetMin: number;
  budgetMax: number;
  genderPreference: string;
  sleepSchedule: string;
  cleanliness: string;
  isSmoker: boolean;
  noiseTolerance: string;
  bio?: string;
  isActive: boolean;
}

export interface RoommateProfileView {
  student: Student & {
    university?: { id: string; name: string };
    isVerified: boolean;
    roommateProfile?: RoommateProfile;
  };
}

export const roommateService = {
  async getMyProfile() {
    const { data } = await api.get<ApiResponse<RoommateProfile | null>>("/roommates/profile");
    return data.data;
  },

  async saveProfile(payload: RoommateProfilePayload) {
    const { data } = await api.put<ApiResponse<RoommateProfile>>("/roommates/profile", payload);
    return data.data;
  },

  async getMatches(filters?: Omit<MatchFilters, 'faculty' | 'level'> & { faculty?: string; level?: string }) {
    const { data } = await api.get<ApiResponse<RoommateMatchCandidate[]>>("/roommates/matches", { params: filters });
    return data.data;
  },

  async searchMatches(filters: MatchFilters) {
    const { data } = await api.get<ApiResponse<RoommateMatchCandidate[]>>("/roommates/matches", { params: filters });
    return data.data;
  },

  async getProfileById(studentId: string) {
    const { data } = await api.get<ApiResponse<RoommateProfileView>>(`/roommates/profile/${studentId}`);
    return data.data;
  },

  async sendMatchRequest(receiverId: string, message?: string) {
    const { data } = await api.post<ApiResponse<RoommateMatchRequest>>("/roommates/match-requests", { receiverId, message });
    return data.data;
  },

  async respondToMatchRequest(requestId: string, accept: boolean) {
    const { data } = await api.patch<ApiResponse<{ success: boolean; status: string }>>(`/roommates/match-requests/${requestId}`, { accept });
    return data.data;
  },

  async getSentMatchRequests() {
    const { data } = await api.get<ApiResponse<RoommateMatchRequest[]>>("/roommates/match-requests/sent");
    return data.data;
  },

  async getReceivedMatchRequests() {
    const { data } = await api.get<ApiResponse<RoommateMatchRequest[]>>("/roommates/match-requests/received");
    return data.data;
  },

  async getSavedMatches() {
    const { data } = await api.get<ApiResponse<SavedMatch[]>>("/roommates/saved");
    return data.data;
  },
};