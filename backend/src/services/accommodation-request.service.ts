import { Prisma, RoomTypePreference, RequestStatus, Gender } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { notificationService } from "./notification.service";

interface CreateAccommodationRequestInput {
  studentId: string;
  universityId: string;
  preferredLocation: string;
  budgetMin?: number | string;
  budgetMax?: number | string;
  roomType: string;
  genderPreference?: string;
  moveInDate?: string;
  numberOfOccupants?: number;
  roommateRequired?: boolean;
  preferences?: string;
  additionalNotes?: string;
}

interface UpdateAccommodationRequestInput extends Partial<CreateAccommodationRequestInput> {
  status?: string;
}

class AccommodationRequestService {
  async create(input: CreateAccommodationRequestInput) {
    const university = await prisma.university.findUnique({ where: { id: input.universityId } });
    if (!university) throw AppError.badRequest("University not found");

    const student = await prisma.student.findUnique({ where: { userId: input.studentId } });
    if (!student) throw AppError.forbidden("Student profile not found");

    const request = await prisma.accommodationRequest.create({
      data: {
        studentId: student.id,
        universityId: input.universityId,
        preferredLocation: input.preferredLocation,
        budgetMin: input.budgetMin ? new Prisma.Decimal(input.budgetMin) : undefined,
        budgetMax: input.budgetMax ? new Prisma.Decimal(input.budgetMax) : undefined,
        roomType: input.roomType as RoomTypePreference,
        genderPreference: (input.genderPreference as Gender) ?? "ANY",
        moveInDate: input.moveInDate ? new Date(input.moveInDate) : undefined,
        numberOfOccupants: input.numberOfOccupants ?? 1,
        roommateRequired: input.roommateRequired ?? false,
        preferences: input.preferences,
        additionalNotes: input.additionalNotes,
        status: "OPEN",
      },
      include: {
        university: { select: { id: true, name: true, city: true } },
        student: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
    });

    await notificationService.notify({
      userId: input.studentId,
      type: "REQUEST_CREATED",
      title: "Accommodation request submitted",
      body: `Your request for ${input.preferredLocation} has been posted.`,
      actionUrl: `/accommodation-requests`,
    });

    return request;
  }

  async listForStudent(userId: string, page: number, pageSize: number) {
    const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
    const studentId = student?.id ?? userId;

    const [requests, total] = await Promise.all([
      prisma.accommodationRequest.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          university: { select: { id: true, name: true, city: true } },
        },
      }),
      prisma.accommodationRequest.count({ where: { studentId } }),
    ]);

    return { requests, total, page, pageSize };
  }

  async listOpenForAgents(filters: {
    universityId?: string;
    roomType?: string;
    minBudget?: number;
    maxBudget?: number;
    status?: string;
    page: number;
    pageSize: number;
  }) {
    const where: Prisma.AccommodationRequestWhereInput = {
      status: filters.status as RequestStatus ?? "OPEN",
      ...(filters.universityId && { universityId: filters.universityId }),
      ...(filters.roomType && { roomType: filters.roomType as RoomTypePreference }),
      ...(filters.minBudget && { budgetMax: { gte: new Prisma.Decimal(filters.minBudget) } }),
      ...(filters.maxBudget && { budgetMin: { lte: new Prisma.Decimal(filters.maxBudget) } }),
    };

    const [requests, total] = await Promise.all([
      prisma.accommodationRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
        include: {
          university: { select: { id: true, name: true, city: true } },
          student: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.accommodationRequest.count({ where }),
    ]);

    return { requests, total, page: filters.page, pageSize: filters.pageSize };
  }

  async getById(id: string, requesterId: string, requesterRole: string) {
    const request = await prisma.accommodationRequest.findUnique({
      where: { id },
      include: {
        university: { select: { id: true, name: true, city: true } },
        student: { select: { id: true, firstName: true, lastName: true, phone: true, userId: true, user: { select: { email: true } } } },
      },
    });

    if (!request) throw AppError.notFound("Accommodation request not found");

    const isOwner = request.studentId === requesterId || request.student?.userId === requesterId;
    const isAdmin = requesterRole === "ADMIN";
    if (!isOwner && !isAdmin) throw AppError.forbidden("You do not have access to this request");

    return request;
  }

  async update(id: string, requesterId: string, requesterRole: string, input: UpdateAccommodationRequestInput) {
    const request = await prisma.accommodationRequest.findUnique({ where: { id } });
    if (!request) throw AppError.notFound("Accommodation request not found");

    const student = await prisma.student.findUnique({ where: { userId: requesterId }, select: { id: true } });
    const isOwner = request.studentId === (student?.id ?? requesterId);
    const isAdmin = requesterRole === "ADMIN";
    if (!isOwner && !isAdmin) throw AppError.forbidden("You cannot modify this request");

    const data: Prisma.AccommodationRequestUpdateInput = {};

    if (input.preferredLocation !== undefined) data.preferredLocation = input.preferredLocation;
    if (input.roomType !== undefined) data.roomType = input.roomType as RoomTypePreference;
    if (input.genderPreference !== undefined) data.genderPreference = input.genderPreference as Gender;
    if (input.moveInDate !== undefined) data.moveInDate = input.moveInDate ? new Date(input.moveInDate) : undefined;
    if (input.numberOfOccupants !== undefined) data.numberOfOccupants = input.numberOfOccupants;
    if (input.roommateRequired !== undefined) data.roommateRequired = input.roommateRequired;
    if (input.preferences !== undefined) data.preferences = input.preferences;
    if (input.additionalNotes !== undefined) data.additionalNotes = input.additionalNotes;
    if (input.status !== undefined) {
      data.status = input.status as RequestStatus;
      if (input.status === "IN_PROGRESS" || input.status === "CLOSED") {
        data.respondedAt = new Date();
      }
    }
    if (input.budgetMin !== undefined) data.budgetMin = input.budgetMin ? new Prisma.Decimal(input.budgetMin) : undefined;
    if (input.budgetMax !== undefined) data.budgetMax = input.budgetMax ? new Prisma.Decimal(input.budgetMax) : undefined;

    const updated = await prisma.accommodationRequest.update({
      where: { id },
      data,
      include: {
        university: { select: { id: true, name: true, city: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (input.status && input.status !== request.status) {
      const statusTitle = input.status === "IN_PROGRESS" ? "Request in progress" : "Request closed";
      const statusBody = input.status === "IN_PROGRESS"
        ? "An agent is working on your accommodation request."
        : "Your accommodation request has been closed.";

      await notificationService.notify({
        userId: request.studentId,
        type: "REQUEST_RESPONSE",
        title: statusTitle,
        body: statusBody,
        actionUrl: `/accommodation-requests`,
      });
    }

    return updated;
  }

  async delete(id: string, requesterId: string, requesterRole: string) {
    const request = await prisma.accommodationRequest.findUnique({ where: { id } });
    if (!request) throw AppError.notFound("Accommodation request not found");

    const student = await prisma.student.findUnique({ where: { userId: requesterId }, select: { id: true } });
    const isOwner = request.studentId === (student?.id ?? requesterId);
    const isAdmin = requesterRole === "ADMIN";
    if (!isOwner && !isAdmin) throw AppError.forbidden("You cannot delete this request");

    await prisma.accommodationRequest.delete({ where: { id } });
    return { success: true };
  }
}

export const accommodationRequestService = new AccommodationRequestService();
