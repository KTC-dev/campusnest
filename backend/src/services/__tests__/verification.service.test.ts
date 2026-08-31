import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockUploadService } = vi.hoisted(() => ({
    mockPrisma: {
        agentVerification: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        agent: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
    mockUploadService: {
        uploadImage: vi.fn(),
    },
}));

vi.mock("../../config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../upload.service", () => ({ uploadService: mockUploadService }));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("verificationService.submitVerification", () => {
    it("uploads documents and creates an agent verification request", async () => {
        const { verificationService } = await import("../verification.service");

        mockUploadService.uploadImage
            .mockResolvedValueOnce({ url: "https://img.test/id.jpg", publicId: "id-1" })
            .mockResolvedValueOnce({ url: "https://img.test/selfie.jpg", publicId: "selfie-1" })
            .mockResolvedValueOnce({ url: "https://img.test/ownership.jpg", publicId: "ownership-1" });

        mockPrisma.user.findUnique.mockResolvedValue({ id: "agent-1", role: "AGENT" });
        mockPrisma.agent.findUnique.mockResolvedValue({ id: "agent-profile-1" });
        mockPrisma.agentVerification.create.mockResolvedValue({ id: "v-1" });

        const result = await verificationService.submitVerification("agent-1", {
            idDocument: "data:image/png;base64,id",
            selfie: "data:image/png;base64,selfie",
            proofOfOwnership: "data:image/png;base64,proof",
        });

        expect(mockUploadService.uploadImage).toHaveBeenCalledTimes(3);
        expect(mockPrisma.agentVerification.create).toHaveBeenCalled();
        expect(result).toEqual({ id: "v-1" });
    });
});

describe("verificationService.approveVerification", () => {
    it("marks a verification as approved and updates the agent verification flag", async () => {
        const { verificationService } = await import("../verification.service");

        mockPrisma.agentVerification.findUnique.mockResolvedValue({ id: "v-1", userId: "user-1" });
        mockPrisma.agentVerification.update.mockResolvedValue({ id: "v-1", status: "VERIFIED" });
        mockPrisma.agent.findUnique.mockResolvedValue({ id: "agent-1", userId: "user-1" });
        mockPrisma.agent.update.mockResolvedValue({ id: "agent-1", isVerified: true });
        mockPrisma.user.update.mockResolvedValue({ id: "user-1", isVerified: true });

        await verificationService.approveVerification("v-1");

        expect(mockPrisma.agentVerification.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "v-1" },
                data: expect.objectContaining({ status: "VERIFIED" }),
            })
        );
        expect(mockPrisma.agent.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: "user-1" },
                data: { isVerified: true },
            })
        );
    });
});
