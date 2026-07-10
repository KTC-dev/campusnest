import { Router } from "express";
import { Role } from "@prisma/client";
import * as roommateController from "../controllers/roommate.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { upsertRoommateProfileSchema, sendMatchRequestSchema, respondMatchRequestSchema, idParamSchema } from "../utils/validation/roommate.schema";

const router = Router();

router.use(authenticate, requireRole(Role.STUDENT));

router.get("/profile", roommateController.getMyRoommateProfile);
router.put("/profile", validate(upsertRoommateProfileSchema), roommateController.upsertMyRoommateProfile);
router.get("/profile/:id", validate(idParamSchema), roommateController.getProfileById);
router.get("/matches", roommateController.getRoommateMatches);
router.post("/match-requests", validate(sendMatchRequestSchema), roommateController.sendMatchRequest);
router.patch("/match-requests/:requestId", validate(respondMatchRequestSchema), roommateController.respondToMatchRequest);
router.get("/match-requests/sent", roommateController.getSentMatchRequests);
router.get("/match-requests/received", roommateController.getReceivedMatchRequests);
router.get("/saved", roommateController.getSavedMatches);

export default router;
