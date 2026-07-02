import { Router } from "express";
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import propertyRoutes from "./property.routes";
import bookingRoutes from "./booking.routes";
import roommateRoutes from "./roommate.routes";
import notificationRoutes from "./notification.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/properties", propertyRoutes);
router.use("/bookings", bookingRoutes);
router.use("/roommates", roommateRoutes);
router.use("/notifications", notificationRoutes);
// Phase 3 also adds a Message model (schema.prisma) — a full chat UI is out
// of scope for the MVP; /messages endpoints can be added the same way as
// /bookings once a chat UI is prioritized.

export default router;
