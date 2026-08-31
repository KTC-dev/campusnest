import { api } from "./api";
import { ApiResponse, AccommodationRequest, CreateAccommodationRequestPayload, AccommodationRequestFilters, AccommodationRequestResult } from "@/types";

export const accommodationRequestService = {
  async create(payload: CreateAccommodationRequestPayload) {
    const { data } = await api.post<ApiResponse<AccommodationRequest>>("/accommodation-requests", payload);
    return data.data;
  },

  async listMine(filters?: AccommodationRequestFilters) {
    const { data } = await api.get<ApiResponse<AccommodationRequestResult>>("/accommodation-requests/mine", { params: filters });
    return data.data;
  },

  async listOpen(filters?: AccommodationRequestFilters) {
    const { data } = await api.get<ApiResponse<AccommodationRequestResult>>("/accommodation-requests/open", { params: filters });
    return data.data;
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<AccommodationRequest>>(`/accommodation-requests/${id}`);
    return data.data;
  },

  async update(id: string, payload: Partial<CreateAccommodationRequestPayload & { status?: string }>) {
    const { data } = await api.patch<ApiResponse<AccommodationRequest>>(`/accommodation-requests/${id}`, payload);
    return data.data;
  },

  async delete(id: string) {
    await api.delete(`/accommodation-requests/${id}`);
  },
};
