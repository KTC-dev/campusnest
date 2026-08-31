import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { notificationService } from "../services/notification.service";

export const listNotifications = catchAsync(async (req: Request, res: Response) => {
  const [notifications, unreadCount] = await Promise.all([
    notificationService.listForUser(req.user!.id),
    notificationService.unreadCount(req.user!.id),
  ]);
  res.status(200).json({ success: true, data: { notifications, unreadCount } });
});

export const markNotificationRead = catchAsync(async (req: Request, res: Response) => {
  await notificationService.markRead(req.user!.id, req.params.id);
  res.status(200).json({ success: true, data: null });
});

export const markAllNotificationsRead = catchAsync(async (req: Request, res: Response) => {
  await notificationService.markAllRead(req.user!.id);
  res.status(200).json({ success: true, data: null });
});

export const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  await notificationService.deleteNotification(req.user!.id, req.params.id);
  res.status(200).json({ success: true, data: null });
});
