import { z } from "zod";

export const upsertRoommateProfileSchema = z.object({
  body: z
    .object({
      budgetMin: z.coerce.number().nonnegative(),
      budgetMax: z.coerce.number().positive(),
      genderPreference: z.enum(["MALE", "FEMALE", "ANY"]).default("ANY"),
      sleepSchedule: z.enum(["EARLY_BIRD", "NIGHT_OWL", "FLEXIBLE"]),
      cleanliness: z.enum(["RELAXED", "MODERATE", "VERY_CLEAN"]),
      isSmoker: z.coerce.boolean().default(false),
      noiseTolerance: z.enum(["LOW", "MEDIUM", "HIGH"]),
      bio: z.string().max(500).optional(),
      isActive: z.coerce.boolean().default(true),
    })
    .refine((v) => v.budgetMax >= v.budgetMin, {
      message: "budgetMax must be greater than or equal to budgetMin",
      path: ["budgetMax"],
    }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const sendMatchRequestSchema = z.object({
  body: z.object({
    receiverId: z.string().cuid(),
    message: z.string().max(500).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const respondMatchRequestSchema = z.object({
  body: z.object({
    accept: z.boolean(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    requestId: z.string().cuid(),
  }),
});

export const idParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().cuid(),
  }),
});
