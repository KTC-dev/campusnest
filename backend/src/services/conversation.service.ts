import { AttachmentType, ConversationType, MessageType, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { uploadService } from "./upload.service";
import { notificationService } from "./notification.service";
import { roommateService } from "./roommate.service";

interface CreateConversationInput {
    propertyId?: string;
    roommateStudentId?: string;
    initialMessage?: string;
}

interface MessageAttachmentInput {
    url: string;
    publicId?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    type?: AttachmentType;
}

interface SendMessageInput {
    content?: string;
    messageType?: MessageType;
    attachments?: MessageAttachmentInput[];
}

interface UploadMessageInput {
    file: string;
    fileName?: string;
    mimeType: string;
}

interface MessagePageInput {
    cursor?: string;
    limit?: number;
}

const conversationParticipantInclude = {
    select: { id: true, userId: true, user: { select: { id: true, email: true, role: true, isVerified: true } } },
};

const propertyConversationInclude = {
    property: {
        select: {
            id: true,
            title: true,
            location: true,
            price: true,
            university: { select: { id: true, name: true } },
            images: { orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }], select: { id: true, url: true, isPrimary: true } },
            agent: { select: { firstName: true, lastName: true, businessName: true, isVerified: true, phone: true } },
        },
    },
};

const roommateConversationInclude = {
    roommateMatch: {
        include: {
            studentA: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    university: { select: { id: true, name: true } },
                    avatarUrl: true,
                    user: { select: { id: true, email: true, role: true, isVerified: true } },
                    roommateProfile: {
                        select: {
                            budgetMin: true,
                            budgetMax: true,
                            genderPreference: true,
                            sleepSchedule: true,
                            cleanliness: true,
                            isSmoker: true,
                            noiseTolerance: true,
                            bio: true,
                        },
                    },
                },
            },
            studentB: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    university: { select: { id: true, name: true } },
                    avatarUrl: true,
                    user: { select: { id: true, email: true, role: true, isVerified: true } },
                    roommateProfile: {
                        select: {
                            budgetMin: true,
                            budgetMax: true,
                            genderPreference: true,
                            sleepSchedule: true,
                            cleanliness: true,
                            isSmoker: true,
                            noiseTolerance: true,
                            bio: true,
                        },
                    },
                },
            },
            conversation: { select: { id: true } },
        },
    },
};

const messageInclude = {
    attachments: true,
    sender: { select: { id: true, email: true, role: true, isVerified: true } },
};

