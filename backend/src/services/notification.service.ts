import { NotificationType } from "@prisma/client";
import { prisma } from "../config/prisma";

interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
}

// Every notification in the app is created through this one method, so the
// shape is consistent and it's a single place to later add a delivery
// channel (email, push) without touching booking/property/roommate code.
class NotificationService {
  async notify(input: NotifyInput) {
    return prisma.notification.create({ data: input });
  }

  async listForUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async markRead(userId: string, notificationId: string) {
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
}

export const notificationService = new NotificationService();
