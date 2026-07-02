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
  const matches = await roommateService.findMatches(studentId);
  res.status(200).json({ success: true, data: matches });
});
