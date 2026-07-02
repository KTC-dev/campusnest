import { Router } from "express";
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import propertyRoutes from "./property.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/properties", propertyRoutes);
// Phase 3 will add: /bookings, /roommates, /notifications, /messages

export default router;
