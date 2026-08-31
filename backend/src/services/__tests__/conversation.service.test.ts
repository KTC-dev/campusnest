import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockUploadService, mockNotificationService } = vi.hoisted(() => ({
    mockPrisma: {
        conversation: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
        message: { create: vi.fn(), updateMany: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
        messageAttachment: { create: vi.fn() },
        property: { findUnique: vi.fn() },
        student: { findUnique: vi.fn() },
        agent: { findUnique: vi.fn() },
        user: { findUnique: vi.fn() },
        notification: { create: vi.fn() },
    },
    mockUploadService: { uploadImage: vi.fn() },
    mockNotificationService: { notify: vi.fn() },
}));

vi.mock("../../config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../upload.service", () => ({ uploadService: mockUploadService }));
vi.mock("../notification.service", () => ({ notificationService: mockNotificationService }));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("conversationService.createConversation", () => {
    it("creates a conversation for a student on a property and seeds the initial property message", async () => {
        const { conversationService } = await import("../conversation.service");

        mockPrisma.user.findUnique.mockResolvedValue({ id: "student-1", role: "STUDENT" });
        mockPrisma.property.findUnique.mockResolvedValue({
            id: "property-1",
            title: "Luxury Self-Contain",
            location: "Federal University Otuoke",
            price: "350000",
            agentId: "agent-1",
            agent: { userId: "agent-user-1" },
        });
        mockPrisma.student.findUnique.mockResolvedValue({ id: "student-profile-1", userId: "student-1" });
        mockPrisma.agent.findUnique.mockResolvedValue({ id: "agent-profile-1", userId: "agent-user-1" });
        mockPrisma.conversation.create.mockResolvedValue({ id: "conversation-1" });
        mockPrisma.message.create.mockResolvedValue({ id: "message-1" });

        const conversation = await conversationService.createConversation("student-1", { propertyId: "property-1", initialMessage: "Hi, I am interested in this property." });

        expect(mockPrisma.conversation.create).toHaveBeenCalled();
        expect(mockPrisma.message.create).toHaveBeenCalled();
        expect(conversation).toEqual({ id: "conversation-1" });
    });
});

describe("conversationService.archiveConversation", () => {
    it("marks a conversation as archived for the participant", async () => {
        const { conversationService } = await import("../conversation.service");

        mockPrisma.conversation.findUnique.mockResolvedValue({
            id: "conversation-1",
            student: { userId: "student-1" },
            agent: { userId: "agent-1" },
        });
        mockPrisma.conversation.update.mockResolvedValue({ id: "conversation-1", isArchived: true });

        await conversationService.archiveConversation("student-1", "conversation-1");

        expect(mockPrisma.conversation.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: "conversation-1" },
            data: expect.objectContaining({ isArchived: true }),
        }));
    });
});

