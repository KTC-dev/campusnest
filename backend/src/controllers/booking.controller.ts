import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { bookingService } from "../services/booking.service";
import { AppError } from "../utils/AppError";
import { prisma } from "../config/prisma";

async function requireLandlordId(userId: string) {
  const landlord = await prisma.landlord.findUnique({ where: { userId } });
  if (!landlord) throw AppError.forbidden("Landlord profile not found");
  return landlord.id;
}

async function requireStudentId(userId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw AppError.forbidden("Student profile not found");
  return student.id;
}

export const createBooking = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const { propertyId, moveInDate, message } = req.body;
  const booking = await bookingService.create(studentId, propertyId, moveInDate, message);
  res.status(201).json({ success: true, data: booking });
});

export const respondToBooking = catchAsync(async (req: Request, res: Response) => {
  const landlordId = await requireLandlordId(req.user!.id);
  const booking = await bookingService.respond(landlordId, req.params.id, req.body.status);
  res.status(200).json({ success: true, data: booking });
});

export const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const booking = await bookingService.cancel(studentId, req.params.id);
  res.status(200).json({ success: true, data: booking });
});

export const listMyBookings = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const bookings = await bookingService.listForStudent(studentId);
  res.status(200).json({ success: true, data: bookings });
});

export const listPropertyBookingsForLandlord = catchAsync(async (req: Request, res: Response) => {
  const landlordId = await requireLandlordId(req.user!.id);
  const bookings = await bookingService.listForLandlord(landlordId);
  res.status(200).json({ success: true, data: bookings });
});
