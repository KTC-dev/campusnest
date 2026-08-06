import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import * as sessionController from "../controllers/session.controller";

const router = Router();

router.get("/", authenticate, sessionController.listSessions);
router.delete("/:id", authenticate, sessionController.revokeSession);
router.post("/revoke-others", authenticate, sessionController.revokeAllOtherSessions);

export default router;
