import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";
import { verifyAccessToken } from "./utils/jwt";
import { notificationService } from "./services/notification.service";

const app = createApp();
const httpServer = createServer(app);
const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

function setupSocketServer() {
  io.use((socket, next) => {
    const authToken = typeof socket.handshake.auth?.token === "string"
      ? socket.handshake.auth.token
      : typeof socket.handshake.headers.authorization === "string"
        ? socket.handshake.headers.authorization
        : undefined;

    if (!authToken) {
      return next(new Error("Unauthorized"));
    }

    const token = authToken.startsWith("Bearer ") ? authToken.slice("Bearer ".length) : authToken;

    try {
      const payload = verifyAccessToken(token);
      (socket as Socket & { user?: { id: string; role: string; email: string } }).user = payload;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const currentUser = (socket as Socket & { user?: { id: string; role: string; email: string } }).user;
    if (!currentUser) {
      socket.disconnect();
      return;
    }

    socket.join(`user:${currentUser.id}`);
    socket.emit("connected", { userId: currentUser.id });

    socket.on("join_conversation", async (payload: { conversationId?: string }) => {
      if (!payload?.conversationId) return;

      const conversation = await prisma.conversation.findUnique({
        where: { id: payload.conversationId },
        select: {
          id: true,
          student: { select: { userId: true } },
          landlord: { select: { userId: true } },
        },
      });

      if (!conversation) return;

      const participantIds = [conversation.student.userId, conversation.landlord.userId];
      if (!participantIds.includes(currentUser.id)) return;

      socket.join(`conversation:${payload.conversationId}`);
      socket.emit("conversation:joined", { conversationId: payload.conversationId });
    });

    socket.on("send_message", async (payload: { conversationId?: string; content?: string; messageType?: string }) => {
      if (!payload?.conversationId || !payload.content?.trim()) return;

      const conversation = await prisma.conversation.findUnique({
        where: { id: payload.conversationId },
        select: {
          id: true,
          student: { select: { userId: true } },
          landlord: { select: { userId: true } },
        },
      });

      if (!conversation) return;

      const participantIds = [conversation.student.userId, conversation.landlord.userId];
      if (!participantIds.includes(currentUser.id)) return;

      const message = await prisma.message.create({
        data: {
          conversationId: payload.conversationId,
          senderId: currentUser.id,
          content: payload.content.trim(),
          messageType: (payload.messageType as "TEXT" | "IMAGE" | "SYSTEM") ?? "TEXT",
          isRead: false,
        },
        include: {
          sender: { select: { id: true, email: true, role: true } },
        },
      });

      const recipientId = conversation.student.userId === currentUser.id ? conversation.landlord.userId : conversation.student.userId;
      await prisma.conversation.update({ where: { id: payload.conversationId }, data: { updatedAt: new Date() } });

      io.to(`conversation:${payload.conversationId}`).emit("conversation:message", {
        ...message,
        createdAt: message.createdAt.toISOString(),
        sender: message.sender,
      });

      await notificationService.notify({
        userId: recipientId,
        type: "MESSAGE",
        title: "New message",
        body: payload.content.trim(),
      });
    });

    socket.on("typing", (payload: { conversationId?: string }) => {
      if (!payload?.conversationId) return;
      socket.to(`conversation:${payload.conversationId}`).emit("conversation:typing", {
        conversationId: payload.conversationId,
        userId: currentUser.id,
      });
    });

    socket.on("stop_typing", (payload: { conversationId?: string }) => {
      if (!payload?.conversationId) return;
      socket.to(`conversation:${payload.conversationId}`).emit("conversation:stop_typing", {
        conversationId: payload.conversationId,
        userId: currentUser.id,
      });
    });
  });
}

setupSocketServer();

const port = Number(env.PORT) || 4000;
const server = httpServer.listen(port, "0.0.0.0", () => {
  logger.info("Server started", { port, environment: env.NODE_ENV, service: "campusnest-backend" });
});

let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info("Shutdown requested", { signal, service: "campusnest-backend" });
  server.close(async (error) => {
    if (error) {
      logger.error("Failed to shut down cleanly", { error });
      process.exit(1);
    }

    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout", { service: "campusnest-backend" });
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => logger.error("Unhandled rejection", { reason }));
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  process.exit(1);
});
