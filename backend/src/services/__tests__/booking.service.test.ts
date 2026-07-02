import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma and the notification service before importing bookingService,
// so the service under test never touches a real database.
const mockPrisma = {
  property: { findUnique: vi.fn(), update: vi.fn() },
  booking: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  $transaction: vi.fn(),
};

vi.mock("../../config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../notification.service", () => ({ notificationService: { notify: vi.fn() } }));

const { bookingService } = await import("../booking.service");
const { notificationService } = await import("../notification.service");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("bookingService.create", () => {
  it("rejects a booking on a property that isn't approved and available", async () => {
    mockPrisma.property.findUnique.mockResolvedValue({ status: "PENDING", isAvailable: true, landlord: { userId: "l1" } });

    await expect(bookingService.create("s1", "prop1", new Date())).rejects.toThrow("Listing not available");
  });

  it("rejects a booking on an unavailable property", async () => {
    mockPrisma.property.findUnique.mockResolvedValue({ status: "APPROVED", isAvailable: false, landlord: { userId: "l1" } });

    await expect(bookingService.create("s1", "prop1", new Date())).rejects.toThrow("no longer available");
  });

  it("rejects a duplicate active request from the same student", async () => {
    mockPrisma.property.findUnique.mockResolvedValue({ status: "APPROVED", isAvailable: true, landlord: { userId: "l1" } });
    mockPrisma.booking.findFirst.mockResolvedValue({ id: "existing" });

    await expect(bookingService.create("s1", "prop1", new Date())).rejects.toThrow("already have an active booking");
  });

  it("creates a booking and notifies the landlord", async () => {
    mockPrisma.property.findUnique.mockResolvedValue({ status: "APPROVED", isAvailable: true, landlord: { userId: "landlord-user-1" } });
    mockPrisma.booking.findFirst.mockResolvedValue(null);
    mockPrisma.booking.create.mockResolvedValue({ id: "b1", property: { title: "Cozy self-contain" } });

    const result = await bookingService.create("s1", "prop1", new Date());

    expect(result.id).toBe("b1");
    expect(notificationService.notify).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "landlord-user-1", type: "BOOKING_UPDATE" })
    );
  });
});

describe("bookingService.respond", () => {
  const baseBooking = {
    id: "b1",
    propertyId: "prop1",
    status: "PENDING",
    property: { landlordId: "landlord1", title: "Cozy self-contain" },
    student: { user: { id: "student-user-1" } },
  };

  it("rejects responding to a booking the landlord doesn't own", async () => {
    mockPrisma.booking.findUnique.mockResolvedValue(baseBooking);
    await expect(bookingService.respond("someone-else", "b1", "APPROVED")).rejects.toThrow("do not own");
  });

  it("rejects responding to an already-resolved booking", async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: "APPROVED" });
    await expect(bookingService.respond("landlord1", "b1", "APPROVED")).rejects.toThrow("already been resolved");
  });

  it("on approval, marks the property unavailable and auto-rejects other pending requests in one transaction", async () => {
    mockPrisma.booking.findUnique.mockResolvedValue(baseBooking);
    mockPrisma.$transaction.mockImplementation(async (fn: any) =>
      fn({
        booking: { update: vi.fn().mockResolvedValue({ id: "b1", status: "APPROVED" }), updateMany: mockPrisma.booking.updateMany },
        property: { update: mockPrisma.property.update },
      })
    );

    const result = await bookingService.respond("landlord1", "b1", "APPROVED");

    expect(result.status).toBe("APPROVED");
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(notificationService.notify).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "student-user-1", title: expect.stringContaining("approved") })
    );
  });
});
