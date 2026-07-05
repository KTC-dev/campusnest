import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockUploadService } = vi.hoisted(() => ({
    mockPrisma: {
        landlordVerification: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        landlord: {
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
    it("uploads documents and creates a landlord verification request", async () => {
        const { verificationService } = await import("../verification.service");

        mockUploadService.uploadImage
            .mockResolvedValueOnce({ url: "https://img.test/id.jpg", publicId: "id-1" })
            .mockResolvedValueOnce({ url: "https://img.test/selfie.jpg", publicId: "selfie-1" })
            .mockResolvedValueOnce({ url: "https://img.test/ownership.jpg", publicId: "ownership-1" });

        mockPrisma.user.findUnique.mockResolvedValue({ id: "landlord-1", role: "LANDLORD" });
        mockPrisma.landlord.findUnique.mockResolvedValue({ id: "landlord-profile-1" });
        mockPrisma.landlordVerification.create.mockResolvedValue({ id: "v-1" });

        const result = await verificationService.submitVerification("landlord-1", {
            idDocument: "data:image/png;base64,id",
            selfie: "data:image/png;base64,selfie",
            proofOfOwnership: "data:image/png;base64,proof",
        });

        expect(mockUploadService.uploadImage).toHaveBeenCalledTimes(3);
        expect(mockPrisma.landlordVerification.create).toHaveBeenCalled();
        expect(result).toEqual({ id: "v-1" });
    });
});

describe("verificationService.approveVerification", () => {
    it("marks a verification as approved and updates the landlord verification flag", async () => {
        const { verificationService } = await import("../verification.service");

        mockPrisma.landlordVerification.findUnique.mockResolvedValue({ id: "v-1", userId: "user-1" });
        mockPrisma.landlordVerification.update.mockResolvedValue({ id: "v-1", status: "VERIFIED" });
        mockPrisma.landlord.findUnique.mockResolvedValue({ id: "landlord-1", userId: "user-1" });
        mockPrisma.landlord.update.mockResolvedValue({ id: "landlord-1", isVerified: true });
        mockPrisma.user.update.mockResolvedValue({ id: "user-1", isVerified: true });

        await verificationService.approveVerification("v-1");

        expect(mockPrisma.landlordVerification.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "v-1" },
                data: expect.objectContaining({ status: "VERIFIED" }),
            })
        );
        expect(mockPrisma.landlord.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: "user-1" },
                data: { isVerified: true },
            })
        );
    });
});
