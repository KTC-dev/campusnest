import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1, "Property is required"),
    rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    comment: z.string().max(2000).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().max(2000).optional(),
    isApproved: z.boolean().optional(),
    isFlagged: z.boolean().optional(),
    flaggedReason: z.string().max(500).optional(),
    agentResponse: z.string().max(2000).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const reviewIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const propertyReviewParamsSchema = z.object({
  params: z.object({
    propertyId: z.string().min(1),
  }),
});
