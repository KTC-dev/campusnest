import { Router } from "express";
import { Role } from "@prisma/client";
import * as adminController from "../controllers/admin.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { paginationSchema, setUserActiveSchema } from "../utils/validation/admin.schema";

const router = Router();

// Every route in this file requires a valid ADMIN session.
router.use(authenticate, requireRole(Role.ADMIN));

router.get("/stats", adminController.getStats);
router.get("/analytics", adminController.getAnalytics);

router.get("/students", validate(paginationSchema), adminController.listStudents);
router.get("/landlords", validate(paginationSchema), adminController.listLandlords);
router.get("/bookings", validate(paginationSchema), adminController.listBookings);
router.get("/properties/pending", adminController.listPendingProperties);

router.patch("/users/:userId/active", validate(setUserActiveSchema), adminController.setUserActive);
router.delete("/properties/:id", adminController.removeFraudulentListing);

export default router;
