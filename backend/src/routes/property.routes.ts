import { Router } from "express";
import { Role } from "@prisma/client";
import * as propertyController from "../controllers/property.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { createPropertyRateLimit } from "../middleware/rateLimiters";
import {
  createPropertySchema,
  updatePropertySchema,
  listPropertiesSchema,
  moderatePropertySchema,
} from "../utils/validation/property.schema";

const router = Router();

// --- Public ---------------------------------------------------------------
router.get("/", validate(listPropertiesSchema), propertyController.listProperties);
router.get("/amenities", propertyController.listAmenities);

// --- Student ---------------------------------------------------------------
router.get("/favourites", authenticate, requireRole(Role.STUDENT), propertyController.listFavourites);
router.post("/:id/favourite", authenticate, requireRole(Role.STUDENT), propertyController.toggleFavourite);

// --- Landlord ---------------------------------------------------------------
router.get("/mine", authenticate, requireRole(Role.LANDLORD), propertyController.listMyProperties);
router.post("/", authenticate, requireRole(Role.LANDLORD), createPropertyRateLimit, validate(createPropertySchema), propertyController.createProperty);
router.patch("/:id", authenticate, requireRole(Role.LANDLORD), validate(updatePropertySchema), propertyController.updateProperty);
router.delete("/:id", authenticate, requireRole(Role.LANDLORD), propertyController.deleteProperty);

// --- Admin ---------------------------------------------------------------
router.get("/pending/all", authenticate, requireRole(Role.ADMIN), propertyController.listPendingProperties);
router.patch(
  "/:id/moderate",
  authenticate,
  requireRole(Role.ADMIN),
  validate(moderatePropertySchema),
  propertyController.moderateProperty
);

// --- Public detail (kept last so literal routes above take precedence) ---
router.get("/:id", propertyController.getProperty);

export default router;
