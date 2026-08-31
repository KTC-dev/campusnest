import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        user: { findUnique: vi.fn(), update: vi.fn() },
        student: { update: vi.fn() },
        agent: { update: vi.fn() },
        admin: { update: vi.fn() },
    },
}));

vi.mock("../../config/prisma", () => ({ prisma: mockPrisma }));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("userService.getProfile", () => {
    it("returns the authenticated user's profile with their role-specific details", async () => {
        const { userService } = await import("../user.service");

        mockPrisma.user.findUnique.mockResolvedValue({
            id: "user-1",
            email: "student@example.com",
            role: "STUDENT",
            isVerified: true,
            isActive: true,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            student: { id: "s1", firstName: "Ada", lastName: "Lovelace", phone: null, universityId: "u1", faculty: "CS", level: "300", avatarUrl: null },
        });

        const profile = await userService.getProfile("user-1");

        expect(profile).toMatchObject({
            id: "user-1",
            email: "student@example.com",
            role: "STUDENT",
            student: { firstName: "Ada", faculty: "CS" },
        });
    });
});

describe("userService.updateProfile", () => {
    it("updates a student's profile details", async () => {
        const { userService } = await import("../user.service");

        mockPrisma.user.findUnique.mockResolvedValue({
            id: "user-1",
            email: "student@example.com",
            role: "STUDENT",
            isVerified: true,
            isActive: true,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            student: { id: "s1", firstName: "Ada", lastName: "Lovelace", phone: null, universityId: "u1", faculty: "CS", level: "300", avatarUrl: null },
        });
        mockPrisma.student.update.mockResolvedValue({
            id: "s1",
            firstName: "Ada",
            lastName: "Lovelace",
            phone: null,
            universityId: "u1",
            faculty: "Engineering",
            level: "400",
            avatarUrl: null,
        });

        const profile = await userService.updateProfile("user-1", { faculty: "Engineering", level: "400" });

        expect(mockPrisma.student.update).toHaveBeenCalledWith({
            where: { userId: "user-1" },
            data: { faculty: "Engineering", level: "400" },
        });
        expect(profile).toMatchObject({ id: "user-1" });
    });
});
