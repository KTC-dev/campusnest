import { RoommateProfile } from "@prisma/client";
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

// Weights sum to 100. Budget overlap and gender fit matter most because
// they're usually deal-breakers; lifestyle traits are meaningful but more
// negotiable between actual roommates.
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

// Note: Student has no `gender` field in the Phase 1 schema (the platform
// only models gender as a *preference* on the roommate profile, and as a
// restriction on properties). Until a Student.gender field exists, mutual
// gender preference can't be enforced from real data — both sides'
// preferences are compared to each other's preference as a proxy, which is
// weaker than checking actual gender but keeps the score meaningful rather
// than silently disabling this factor.
function genderScore(a: RoommateProfile, b: RoommateProfile): number {
  const aOk = a.genderPreference === "ANY" || a.genderPreference === b.genderPreference || b.genderPreference === "ANY";
  return aOk ? 1 : 0.3;
}

function sleepScheduleScore(a: RoommateProfile, b: RoommateProfile): number {
  if (a.sleepSchedule === b.sleepSchedule) return 1;
  if (a.sleepSchedule === "FLEXIBLE" || b.sleepSchedule === "FLEXIBLE") return 0.7;
  return 0.2; // early bird vs night owl
}

function cleanlinessScore(a: RoommateProfile, b: RoommateProfile): number {
  const order = ["RELAXED", "MODERATE", "VERY_CLEAN"];
  const distance = Math.abs(order.indexOf(a.cleanliness) - order.indexOf(b.cleanliness));
  return distance === 0 ? 1 : distance === 1 ? 0.6 : 0.2;
}

function smokingScore(a: RoommateProfile, b: RoommateProfile): number {
  return a.isSmoker === b.isSmoker ? 1 : 0.1; // near-dealbreaker, but not absolute
}

function noiseToleranceScore(a: RoommateProfile, b: RoommateProfile): number {
  const order = ["LOW", "MEDIUM", "HIGH"];
  const distance = Math.abs(order.indexOf(a.noiseTolerance) - order.indexOf(b.noiseTolerance));
  return distance === 0 ? 1 : distance === 1 ? 0.6 : 0.3;
}

function compatibilityScore(a: RoommateProfile, b: RoommateProfile): number {
  const raw =
    budgetOverlapScore(a, b) * WEIGHTS.budget +
    genderScore(a, b) * WEIGHTS.gender +
    sleepScheduleScore(a, b) * WEIGHTS.sleepSchedule +
    cleanlinessScore(a, b) * WEIGHTS.cleanliness +
    smokingScore(a, b) * WEIGHTS.smoking +
    noiseToleranceScore(a, b) * WEIGHTS.noiseTolerance;

  return Math.round(raw);
}

class RoommateService {
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

  /** Recommends the best-matching active roommate profiles within the same university, ranked by compatibility score. */
  async findMatches(studentId: string, limit = 20) {
    const me = await prisma.roommateProfile.findUnique({
      where: { studentId },
      include: { student: true },
    });
    if (!me) throw AppError.badRequest("Create your roommate profile first");

    const candidates = await prisma.roommateProfile.findMany({
      where: {
        isActive: true,
        studentId: { not: studentId },
        student: { universityId: me.student.universityId },
      },
      include: {
        student: { select: { firstName: true, lastName: true, faculty: true, level: true, avatarUrl: true } },
      },
    });

    return candidates
      .map((candidate) => ({ profile: candidate, score: compatibilityScore(me, candidate) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export const roommateService = new RoommateService();
