import { z } from "zod";

export const createConversationSchema = z.object({
    body: z.object({
        propertyId: z.string().min(1),
        initialMessage: z.string().trim().max(1000).optional(),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

export const sendMessageSchema = z.object({
    body: z.object({
        content: z.string().trim().max(4000).optional(),
        messageType: z.enum(["TEXT", "IMAGE", "SYSTEM"]).optional(),
        image: z.string().optional(),
    }).refine((value) => value.content || value.image, {
        message: "Message content or image is required",
    }),
    query: z.object({}).optional(),
    params: z.object({ id: z.string().min(1) }),
});

export const idParamSchema = z.object({
    params: z.object({ id: z.string().min(1) }),
    query: z.object({}).optional(),
    body: z.object({}).optional(),
});
