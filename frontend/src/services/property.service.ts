import { api } from "./api";
import { ApiResponse, Amenity, CreatePropertyPayload, Property, PropertyFilters, PropertyListResult } from "@/types";

export const propertyService = {
  async list(filters: PropertyFilters) {
    const { data } = await api.get<ApiResponse<PropertyListResult>>("/properties", { params: filters });
    return data.data;
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Property>>(`/properties/${id}`);
    return data.data;
  },

  async listAmenities() {
    const { data } = await api.get<ApiResponse<Amenity[]>>("/properties/amenities");
    return data.data;
  },

  async listMine() {
    const { data } = await api.get<ApiResponse<Property[]>>("/properties/mine");
    return data.data;
  },

  async create(payload: CreatePropertyPayload) {
    const { data } = await api.post<ApiResponse<Property>>("/properties", payload);
    return data.data;
  },

  async update(id: string, payload: Partial<CreatePropertyPayload> & { isAvailable?: boolean }) {
    const { data } = await api.patch<ApiResponse<Property>>(`/properties/${id}`, payload);
    return data.data;
  },

  async remove(id: string) {
    await api.delete(`/properties/${id}`);
  },

  async listFavourites() {
    const { data } = await api.get<ApiResponse<Property[]>>("/properties/favourites");
    return data.data;
  },

  async toggleFavourite(id: string) {
    const { data } = await api.post<ApiResponse<{ favourited: boolean }>>(`/properties/${id}/favourite`);
    return data.data;
  },
};
