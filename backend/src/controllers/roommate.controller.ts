import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { roommateService } from "../services/roommate.service";
import { AppError } from "../utils/AppError";
import { prisma } from "../config/prisma";

async function requireStudentId(userId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw AppError.forbidden("Student profile not found");
  return student.id;
}

export const upsertMyRoommateProfile = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const profile = await roommateService.upsertProfile(studentId, req.body);
  res.status(200).json({ success: true, data: profile });
});

export const getMyRoommateProfile = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const profile = await roommateService.getMyProfile(studentId);
  res.status(200).json({ success: true, data: profile });
});

export const getRoommateMatches = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const filters = {
    budgetMin: req.query.budgetMin ? Number(req.query.budgetMin) : undefined,
    budgetMax: req.query.budgetMax ? Number(req.query.budgetMax) : undefined,
    genderPreference: req.query.genderPreference as "MALE" | "FEMALE" | "ANY" | undefined,
    sleepSchedule: req.query.sleepSchedule as "EARLY_BIRD" | "NIGHT_OWL" | "FLEXIBLE" | undefined,
    cleanliness: req.query.cleanliness as "RELAXED" | "MODERATE" | "VERY_CLEAN" | undefined,
    isSmoker: req.query.isSmoker !== undefined ? req.query.isSmoker === "true" : undefined,
    noiseTolerance: req.query.noiseTolerance as "LOW" | "MEDIUM" | "HIGH" | undefined,
    faculty: req.query.faculty as string | undefined,
    level: req.query.level as string | undefined,
  };
  const matches = await roommateService.findMatches(studentId, filters);
  res.status(200).json({ success: true, data: matches });
});

export const sendMatchRequest = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const { receiverId, message } = req.body;
  const request = await roommateService.sendMatchRequest(studentId, receiverId, message);
  res.status(201).json({ success: true, data: request });
});

export const respondToMatchRequest = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const { requestId } = req.params;
  const { accept } = req.body;
  const result = await roommateService.respondToMatchRequest(requestId, studentId, accept);
  res.status(200).json({ success: true, data: result });
});

export const getSentMatchRequests = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const requests = await roommateService.getSentMatchRequests(studentId);
  res.status(200).json({ success: true, data: requests });
});

export const getReceivedMatchRequests = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const requests = await roommateService.getReceivedMatchRequests(studentId);
  res.status(200).json({ success: true, data: requests });
});

export const getProfileById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, role: true, isVerified: true } },
      university: { select: { id: true, name: true } },
      roommateProfile: true,
    },
  });
  if (!student) throw AppError.notFound("Student not found");
  res.status(200).json({ success: true, data: { student, roommateProfile: student.roommateProfile } });
});

export const getSavedMatches = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const saved = await roommateService.getSavedMatches(studentId);
  res.status(200).json({ success: true, data: saved });
});
