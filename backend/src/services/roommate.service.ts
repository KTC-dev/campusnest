import { RoommateProfile, MatchRequestStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

interface UpsertRoommateProfileInput {
  budgetMin: number;
  budgetMax: number;
  genderPreference: "MALE" | "FEMALE" | "ANY";
  sleepSchedule: "EARLY_BIRD" | "NIGHT_OWL" | "FLEXIBLE";
  cleanliness: "RELAXED" | "MODERATE" | "VERY_CLEAN";
  isSmoker: boolean;
  noiseTolerance: "LOW" | "MEDIUM" | "HIGH";
  bio?: string;
  isActive: boolean;
}

interface CompatibilityBreakdown {
  budget: { score: number; label: string; matched: boolean };
  gender: { score: number; label: string; matched: boolean };
  sleepSchedule: { score: number; label: string; matched: boolean };
  cleanliness: { score: number; label: string; matched: boolean };
  smoking: { score: number; label: string; matched: boolean };
  noiseTolerance: { score: number; label: string; matched: boolean };
}

interface MatchFilters {
  budgetMin?: number;
  budgetMax?: number;
  genderPreference?: "MALE" | "FEMALE" | "ANY";
  sleepSchedule?: "EARLY_BIRD" | "NIGHT_OWL" | "FLEXIBLE";
  cleanliness?: "RELAXED" | "MODERATE" | "VERY_CLEAN";
  isSmoker?: boolean;
  noiseTolerance?: "LOW" | "MEDIUM" | "HIGH";
  faculty?: string;
  level?: string;
}

const WEIGHTS = {
  budget: 25,
  gender: 20,
  sleepSchedule: 15,
  cleanliness: 15,
  smoking: 15,
  noiseTolerance: 10,
};

function budgetOverlapScore(a: RoommateProfile, b: RoommateProfile): number {
  const aMin = Number(a.budgetMin);
  const aMax = Number(a.budgetMax);
  const bMin = Number(b.budgetMin);
  const bMax = Number(b.budgetMax);

  const overlapStart = Math.max(aMin, bMin);
  const overlapEnd = Math.min(aMax, bMax);
  if (overlapEnd < overlapStart) return 0;

  const overlap = overlapEnd - overlapStart;
  const widestRange = Math.max(aMax - aMin, bMax - bMin, 1);
  return Math.min(1, overlap / widestRange);
}

function genderScore(a: RoommateProfile, b: RoommateProfile, studentAGender?: string, studentBGender?: string): number {
  if (studentAGender && studentBGender) {
    const aPrefOk = a.genderPreference === "ANY" || a.genderPreference === studentBGender;
    const bPrefOk = b.genderPreference === "ANY" || b.genderPreference === studentAGender;
    return aPrefOk && bPrefOk ? 1 : 0;
  }
  const aOk = a.genderPreference === "ANY" || a.genderPreference === b.genderPreference || b.genderPreference === "ANY";
  return aOk ? 1 : 0.3;
}

function sleepScheduleScore(a: RoommateProfile, b: RoommateProfile): number {
  if (a.sleepSchedule === b.sleepSchedule) return 1;
  if (a.sleepSchedule === "FLEXIBLE" || b.sleepSchedule === "FLEXIBLE") return 0.7;
  return 0.2;
}

function cleanlinessScore(a: RoommateProfile, b: RoommateProfile): number {
  const order = ["RELAXED", "MODERATE", "VERY_CLEAN"];
  const distance = Math.abs(order.indexOf(a.cleanliness) - order.indexOf(b.cleanliness));
  return distance === 0 ? 1 : distance === 1 ? 0.6 : 0.2;
}

function smokingScore(a: RoommateProfile, b: RoommateProfile): number {
  return a.isSmoker === b.isSmoker ? 1 : 0.1;
}

function noiseToleranceScore(a: RoommateProfile, b: RoommateProfile): number {
  const order = ["LOW", "MEDIUM", "HIGH"];
  const distance = Math.abs(order.indexOf(a.noiseTolerance) - order.indexOf(b.noiseTolerance));
  return distance === 0 ? 1 : distance === 1 ? 0.6 : 0.3;
}

export function compatibilityScore(a: RoommateProfile, b: RoommateProfile, studentAGender?: string, studentBGender?: string): number {
  const raw =
    budgetOverlapScore(a, b) * WEIGHTS.budget +
    genderScore(a, b, studentAGender, studentBGender) * WEIGHTS.gender +
    sleepScheduleScore(a, b) * WEIGHTS.sleepSchedule +
    cleanlinessScore(a, b) * WEIGHTS.cleanliness +
    smokingScore(a, b) * WEIGHTS.smoking +
    noiseToleranceScore(a, b) * WEIGHTS.noiseTolerance;

  return Math.round(raw);
}

export function compatibilityBreakdown(a: RoommateProfile, b: RoommateProfile, studentAGender?: string, studentBGender?: string): CompatibilityBreakdown {
  const budgetScore = budgetOverlapScore(a, b);
  const genderScoreVal = genderScore(a, b, studentAGender, studentBGender);
  const sleepScore = sleepScheduleScore(a, b);
  const cleanScore = cleanlinessScore(a, b);
  const smokeScore = smokingScore(a, b);
  const noiseScore = noiseToleranceScore(a, b);

  return {
    budget: {
      score: Math.round(budgetScore * WEIGHTS.budget),
      label: `₦${Number(a.budgetMin).toLocaleString()}–${Number(a.budgetMax).toLocaleString()} vs ₦${Number(b.budgetMin).toLocaleString()}–${Number(b.budgetMax).toLocaleString()}`,
      matched: budgetScore > 0,
    },
    gender: {
      score: Math.round(genderScoreVal * WEIGHTS.gender),
      label: `Preference: ${a.genderPreference} / ${b.genderPreference}`,
      matched: genderScoreVal >= 1,
    },
    sleepSchedule: {
      score: Math.round(sleepScore * WEIGHTS.sleepSchedule),
      label: `${a.sleepSchedule.replace(/_/g, " ")} vs ${b.sleepSchedule.replace(/_/g, " ")}`,
      matched: sleepScore >= 1,
    },
    cleanliness: {
      score: Math.round(cleanScore * WEIGHTS.cleanliness),
      label: `${a.cleanliness.replace(/_/g, " ")} vs ${b.cleanliness.replace(/_/g, " ")}`,
      matched: cleanScore >= 1,
    },
    smoking: {
      score: Math.round(smokeScore * WEIGHTS.smoking),
      label: `${a.isSmoker ? "Smoker" : "Non-smoker"} vs ${b.isSmoker ? "Smoker" : "Non-smoker"}`,
      matched: smokeScore >= 1,
    },
    noiseTolerance: {
      score: Math.round(noiseScore * WEIGHTS.noiseTolerance),
      label: `${a.noiseTolerance} vs ${b.noiseTolerance} noise tolerance`,
      matched: noiseScore >= 1,
    },
  };
}

class RoommateService {
  async ensureMatch(studentAId: string, studentBId: string) {
    const [firstStudentId, secondStudentId] = [studentAId, studentBId].sort();
    const existing = await prisma.roommateMatch.findUnique({
      where: { studentAId_studentBId: { studentAId: firstStudentId, studentBId: secondStudentId } },
    });

    if (existing) {
      return existing;
    }

    const [studentA, studentB] = await Promise.all([
      prisma.roommateProfile.findUnique({ where: { studentId: firstStudentId } }),
      prisma.roommateProfile.findUnique({ where: { studentId: secondStudentId } }),
    ]);

    if (!studentA || !studentB) {
      throw AppError.badRequest("Both students need a roommate profile before starting a chat");
    }

    const [studentAData, studentBData] = await Promise.all([
      prisma.student.findUnique({ where: { id: firstStudentId }, select: { gender: true } }),
      prisma.student.findUnique({ where: { id: secondStudentId }, select: { gender: true } }),
    ]);

    const score = compatibilityScore(studentA, studentB, studentAData?.gender ?? undefined, studentBData?.gender ?? undefined);

    return prisma.roommateMatch.create({
      data: {
        studentAId: firstStudentId,
        studentBId: secondStudentId,
        score,
      },
    });
  }

  async upsertProfile(studentId: string, input: UpsertRoommateProfileInput) {
    return prisma.roommateProfile.upsert({
      where: { studentId },
      update: input,
      create: { ...input, studentId },
    });
  }

  async getMyProfile(studentId: string) {
    return prisma.roommateProfile.findUnique({ where: { studentId } });
  }

  async findMatches(studentId: string, filters: MatchFilters = {}, limit = 20) {
    const me = await prisma.roommateProfile.findUnique({
      where: { studentId },
      include: { student: true },
    });
    if (!me) throw AppError.badRequest("Create your roommate profile first");

    const where: any = {
      isActive: true,
      studentId: { not: studentId },
      student: { universityId: me.student.universityId },
    };

    if (filters.budgetMin !== undefined) where.budgetMax = { gte: filters.budgetMin };
    if (filters.budgetMax !== undefined) where.budgetMin = { lte: filters.budgetMax };
    if (filters.genderPreference) where.genderPreference = filters.genderPreference;
    if (filters.sleepSchedule) where.sleepSchedule = filters.sleepSchedule;
    if (filters.cleanliness) where.cleanliness = filters.cleanliness;
    if (filters.isSmoker !== undefined) where.isSmoker = filters.isSmoker;
    if (filters.noiseTolerance) where.noiseTolerance = filters.noiseTolerance;
    if (filters.faculty) where.student.faculty = filters.faculty;
    if (filters.level) where.student.level = filters.level;

    const candidates = await prisma.roommateProfile.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, faculty: true, level: true, avatarUrl: true, gender: true, university: { select: { id: true, name: true } } } },
      },
    });

    const myStudent = await prisma.student.findUnique({ where: { id: studentId }, select: { gender: true } });

    const candidateStudents = await Promise.all(
      candidates.map((c) => prisma.student.findUnique({ where: { id: c.studentId }, select: { gender: true } }))
    );

    return candidates
      .map((candidate, index) => {
        const candidateStudent = candidateStudents[index];
        return {
          profile: candidate,
          score: compatibilityScore(me, candidate, myStudent?.gender ?? undefined, candidateStudent?.gender ?? undefined),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async sendMatchRequest(senderId: string, receiverId: string, message?: string) {
    if (senderId === receiverId) throw AppError.badRequest("You cannot send a match request to yourself");

    const existingRequest = await prisma.roommateMatchRequest.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    });

    if (existingRequest) {
      if (existingRequest.status === MatchRequestStatus.PENDING) {
        throw AppError.badRequest("Match request already sent");
      }
      if (existingRequest.status === MatchRequestStatus.ACCEPTED) {
        throw AppError.badRequest("You are already matched with this student");
      }
    }

    const senderProfile = await prisma.roommateProfile.findUnique({ where: { studentId: senderId } });
    const receiverProfile = await prisma.roommateProfile.findUnique({ where: { studentId: receiverId } });

    if (!senderProfile || !receiverProfile) {
      throw AppError.badRequest("Both students need a roommate profile");
    }

    if (!receiverProfile.isActive) {
      throw AppError.badRequest("This student is not currently looking for roommates");
    }

    const request = await prisma.roommateMatchRequest.create({
      data: {
        senderId,
        receiverId,
        message,
        status: MatchRequestStatus.PENDING,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, university: { select: { id: true, name: true } }, userId: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, university: { select: { id: true, name: true } }, userId: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: request.receiver.userId,
        type: "ROOMMATE_MATCH_REQUEST",
        title: "New roommate match request",
        body: `${request.sender.firstName} ${request.sender.lastName} wants to be your roommate`,
      },
    });

    return request;
  }

  async respondToMatchRequest(requestId: string, userId: string, accept: boolean) {
    const request = await prisma.roommateMatchRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: { select: { id: true, userId: true, firstName: true, lastName: true } },
        receiver: { select: { id: true, userId: true, firstName: true, lastName: true } },
      },
    });

    if (!request) throw AppError.notFound("Match request not found");
    if (request.receiverId !== userId) throw AppError.forbidden("Not authorized to respond to this request");
    if (request.status !== MatchRequestStatus.PENDING) throw AppError.badRequest("Request has already been responded to");

    const newStatus = accept ? MatchRequestStatus.ACCEPTED : MatchRequestStatus.DECLINED;

    await prisma.$transaction(async (tx) => {
      await tx.roommateMatchRequest.update({
        where: { id: requestId },
        data: { status: newStatus },
      });

      if (accept) {
        const [firstId, secondId] = [request.senderId, request.receiverId].sort();
        await tx.roommateMatch.upsert({
          where: { studentAId_studentBId: { studentAId: firstId, studentBId: secondId } },
          update: {},
          create: {
            studentAId: firstId,
            studentBId: secondId,
            score: 0,
          },
        });
      }
    });

    await prisma.notification.create({
      data: {
        userId: request.sender.userId,
        type: accept ? "ROOMMATE_MATCH_ACCEPTED" : "ROOMMATE_MATCH_DECLINED",
        title: accept ? "Match request accepted" : "Match request declined",
        body: `${request.receiver.firstName} ${request.receiver.lastName} ${accept ? "accepted" : "declined"} your roommate match request`,
      },
    });

    return { success: true, status: newStatus };
  }

  async getSentMatchRequests(studentId: string) {
    return prisma.roommateMatchRequest.findMany({
      where: { senderId: studentId },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            faculty: true,
            level: true,
            avatarUrl: true,
            gender: true,
            university: { select: { id: true, name: true } },
            roommateProfile: { select: { budgetMin: true, budgetMax: true, genderPreference: true, sleepSchedule: true, cleanliness: true, isSmoker: true, noiseTolerance: true, bio: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getReceivedMatchRequests(studentId: string) {
    return prisma.roommateMatchRequest.findMany({
      where: { receiverId: studentId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            faculty: true,
            level: true,
            avatarUrl: true,
            gender: true,
            university: { select: { id: true, name: true } },
            roommateProfile: { select: { budgetMin: true, budgetMax: true, genderPreference: true, sleepSchedule: true, cleanliness: true, isSmoker: true, noiseTolerance: true, bio: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSavedMatches(studentId: string) {
    return prisma.roommateMatchFavourite.findMany({
      where: { studentId },
      include: {
        target: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            faculty: true,
            level: true,
            avatarUrl: true,
            gender: true,
            university: { select: { id: true, name: true } },
            roommateProfile: { select: { budgetMin: true, budgetMax: true, genderPreference: true, sleepSchedule: true, cleanliness: true, isSmoker: true, noiseTolerance: true, bio: true } },
          },
        },
      },
    });
  }

  async saveMatch(studentId: string, targetStudentId: string) {
    if (studentId === targetStudentId) throw AppError.badRequest("You cannot save yourself as a match");
    return prisma.roommateMatchFavourite.create({
      data: { studentId, targetId: targetStudentId },
    });
  }

  async unsaveMatch(studentId: string, targetStudentId: string) {
    return prisma.roommateMatchFavourite.delete({
      where: { studentId_targetId: { studentId, targetId: targetStudentId } },
    });
  }
}

export const roommateService = new RoommateService();