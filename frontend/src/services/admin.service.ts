import { api } from './api';
import {
  AdminBookingRow,
  AdminAgentRow,
  AdminStats,
  AdminStudentRow,
  ApiResponse,
  PaginatedResult,
  Property,
  TrendPoint,
  Review,
} from '@/types';

export const adminService = {
  async getStats() {
    const { data } = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return data.data;
  },

  async getAnalytics() {
    const { data } = await api.get<ApiResponse<{ listingsTrend: TrendPoint[]; bookingsTrend: TrendPoint[] }>>(
      '/admin/analytics'
    );
    return data.data;
  },

  async listStudents(page = 1) {
    const { data } = await api.get<ApiResponse<PaginatedResult<AdminStudentRow>>>('/admin/students', { params: { page } });
    return data.data;
  },

  async listAgents(page = 1) {
    const { data } = await api.get<ApiResponse<PaginatedResult<AdminAgentRow>>>('/admin/agents', { params: { page } });
    return data.data;
  },

  async listBookings(page = 1) {
    const { data } = await api.get<ApiResponse<PaginatedResult<AdminBookingRow>>>('/admin/bookings', { params: { page } });
    return data.data;
  },

  async listPendingProperties() {
    const { data } = await api.get<ApiResponse<Property[]>>('/admin/properties/pending');
    return data.data;
  },

  async setUserActive(userId: string, isActive: boolean) {
    await api.patch('/admin/users/' + userId + '/active', { isActive });
  },

  async moderateProperty(id: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED', rejectionReason?: string) {
    await api.patch('/properties/' + id + '/moderate', { status, rejectionReason });
  },

  async removeFraudulentListing(id: string) {
    await api.delete('/admin/properties/' + id);
  },

  async listFlaggedReviews() {
    const { data } = await api.get<ApiResponse<Review[]>>('/admin/reviews/flagged');
    return data.data;
  },

  async approveReview(reviewId: string) {
    await api.patch('/admin/reviews/' + reviewId + '/approve');
  },

  async rejectReview(reviewId: string, reason: string) {
    await api.patch('/admin/reviews/' + reviewId + '/reject', { reason });
  },

  async removeReview(reviewId: string) {
    await api.delete('/admin/reviews/' + reviewId);
  },
};