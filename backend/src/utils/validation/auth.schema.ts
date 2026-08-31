import { z } from "zod";

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerStudentSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: passwordRule,
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    universityId: z.string().min(1),
    phone: z.string().optional(),
    acceptedTerms: z.boolean().refine((value) => value === true, { message: "You must accept the Terms of Service and Privacy Policy." }),
    acceptedTermsVersion: z.string().min(1),
    acceptedTermsAt: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const registerAgentSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: passwordRule,
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().min(1),
    businessName: z.string().optional(),
    acceptedTerms: z.boolean().refine((value) => value === true, { message: "You must accept the Terms of Service and Privacy Policy." }),
    acceptedTermsVersion: z.string().min(1),
    acceptedTermsAt: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
