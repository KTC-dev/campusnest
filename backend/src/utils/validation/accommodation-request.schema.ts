import { z } from "zod";

export const createAccommodationRequestSchema = z.object({
  body: z.object({
    universityId: z.string().min(1, "University is required"),
    preferredLocation: z.string().min(1, "Preferred location is required").max(200),
    budgetMin: z.coerce.number().positive("Budget must be positive").optional(),
    budgetMax: z.coerce.number().positive("Budget must be positive").optional(),
    roomType: z.enum(["SELF_CONTAIN", "SHARED", "ONE_BEDROOM", "TWO_BEDROOM", "HOSTEL", "ANY"]),
    genderPreference: z.enum(["ANY", "MALE", "FEMALE"]).default("ANY"),
    moveInDate: z.string().optional(),
    numberOfOccupants: z.coerce.number().int().min(1).max(10).optional(),
    roommateRequired: z.boolean().default(false),
    preferences: z.string().max(1000).optional(),
    additionalNotes: z.string().max(2000).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateAccommodationRequestSchema = z.object({
  body: z.object({
    preferredLocation: z.string().min(1).max(200).optional(),
    budgetMin: z.coerce.number().positive().optional(),
    budgetMax: z.coerce.number().positive().optional(),
    roomType: z.enum(["SELF_CONTAIN", "SHARED", "ONE_BEDROOM", "TWO_BEDROOM", "HOSTEL", "ANY"]).optional(),
    genderPreference: z.enum(["ANY", "MALE", "FEMALE"]).optional(),
    moveInDate: z.string().optional(),
    numberOfOccupants: z.coerce.number().int().min(1).max(10).optional(),
    roommateRequired: z.boolean().optional(),
    preferences: z.string().max(1000).optional(),
    additionalNotes: z.string().max(2000).optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listAccommodationRequestsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(20),
    status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
    universityId: z.string().optional(),
    roomType: z.enum(["SELF_CONTAIN", "SHARED", "ONE_BEDROOM", "TWO_BEDROOM", "HOSTEL", "ANY"]).optional(),
    minBudget: z.coerce.number().positive().optional(),
    maxBudget: z.coerce.number().positive().optional(),
  }).optional(),
  body: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const accommodationRequestIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
