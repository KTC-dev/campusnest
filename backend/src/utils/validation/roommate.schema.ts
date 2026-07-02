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
