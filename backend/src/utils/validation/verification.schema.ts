import { z } from "zod";

export const submitVerificationSchema = z.object({
    body: z.object({
        idDocument: z.string().min(1),
        selfie: z.string().optional(),
        proofOfOwnership: z.string().optional(),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

export const verificationDecisionSchema = z.object({
    body: z.object({
        adminNotes: z.string().optional(),
    }),
    query: z.object({}).optional(),
    params: z.object({ id: z.string().min(1) }),
});
