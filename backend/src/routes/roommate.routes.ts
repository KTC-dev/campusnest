import { Router } from "express";
import { Role } from "@prisma/client";
import * as roommateController from "../controllers/roommate.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { upsertRoommateProfileSchema } from "../utils/validation/roommate.schema";

const router = Router();

router.use(authenticate, requireRole(Role.STUDENT));

router.get("/profile", roommateController.getMyRoommateProfile);
router.put("/profile", validate(upsertRoommateProfileSchema), roommateController.upsertMyRoommateProfile);
router.get("/matches", roommateController.getRoommateMatches);

export default router;
