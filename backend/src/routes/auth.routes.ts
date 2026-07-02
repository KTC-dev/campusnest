import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { loginRateLimit } from "../middleware/rateLimiters";
import {
  registerStudentSchema,
  registerLandlordSchema,
  loginSchema,
  refreshSchema,
} from "../utils/validation/auth.schema";

const router = Router();

router.post("/register/student", validate(registerStudentSchema), authController.registerStudent);
router.post("/register/landlord", validate(registerLandlordSchema), authController.registerLandlord);
router.post("/login", loginRateLimit, validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", validate(refreshSchema), authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
