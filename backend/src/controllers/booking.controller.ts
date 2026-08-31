import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { bookingService } from "../services/booking.service";
import { AppError } from "../utils/AppError";
import { prisma } from "../config/prisma";

async function requireAgentId(userId: string) {
  const agent = await prisma.agent.findUnique({ where: { userId } });
  if (!agent) throw AppError.forbidden("Agent profile not found");
  return agent.id;
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
  const agentId = await requireAgentId(req.user!.id);
  const booking = await bookingService.respond(agentId, req.params.id, req.body.status);
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

export const listPropertyBookingsForAgent = catchAsync(async (req: Request, res: Response) => {
  const agentId = await requireAgentId(req.user!.id);
  const bookings = await bookingService.listForAgent(agentId);
  res.status(200).json({ success: true, data: bookings });
});


