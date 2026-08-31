import { NotificationType } from "@prisma/client";
import { prisma } from "../config/prisma";
import { emailService } from "./email.service";
import { pushService } from "./push.service";

interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  isSecurity?: boolean;
}

class NotificationService {
  async notify(input: NotifyInput) {
    const { userId, type, title, body, actionUrl, isSecurity = false } = input;

    const notification = await prisma.notification.create({
      data: { userId, type, title, body, actionUrl, isSecurity },
    });

    const prefs = await prisma.userPreference.findUnique({ where: { userId } });

    const isSecurityNotification = isSecurity;
    const canSendInApp = isSecurityNotification ? (prefs?.securityNotifEnabled ?? true) : (prefs?.inApp ?? true);
    const canSendEmail = isSecurityNotification ? (prefs?.securityNotifEnabled ?? true) : (prefs?.email ?? true);
    const canSendPush = isSecurityNotification ? (prefs?.securityNotifEnabled ?? true) : (prefs?.push ?? false);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, pushToken: true },
    });

    const dispatchPromises: Promise<void>[] = [];

    if (canSendInApp) {
      dispatchPromises.push(Promise.resolve());
    }

    if (canSendEmail && user?.email) {
      dispatchPromises.push(
        emailService.sendNotificationEmail(user.email, title, body, actionUrl).catch(() => {})
      );
    }

    if (canSendPush && user?.pushToken) {
      dispatchPromises.push(
        pushService.sendToDevice(user.pushToken, title, body, actionUrl ? { actionUrl } : undefined).catch(() => {})
      );
    }

    await Promise.allSettled(dispatchPromises);

    return notification;
  }

  async listForUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or access denied");
    }
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, readAt: null } });
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or access denied");
    }
    return prisma.notification.delete({ where: { id: notificationId } });
  }
}

export const notificationService = new NotificationService();