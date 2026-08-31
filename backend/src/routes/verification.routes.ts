import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { verificationController } from "../controllers";
import { submitVerificationSchema, verificationDecisionSchema } from "../utils/validation/verification.schema";
import { Role } from "@prisma/client";

const router = Router();

router.post("", authenticate, validate(submitVerificationSchema), verificationController.submitVerification);
router.get("/my", authenticate, verificationController.getMyVerification);
router.get("/admin", authenticate, requireRole(Role.ADMIN), verificationController.listVerifications);
router.get("/admin/:id", authenticate, requireRole(Role.ADMIN), verificationController.getVerification);
router.patch("/admin/:id/approve", authenticate, requireRole(Role.ADMIN), validate(verificationDecisionSchema), verificationController.approveVerification);
router.patch("/admin/:id/reject", authenticate, requireRole(Role.ADMIN), validate(verificationDecisionSchema), verificationController.rejectVerification);

export default router;
