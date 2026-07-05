import { z } from "zod";

export const updateUserSchema = z.object({
    body: z.object({
        firstName: z.string().min(2).max(80).optional(),
        lastName: z.string().min(2).max(80).optional(),
        phone: z.string().max(20).nullable().optional(),
        faculty: z.string().max(120).nullable().optional(),
        level: z.string().max(40).nullable().optional(),
        avatarUrl: z.string().url().nullable().optional(),
        businessName: z.string().max(120).nullable().optional(),
        universityId: z.string().min(1).optional(),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
