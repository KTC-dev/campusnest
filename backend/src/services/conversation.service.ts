import { MessageType, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { uploadService } from "./upload.service";
import { notificationService } from "./notification.service";

interface CreateConversationInput {
    propertyId: string;
    initialMessage: string;
}

interface SendMessageInput {
    content?: string;
    messageType?: MessageType;
    image?: string;
}

class ConversationService {
    async createConversation(userId: string, input: CreateConversationInput) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
        if (!user) throw AppError.notFound("User not found");
        if (user.role !== Role.STUDENT) throw AppError.forbidden("Only students can start conversations");

        const property = await prisma.property.findUnique({
            where: { id: input.propertyId },
            include: {
                landlord: { select: { id: true, userId: true } },
                images: { take: 1, select: { url: true } },
            },
        });
        if (!property) throw AppError.notFound("Property not found");

        const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
        if (!student) throw AppError.notFound("Student profile not found");

        const landlord = await prisma.landlord.findUnique({ where: { id: property.landlordId }, select: { id: true, userId: true } });
        if (!landlord) throw AppError.notFound("Landlord profile not found");

        const existingConversation = await prisma.conversation.findFirst({
            where: { propertyId: input.propertyId, studentId: student.id, landlordId: landlord.id },
        });

        if (existingConversation) {
            return existingConversation;
        }

        const conversation = await prisma.conversation.create({
            data: {
                propertyId: input.propertyId,
                studentId: student.id,
                landlordId: landlord.id,
            },
        });

        const initialContent = this.buildInitialMessage(property);

        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: userId,
                content: `${initialContent}\n\n${input.initialMessage || "Hi, I am interested in this property. Is it still available?"}`,
                messageType: "TEXT",
                isRead: true,
            },
        });

        await prisma.messageAttachment.create({
            data: {
                messageId: message.id,
                url: property.images?.[0]?.url ?? "",
                type: "IMAGE",
            },
        });

        await notificationService.notify({
            userId: landlord.userId,
            type: "MESSAGE",
            title: "New property inquiry",
            body: `New message for ${property.title}`,
        });

        return conversation;
    }

    async listConversations(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
        if (!user) throw AppError.notFound("User not found");

        const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
        const landlord = await prisma.landlord.findUnique({ where: { userId }, select: { id: true } });

        const where = user.role === Role.STUDENT
            ? { studentId: student?.id }
            : user.role === Role.LANDLORD
                ? { landlordId: landlord?.id }
                : {};

        return prisma.conversation.findMany({
            where,
            include: {
                property: { select: { id: true, title: true, location: true, price: true, images: { where: { isPrimary: true }, select: { url: true } } } },
                student: { select: { id: true, userId: true, user: { select: { id: true, email: true } }, firstName: true, lastName: true } },
                landlord: { select: { id: true, userId: true, user: { select: { id: true, email: true } }, firstName: true, lastName: true, businessName: true, isVerified: true } },
                messages: { orderBy: { createdAt: "desc" }, take: 1 },
            },
            orderBy: { updatedAt: "desc" },
        });
    }

    async getConversation(userId: string, conversationId: string) {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                property: { select: { id: true, title: true, location: true, price: true, images: { where: { isPrimary: true }, select: { url: true } } } },
                student: { select: { id: true, userId: true, user: { select: { id: true, email: true } }, firstName: true, lastName: true } },
                landlord: { select: { id: true, userId: true, user: { select: { id: true, email: true } }, firstName: true, lastName: true, businessName: true, isVerified: true } },
                messages: {
                    orderBy: { createdAt: "asc" },
                    include: { attachments: true, sender: { select: { id: true, email: true, role: true } } },
                },
            },
        });

        if (!conversation) throw AppError.notFound("Conversation not found");

        const participantIds = [conversation.student.userId, conversation.landlord.userId];
        if (!participantIds.includes(userId)) throw AppError.forbidden("You are not a participant in this conversation");

        return conversation;
    }

    async sendMessage(userId: string, conversationId: string, input: SendMessageInput) {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { student: { select: { id: true, userId: true } }, landlord: { select: { id: true, userId: true } } },
        });
        if (!conversation) throw AppError.notFound("Conversation not found");

        const participantIds = [conversation.student.userId, conversation.landlord.userId];
        if (!participantIds.includes(userId)) throw AppError.forbidden("You are not a participant in this conversation");

        let attachmentUrl: string | undefined;
        if (input.image) {
            const uploaded = await uploadService.uploadImage(input.image, "campusnest/chat");
            attachmentUrl = uploaded.url;
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: userId,
                content: input.content ?? "",
                messageType: input.messageType ?? "TEXT",
                isRead: false,
            },
        });

        if (attachmentUrl) {
            await prisma.messageAttachment.create({ data: { messageId: message.id, url: attachmentUrl, type: "IMAGE" } });
        }

        const recipientId = conversation.student.userId === userId ? conversation.landlord.userId : conversation.student.userId;
        await notificationService.notify({
            userId: recipientId,
            type: "MESSAGE",
            title: "New message",
            body: input.content?.trim() ? input.content.trim() : "You received a new message",
        });

        return message;
    }

    async markMessageAsRead(userId: string, messageId: string) {
        const message = await prisma.message.findUnique({ where: { id: messageId }, include: { conversation: true } });
        if (!message) throw AppError.notFound("Message not found");

        const conversation = await prisma.conversation.findUnique({ where: { id: message.conversationId }, include: { student: { select: { userId: true } }, landlord: { select: { userId: true } } } });
        if (!conversation) throw AppError.notFound("Conversation not found");

        if (![conversation.student.userId, conversation.landlord.userId].includes(userId)) {
            throw AppError.forbidden("You are not a participant in this conversation");
        }

        return prisma.message.update({ where: { id: messageId }, data: { isRead: true } });
    }

    async archiveConversation(userId: string, conversationId: string) {
        const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { student: { select: { userId: true } }, landlord: { select: { userId: true } } } });
        if (!conversation) throw AppError.notFound("Conversation not found");

        if (![conversation.student.userId, conversation.landlord.userId].includes(userId)) {
            throw AppError.forbidden("You are not a participant in this conversation");
        }

        return prisma.conversation.update({ where: { id: conversationId }, data: { isArchived: true, updatedAt: new Date() } });
    }

    private buildInitialMessage(property: { title: string; location: string; price: string | number | { toString(): string } }) {
        return [
            property.title,
            property.location,
            `Rent: ₦${Number(property.price).toLocaleString()}/year`,
            "",
            "Student:",
        ].join("\n");
    }
}

export const conversationService = new ConversationService();
