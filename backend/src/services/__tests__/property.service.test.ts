import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        property: { findUnique: vi.fn(), update: vi.fn() },
    },
}));
vi.mock("../../config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../upload.service", () => ({ uploadService: { uploadImage: vi.fn(), deleteImage: vi.fn() } }));
vi.mock("../notification.service", () => ({ notificationService: { notify: vi.fn() } }));

beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
});

describe("propertyService.update", () => {
    it("does not forward amenityIds as a Prisma property field", async () => {
        const { propertyService } = await import("../property.service");

        mockPrisma.property.findUnique.mockResolvedValue({ id: "prop1", landlordId: "landlord1" });
        mockPrisma.property.update.mockResolvedValue({
            id: "prop1",
            title: "Updated title",
            description: "Updated description",
            price: 100,
            location: "Campus",
            distanceFromCampusKm: 2,
            bedrooms: 1,
            bathrooms: 1,
            roomType: "SELF_CONTAIN",
            genderRestriction: "ANY",
            status: "PENDING",
            rejectionReason: null,
            images: [],
            amenities: [],
            landlord: {},
        });

        await propertyService.update("prop1", "landlord1", {
            title: "Updated title",
            amenityIds: ["amenity-1"],
        });

        expect(mockPrisma.property.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "prop1" },
                data: expect.objectContaining({
                    title: "Updated title",
                    status: "PENDING",
                    rejectionReason: null,
                }),
            })
        );

        const updateData = mockPrisma.property.update.mock.calls[0][0].data;
        expect(updateData).not.toHaveProperty("amenityIds");
    });
});
