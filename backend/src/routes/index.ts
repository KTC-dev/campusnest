import { Router } from "express";
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
// Phase 2 will add: /properties, /favourites
// Phase 3 will add: /bookings, /roommates, /notifications, /messages

export default router;
