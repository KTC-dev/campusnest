import { api } from "./api";
import { ApiResponse, RoommateMatch, RoommateProfile } from "@/types";

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

export const roommateService = {
  async getMyProfile() {
    const { data } = await api.get<ApiResponse<RoommateProfile | null>>("/roommates/profile");
    return data.data;
  },

  async saveProfile(payload: RoommateProfilePayload) {
    const { data } = await api.put<ApiResponse<RoommateProfile>>("/roommates/profile", payload);
    return data.data;
  },

  async getMatches() {
    const { data } = await api.get<ApiResponse<RoommateMatch[]>>("/roommates/matches");
    return data.data;
  },
};
