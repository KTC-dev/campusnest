import { describe, it, expect } from "vitest";
import { compatibilityScore } from "../roommate.service";
import type { RoommateProfile } from "@prisma/client";

// Minimal fixture builder — only the fields compatibilityScore reads.
function profile(overrides: Partial<RoommateProfile> = {}): RoommateProfile {
  return {
    id: "p1",
    studentId: "s1",
    budgetMin: 100000 as any,
    budgetMax: 200000 as any,
    genderPreference: "ANY",
    sleepSchedule: "FLEXIBLE",
    cleanliness: "MODERATE",
    isSmoker: false,
    noiseTolerance: "MEDIUM",
    bio: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as RoommateProfile;
}

describe("compatibilityScore", () => {
  it("scores an identical profile at or near 100", () => {
    const a = profile();
    const b = profile({ id: "p2", studentId: "s2" });
    expect(compatibilityScore(a, b)).toBeGreaterThanOrEqual(95);
  });

  it("returns a lower score for non-overlapping budgets", () => {
    const a = profile({ budgetMin: 50000 as any, budgetMax: 100000 as any });
    const b = profile({ id: "p2", studentId: "s2", budgetMin: 500000 as any, budgetMax: 600000 as any });
    const overlapping = compatibilityScore(a, profile({ id: "p3", studentId: "s3" }));
    const nonOverlapping = compatibilityScore(a, b);
    expect(nonOverlapping).toBeLessThan(overlapping);
  });

  it("penalizes mismatched sleep schedules more than matching flexible ones", () => {
    const earlyBird = profile({ sleepSchedule: "EARLY_BIRD" });
    const nightOwl = profile({ id: "p2", studentId: "s2", sleepSchedule: "NIGHT_OWL" });
    const flexible = profile({ id: "p3", studentId: "s3", sleepSchedule: "FLEXIBLE" });

    const clashing = compatibilityScore(earlyBird, nightOwl);
    const withFlexible = compatibilityScore(earlyBird, flexible);
    expect(clashing).toBeLessThan(withFlexible);
  });

  it("scores mismatched smoking preference lower than matching", () => {
    const nonSmoker = profile({ isSmoker: false });
    const smoker = profile({ id: "p2", studentId: "s2", isSmoker: true });
    const anotherNonSmoker = profile({ id: "p3", studentId: "s3", isSmoker: false });

    expect(compatibilityScore(nonSmoker, smoker)).toBeLessThan(compatibilityScore(nonSmoker, anotherNonSmoker));
  });

  it("always returns a score between 0 and 100", () => {
    const a = profile({ isSmoker: true, sleepSchedule: "EARLY_BIRD", cleanliness: "VERY_CLEAN", noiseTolerance: "LOW" });
    const b = profile({
      id: "p2",
      studentId: "s2",
      isSmoker: false,
      sleepSchedule: "NIGHT_OWL",
      cleanliness: "RELAXED",
      noiseTolerance: "HIGH",
      budgetMin: 900000 as any,
      budgetMax: 950000 as any,
    });
    const score = compatibilityScore(a, b);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
