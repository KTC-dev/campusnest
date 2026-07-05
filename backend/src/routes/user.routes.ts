import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { userController } from "../controllers";
import { updateUserSchema } from "../utils/validation/user.schema";

const router = Router();

router.get("/me", authenticate, userController.getMe);
router.patch("", authenticate, validate(updateUserSchema), userController.updateMe);

export default router;
