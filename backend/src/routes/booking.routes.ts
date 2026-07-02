import { Router } from "express";
import { Role } from "@prisma/client";
import * as bookingController from "../controllers/booking.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { createBookingSchema, respondToBookingSchema } from "../utils/validation/booking.schema";

const router = Router();

router.use(authenticate);

router.post("/", requireRole(Role.STUDENT), validate(createBookingSchema), bookingController.createBooking);
router.get("/mine", requireRole(Role.STUDENT), bookingController.listMyBookings);
router.patch("/:id/cancel", requireRole(Role.STUDENT), bookingController.cancelBooking);

router.get("/landlord", requireRole(Role.LANDLORD), bookingController.listPropertyBookingsForLandlord);
router.patch(
  "/:id/respond",
  requireRole(Role.LANDLORD),
  validate(respondToBookingSchema),
  bookingController.respondToBooking
);

export default router;