class ConversationService {
    private async getUserContext(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, email: true, isVerified: true },
        });

        if (!user) throw AppError.notFound("User not found");

        const student = user.role === Role.STUDENT
            ? await prisma.student.findUnique({
                where: { userId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    university: { select: { id: true, name: true } },
                },
            })
            : null;

        const agent = user.role === Role.AGENT
            ? await prisma.agent.findUnique({
                where: { userId },
                select: { id: true, firstName: true, lastName: true, businessName: true, avatarUrl: true, isVerified: true },
            })
            : null;

        return { user, student, agent };
    }

    private async assertParticipant(conversationId: string, userId: string) {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                primaryStudent: { select: { userId: true } },
                secondaryStudent: { select: { userId: true } },
                agent: { select: { userId: true } },
            },
        });

        if (!conversation) throw AppError.notFound("Conversation not found");

        const participantIds = [conversation.primaryStudent?.userId, conversation.secondaryStudent?.userId, conversation.agent?.userId].filter(Boolean);
        if (!participantIds.includes(userId)) {
            throw AppError.forbidden("You are not a participant in this conversation");
        }

        return conversation;
    }

    private getConversationContext(conversation: {
        type: ConversationType;
        property: unknown;
        roommateMatch: unknown;
        primaryStudent: unknown;
        secondaryStudent: unknown;
        agent: unknown;
    }) {
        if (conversation.type === ConversationType.ROOMMATE_CHAT) {
            return { type: conversation.type, roommateMatch: conversation.roommateMatch };
        }

        return { type: conversation.type, property: conversation.property, agent: conversation.agent };
    }

    private async getUnreadCount(conversationId: string, userId: string) {
        return prisma.message.count({
            where: {
                conversationId,
                senderId: { not: userId },
                readAt: null,
                deletedAt: null,
            },
        });
    }

    private buildPropertyIntro(property: { title: string; location: string; price: string | number | { toString(): string }; university?: { name: string } | null }) {
        return [
            property.title,
            property.location,
            property.university?.name ? `University: ${property.university.name}` : undefined,
            `Rent: ₦${Number(property.price).toLocaleString()}/year`,
        ].filter(Boolean).join("\n");
    }

    private async createMessageRecord(args: {
        conversationId: string;
        senderId: string;
        content?: string;
        messageType?: MessageType;
        attachments?: MessageAttachmentInput[];
        readBySender?: boolean;
    }) {
        const message = await prisma.message.create({
            data: {
                conversationId: args.conversationId,
                senderId: args.senderId,
                content: args.content?.trim() ?? "",
                messageType: args.messageType ?? (args.attachments?.some((attachment) => attachment.type === AttachmentType.PDF) ? MessageType.TEXT : MessageType.TEXT),
                isRead: Boolean(args.readBySender),
                readAt: args.readBySender ? new Date() : null,
                deliveredAt: new Date(),
                attachments: args.attachments?.length
                    ? {
                        create: args.attachments.map((attachment) => ({
                            url: attachment.url,
                            publicId: attachment.publicId,
                            fileName: attachment.fileName,
                            mimeType: attachment.mimeType,
                            fileSize: attachment.fileSize,
                            type: attachment.type ?? AttachmentType.IMAGE,
                        })),
                    }
                    : undefined,
            },
            include: messageInclude,
        });

        await prisma.conversation.update({
            where: { id: args.conversationId },
            data: {
                lastMessageId: message.id,
                lastMessageContent: message.content || (message.attachments.length ? "Attachment" : ""),
                lastMessageType: message.messageType,
                lastMessageAt: message.createdAt,
                lastMessageSenderId: args.senderId,
                updatedAt: new Date(),
            },
        });

        return message;
    }

    async createConversation(userId: string, input: CreateConversationInput) {
        const { user, student } = await this.getUserContext(userId);
        if (user.role !== Role.STUDENT || !student) {
            throw AppError.forbidden("Only students can start conversations");
        }

        const hasProperty = Boolean(input.propertyId);
        const hasRoommate = Boolean(input.roommateStudentId);
        if (hasProperty === hasRoommate) {
            throw AppError.badRequest("Provide either a propertyId or a roommateStudentId");
        }

        if (input.propertyId) {
            const property = await prisma.property.findUnique({
                where: { id: input.propertyId },
                include: {
                    agent: { select: { id: true, userId: true } },
                    images: { orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }], take: 1, select: { id: true, url: true, publicId: true } },
                    university: { select: { name: true } },
                },
            });
            if (!property) throw AppError.notFound("Property not found");

            const existingConversation = await prisma.conversation.findFirst({
                where: {
                    type: ConversationType.PROPERTY_CHAT,
                    propertyId: input.propertyId,
                    primaryStudentId: student.id,
                    agentId: property.agentId,
                },
                include: {
                    ...propertyConversationInclude,
                    primaryStudent: conversationParticipantInclude,
                    agent: conversationParticipantInclude,
                    messages: { take: 1, orderBy: { createdAt: "desc" }, include: messageInclude },
                },
            });

            if (existingConversation) {
                return existingConversation;
            }

            const conversation = await prisma.conversation.create({
                data: {
                    type: ConversationType.PROPERTY_CHAT,
                    propertyId: property.id,
                    primaryStudentId: student.id,
                    agentId: property.agentId,
                    lastMessageContent: null,
                    lastMessageType: null,
                    lastMessageAt: null,
                },
            });

            const intro = this.buildPropertyIntro(property);
            await this.createMessageRecord({
                conversationId: conversation.id,
                senderId: userId,
                content: `${intro}\n\n${input.initialMessage?.trim() || "Hi, I am interested in this property. Is it still available?"}`,
                messageType: MessageType.TEXT,
                readBySender: true,
                attachments: property.images[0]?.url && property.images[0].publicId
                    ? [{ url: property.images[0].url, publicId: property.images[0].publicId, type: AttachmentType.IMAGE }]
                    : undefined,
            });

            await notificationService.notify({
                userId: property.agent.userId,
                type: "MESSAGE",
                title: "New property inquiry",
                body: `New message for ${property.title}`,
            });

            return this.getConversation(userId, conversation.id);
        }

        const otherStudent = await prisma.student.findUnique({
            where: { id: input.roommateStudentId! },
            include: {
                user: { select: { id: true, role: true, email: true, isVerified: true } },
                university: { select: { id: true, name: true } },
                roommateProfile: true,
            },
        });

        if (!otherStudent) throw AppError.notFound("Roommate profile not found");
        if (otherStudent.id === student.id) throw AppError.badRequest("You cannot start a roommate chat with yourself");

        const match = await roommateService.ensureMatch(student.id, otherStudent.id);

        const existingConversation = await prisma.conversation.findUnique({
            where: { roommateMatchId: match.id },
            include: {
                ...roommateConversationInclude,
                primaryStudent: conversationParticipantInclude,
                secondaryStudent: conversationParticipantInclude,
                messages: { take: 1, orderBy: { createdAt: "desc" }, include: messageInclude },
            },
        });

        if (existingConversation) {
            return existingConversation;
        }

        const conversation = await prisma.conversation.create({
            data: {
                type: ConversationType.ROOMMATE_CHAT,
                roommateMatchId: match.id,
                primaryStudentId: student.id,
                secondaryStudentId: otherStudent.id,
            },
        });

        await notificationService.notify({
            userId: otherStudent.userId,
            type: "ROOMMATE_MATCH",
            title: "New roommate chat",
            body: `${student.firstName} ${student.lastName} started a roommate conversation with you.`,
        });

        if (input.initialMessage?.trim()) {
            await this.createMessageRecord({
                conversationId: conversation.id,
                senderId: userId,
                content: input.initialMessage.trim(),
                messageType: MessageType.TEXT,
                readBySender: true,
            });
        }

        return this.getConversation(userId, conversation.id);
    }

    async listConversations(userId: string) {
        const { user, student, agent } = await this.getUserContext(userId);

        const where = user.role === Role.STUDENT
            ? {
                OR: [
                    { type: ConversationType.PROPERTY_CHAT, primaryStudentId: student?.id ?? undefined },
                    { type: ConversationType.ROOMMATE_CHAT, OR: [{ primaryStudentId: student?.id ?? undefined }, { secondaryStudentId: student?.id ?? undefined }] },
                ],
            }
            : user.role === Role.AGENT
                ? { type: ConversationType.PROPERTY_CHAT, agentId: agent?.id ?? undefined }
                : {};

        const conversations = await prisma.conversation.findMany({
            where,
            include: {
                ...propertyConversationInclude,
                ...roommateConversationInclude,
                primaryStudent: conversationParticipantInclude,
                secondaryStudent: conversationParticipantInclude,
                agent: conversationParticipantInclude,
                messages: { take: 1, orderBy: { createdAt: "desc" }, include: messageInclude },
            },
            orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        });

        const withUnread = await Promise.all(conversations.map(async (conversation) => ({
            ...conversation,
            unreadCount: user.role === Role.ADMIN ? 0 : await this.getUnreadCount(conversation.id, userId),
        })));

        return withUnread;
    }

    async getConversation(userId: string, conversationId: string) {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                ...propertyConversationInclude,
                ...roommateConversationInclude,
                primaryStudent: {
                    select: {
                        id: true,
                        userId: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        university: { select: { id: true, name: true } },
                        user: { select: { id: true, email: true, role: true, isVerified: true } },
                        roommateProfile: {
                            select: {
                                budgetMin: true,
                                budgetMax: true,
                                genderPreference: true,
                                sleepSchedule: true,
                                cleanliness: true,
                                isSmoker: true,
                                noiseTolerance: true,
                                bio: true,
                            },
                        },
                    },
                },
                secondaryStudent: {
                    select: {
                        id: true,
                        userId: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        university: { select: { id: true, name: true } },
                        user: { select: { id: true, email: true, role: true, isVerified: true } },
                        roommateProfile: {
                            select: {
                                budgetMin: true,
                                budgetMax: true,
                                genderPreference: true,
                                sleepSchedule: true,
                                cleanliness: true,
                                isSmoker: true,
                                noiseTolerance: true,
                                bio: true,
                            },
                        },
                    },
                },
                agent: { select: { id: true, userId: true, firstName: true, lastName: true, businessName: true, avatarUrl: true, isVerified: true, user: { select: { id: true, email: true, role: true, isVerified: true } } } },
                messages: { take: 1, orderBy: { createdAt: "desc" }, include: messageInclude },
            },
        });

        if (!conversation) throw AppError.notFound("Conversation not found");

        const participantIds = [conversation.primaryStudent?.userId, conversation.secondaryStudent?.userId, conversation.agent?.userId].filter(Boolean);
        if (!participantIds.includes(userId)) {
            throw AppError.forbidden("You are not a participant in this conversation");
        }

        const unreadCount = await this.getUnreadCount(conversation.id, userId);
        return { ...conversation, unreadCount, context: this.getConversationContext(conversation) };
    }

    async listMessages(userId: string, conversationId: string, input: MessagePageInput = {}) {
        await this.assertParticipant(conversationId, userId);

        const limit = Math.min(Math.max(input.limit ?? 30, 1), 50);
        const messages = await prisma.message.findMany({
            where: { conversationId, deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: limit + 1,
            ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
            include: messageInclude,
        });

        const hasMore = messages.length > limit;
        const sliced = hasMore ? messages.slice(0, limit) : messages;
        const items = sliced.reverse();

        return {
            items,
            hasMore,
            nextCursor: hasMore ? sliced[sliced.length - 1]?.id ?? null : null,
        };
    }

    async sendMessage(userId: string, conversationId: string, input: SendMessageInput) {
        const conversation = await this.assertParticipant(conversationId, userId);

        const attachments = input.attachments?.filter(Boolean) ?? [];
        const content = input.content?.trim() ?? "";
        const messageType = input.messageType ?? (attachments.some((attachment) => attachment.type === AttachmentType.PDF) ? MessageType.TEXT : MessageType.TEXT);

        const message = await this.createMessageRecord({
            conversationId,
            senderId: userId,
            content,
            messageType,
            attachments,
        });

        const recipientUserIds = [conversation.primaryStudent?.userId, conversation.secondaryStudent?.userId, conversation.agent?.userId].filter(Boolean).filter((participantId) => participantId !== userId) as string[];

        await Promise.all(recipientUserIds.map((recipientId) => notificationService.notify({
            userId: recipientId,
            type: "MESSAGE",
            title: conversation.type === ConversationType.ROOMMATE_CHAT ? "New roommate message" : "New property message",
            body: content || (attachments.length ? "You received an attachment" : "You received a new message"),
        })));

        return message;
    }

    async uploadMessageFile(userId: string, input: UploadMessageInput) {
        await this.getUserContext(userId);

        const resourceType = input.mimeType.startsWith("image/") ? "image" : "raw";
        const uploaded = await uploadService.uploadFile(input.file, "edurus/messages", resourceType);

        return {
            url: uploaded.url,
            publicId: uploaded.publicId,
            fileName: input.fileName ?? uploaded.fileName ?? undefined,
            mimeType: input.mimeType,
            fileSize: uploaded.bytes,
            type: input.mimeType.startsWith("image/") ? AttachmentType.IMAGE : AttachmentType.PDF,
        };
    }

    async markMessageAsRead(userId: string, messageId: string) {
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            include: {
                conversation: {
                    include: {
                        primaryStudent: { select: { userId: true } },
                        secondaryStudent: { select: { userId: true } },
                        agent: { select: { userId: true } },
                    },
                },
            },
        });

        if (!message) throw AppError.notFound("Message not found");

        const participantIds = [message.conversation.primaryStudent?.userId, message.conversation.secondaryStudent?.userId, message.conversation.agent?.userId].filter(Boolean);
        if (!participantIds.includes(userId)) {
            throw AppError.forbidden("You are not a participant in this conversation");
        }

        const updated = await prisma.message.update({
            where: { id: messageId },
            data: { isRead: true, readAt: new Date() },
        });

        if (message.senderId !== userId) {
            await notificationService.notify({
                userId: message.senderId,
                type: "MESSAGE",
                title: "Message read",
                body: "Your message was read.",
            });
        }

        return updated;
    }

    async archiveConversation(userId: string, conversationId: string) {
        await this.assertParticipant(conversationId, userId);

        return prisma.conversation.update({
            where: { id: conversationId },
            data: { isArchived: true, updatedAt: new Date() },
        });
    }
}

export const conversationService = new ConversationService();

