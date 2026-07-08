import { z } from "zod";

export const createConversationSchema = z.object({
    body: z.object({
        propertyId: z.string().min(1).optional(),
        roommateStudentId: z.string().min(1).optional(),
        initialMessage: z.string().trim().max(1000).optional(),
    }).refine((value) => Boolean(value.propertyId) !== Boolean(value.roommateStudentId), {
        message: "Provide either a propertyId or a roommateStudentId",
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

export const sendMessageSchema = z.object({
    body: z.object({
        content: z.string().trim().max(4000).optional(),
        messageType: z.enum(["TEXT", "IMAGE", "SYSTEM"]).optional(),
        attachments: z.array(z.object({
            url: z.string().url(),
            publicId: z.string().optional(),
            fileName: z.string().optional(),
            mimeType: z.string().optional(),
            fileSize: z.number().int().positive().optional(),
            type: z.enum(["IMAGE", "PDF"]).default("IMAGE"),
        })).max(5).optional(),
    }).refine((value) => Boolean(value.content?.trim()) || Boolean(value.attachments?.length), {
        message: "Message content or attachments are required",
    }),
    query: z.object({}).optional(),
    params: z.object({ id: z.string().min(1) }),
});

export const uploadMessageSchema = z.object({
    body: z.object({
        file: z.string().min(1),
        fileName: z.string().min(1).optional(),
        mimeType: z.string().min(1),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

export const idParamSchema = z.object({
    params: z.object({ id: z.string().min(1) }),
    query: z.object({}).optional(),
    body: z.object({}).optional(),
});
