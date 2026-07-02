import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1),
    moveInDate: z.coerce.date(),
    message: z.string().max(500).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const respondToBookingSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});
