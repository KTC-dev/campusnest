import { BookingStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { notificationService } from "./notification.service";

class BookingService {
  async create(studentId: string, propertyId: string, moveInDate: Date, message?: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { agent: true },
    });
    if (!property || property.status !== "APPROVED") throw AppError.notFound("Listing not available");
    if (!property.isAvailable) throw AppError.badRequest("This property is no longer available");

    const existing = await prisma.booking.findFirst({
      where: { studentId, propertyId, status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] } },
    });
    if (existing) throw AppError.conflict("You already have an active booking request for this property");

    const booking = await prisma.booking.create({
      data: { studentId, propertyId, moveInDate, message },
      include: { property: { select: { title: true } } },
    });

    await notificationService.notify({
      userId: property.agent.userId,
      type: "BOOKING_UPDATE",
      title: "New booking request",
      body: `A student requested to book "${booking.property.title}".`,
    });

    return booking;
  }

  /** Agent approves or rejects — approving auto-marks the property unavailable and rejects any other pending requests for it. */
  async respond(agentId: string, bookingId: string, status: "APPROVED" | "REJECTED") {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true, student: { include: { user: true } } },
    });
    if (!booking) throw AppError.notFound("Booking request not found");
    if (booking.property.agentId !== agentId) throw AppError.forbidden("You do not own this listing");
    if (booking.status !== BookingStatus.PENDING) throw AppError.badRequest("This request has already been resolved");

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.booking.update({ where: { id: bookingId }, data: { status } });

      if (status === "APPROVED") {
        await tx.property.update({ where: { id: booking.propertyId }, data: { isAvailable: false } });
        await tx.booking.updateMany({
          where: { propertyId: booking.propertyId, status: BookingStatus.PENDING, id: { not: bookingId } },
          data: { status: BookingStatus.REJECTED },
        });
      }

      return result;
    });

    await notificationService.notify({
      userId: booking.student.user.id,
      type: "BOOKING_UPDATE",
      title: status === "APPROVED" ? "Booking approved 🎉" : "Booking request declined",
      body:
        status === "APPROVED"
          ? `Your booking for "${booking.property.title}" was approved.`
          : `Your booking request for "${booking.property.title}" was declined.`,
    });

    return updated;
  }

  async cancel(studentId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.studentId !== studentId) throw AppError.notFound("Booking request not found");
    if (booking.status !== BookingStatus.PENDING) throw AppError.badRequest("Only pending requests can be cancelled");

    return prisma.booking.update({ where: { id: bookingId }, data: { status: BookingStatus.CANCELLED } });
  }

  async listForStudent(studentId: string) {
    return prisma.booking.findMany({
      where: { studentId },
      include: { property: { include: { images: { where: { isPrimary: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async listForAgent(agentId: string) {
    return prisma.booking.findMany({
      where: { property: { agentId } },
      include: {
        property: { select: { title: true } },
        student: { select: { firstName: true, lastName: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const bookingService = new BookingService();

