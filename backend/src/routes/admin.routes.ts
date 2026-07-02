import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../config/prisma";

const router = Router();

// Every route below requires a valid access token AND the ADMIN role.
// Phase 4 will flesh this out into a full dashboard controller/service;
// this stub exists now to prove the role-guard pattern end-to-end.
router.get(
  "/stats",
  authenticate,
  requireRole(Role.ADMIN),
  catchAsync(async (_req, res) => {
    const [totalStudents, totalLandlords, totalProperties, pendingApprovals, totalBookings] = await Promise.all([
      prisma.student.count(),
      prisma.landlord.count(),
      prisma.property.count(),
      prisma.property.count({ where: { status: "PENDING" } }),
      prisma.booking.count(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers: totalStudents + totalLandlords,
        totalStudents,
        totalLandlords,
        totalProperties,
        pendingApprovals,
        totalBookings,
        revenue: 0, // placeholder until payments are integrated
      },
    });
  })
);

export default router;
