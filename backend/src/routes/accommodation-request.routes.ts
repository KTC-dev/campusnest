import { Router } from "express";
import * as accommodationRequestController from "../controllers/accommodation-request.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import {
  createAccommodationRequestSchema,
  updateAccommodationRequestSchema,
  accommodationRequestIdSchema,
} from "../utils/validation/accommodation-request.schema";

const router = Router();

router.use(authenticate);

router.post("/", validate(createAccommodationRequestSchema), accommodationRequestController.createAccommodationRequest);

router.get("/mine", accommodationRequestController.listMyRequests);

router.get("/open", requireRole("AGENT", "ADMIN"), accommodationRequestController.listOpenRequests);

router.get("/:id", validate(accommodationRequestIdSchema), accommodationRequestController.getAccommodationRequest);

router.patch("/:id", validate(updateAccommodationRequestSchema), accommodationRequestController.updateAccommodationRequest);

router.delete("/:id", validate(accommodationRequestIdSchema), accommodationRequestController.deleteAccommodationRequest);

export default router;

