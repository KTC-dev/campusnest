import { api } from "./api";
import { ApiResponse, Review, ReviewResult, CreateReviewPayload } from "@/types";

export const reviewService = {
  async create(payload: CreateReviewPayload) {
    const { data } = await api.post<ApiResponse<Review>>("/reviews/properties", payload);
    return data.data;
  },

  async getForProperty(propertyId: string, page = 1, pageSize = 20) {
    const { data } = await api.get<ApiResponse<ReviewResult>>(`/reviews/properties/${propertyId}/reviews`, { params: { page, pageSize } });
    return data.data;
  },

  async getMyReview() {
    const { data } = await api.get<ApiResponse<Review | null>>("/reviews/my");
    return data.data;
  },

  async update(reviewId: string, payload: Partial<CreateReviewPayload & { agentResponse?: string }>) {
    const { data } = await api.patch<ApiResponse<Review>>(`/reviews/reviews/${reviewId}`, payload);
    return data.data;
  },

  async delete(reviewId: string) {
    await api.delete(`/reviews/reviews/${reviewId}`);
  },

  async voteHelpful(reviewId: string, helpful: boolean) {
    const { data } = await api.post<ApiResponse<Review>>(`/reviews/reviews/${reviewId}/helpful`, { helpful });
    return data.data;
  },
};
