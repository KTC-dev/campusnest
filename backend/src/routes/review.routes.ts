import { Router } from "express";
import * as reviewController from "../controllers/review.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { Role } from "@prisma/client";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdSchema,
  propertyReviewParamsSchema,
} from "../utils/validation/review.schema";

const router = Router();

router.use(authenticate);

router.post("/properties/:propertyId/reviews", validate(propertyReviewParamsSchema), validate(createReviewSchema), reviewController.createReview);

router.get("/properties/:propertyId/reviews", validate(propertyReviewParamsSchema), reviewController.getPropertyReviews);

router.get("/my", reviewController.getMyReview);

router.patch("/reviews/:id", validate(reviewIdSchema), validate(updateReviewSchema), reviewController.updateReview);

router.delete("/reviews/:id", validate(reviewIdSchema), reviewController.deleteReview);

router.post("/reviews/:id/helpful", validate(reviewIdSchema), reviewController.voteHelpful);

router.get("/admin/flagged", authenticate, requireRole(Role.ADMIN), reviewController.listFlaggedReviews);

export default router;