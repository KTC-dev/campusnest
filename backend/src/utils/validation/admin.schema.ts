import { z } from "zod";

export const paginationSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(20),
  }),
  params: z.object({}).optional(),
});

export const setUserActiveSchema = z.object({
  body: z.object({ isActive: z.boolean() }),
  query: z.object({}).optional(),
  params: z.object({ userId: z.string().min(1) }),
});
