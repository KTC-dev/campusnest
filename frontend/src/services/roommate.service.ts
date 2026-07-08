import { api } from "./api";
import { ApiResponse, RoommateProfile } from "@/types";

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

export interface RoommateMatchCandidate {
  score: number;
  profile: RoommateProfile & {
    student: {
      id: string;
      firstName: string;
      lastName: string;
      faculty?: string | null;
      level?: string | null;
      avatarUrl?: string | null;
      university?: { id: string; name: string };
    };
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

  async getMatches() {
    const { data } = await api.get<ApiResponse<RoommateMatchCandidate[]>>("/roommates/matches");
    return data.data;
  },
};
