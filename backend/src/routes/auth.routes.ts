import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { loginRateLimit } from "../middleware/rateLimiters";
import {
  registerStudentSchema,
  registerAgentSchema,
  loginSchema,
  refreshSchema,
} from "../utils/validation/auth.schema";

const router = Router();

router.post("/register/student", validate(registerStudentSchema), authController.registerStudent);
router.post("/register/agent", validate(registerAgentSchema), authController.registerAgent);
router.post("/login", loginRateLimit, validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", validate(refreshSchema), authController.logout);
router.post("/accept-terms", authenticate, authController.acceptTerms);
router.get("/me", authenticate, authController.me);

export default router;
