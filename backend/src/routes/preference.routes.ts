import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import * as preferenceController from "../controllers/preference.controller";

const router = Router();

router.get("/notifications", authenticate, preferenceController.getNotifications);
router.patch("/notifications", authenticate, preferenceController.updateNotifications);

export default router;
