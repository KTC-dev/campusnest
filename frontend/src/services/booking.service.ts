import { api } from "./api";
import { ApiResponse, Booking, BookingStatus } from "@/types";

export const bookingService = {
  async create(propertyId: string, moveInDate: string, message?: string) {
    const { data } = await api.post<ApiResponse<Booking>>("/bookings", { propertyId, moveInDate, message });
    return data.data;
  },

  async listMine() {
    const { data } = await api.get<ApiResponse<Booking[]>>("/bookings/mine");
    return data.data;
  },

  async cancel(id: string) {
    const { data } = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
    return data.data;
  },

  async listForLandlord() {
    const { data } = await api.get<ApiResponse<Booking[]>>("/bookings/landlord");
    return data.data;
  },

  async respond(id: string, status: Extract<BookingStatus, "APPROVED" | "REJECTED">) {
    const { data } = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/respond`, { status });
    return data.data;
  },
};
