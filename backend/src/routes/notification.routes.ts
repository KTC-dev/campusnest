import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);
router.get("/", notificationController.listNotifications);
router.patch("/:id/read", notificationController.markNotificationRead);
router.patch("/read-all", notificationController.markAllNotificationsRead);
router.delete("/:id", notificationController.deleteNotification);

export default router;
