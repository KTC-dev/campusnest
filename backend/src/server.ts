import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";
import { verifyAccessToken } from "./utils/jwt";
import { conversationService } from "./services/conversation.service";

const allowedOrigins =
  process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) ?? [];

const corsOptions = {
  origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (origin.endsWith(".edurus.pages.dev")) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};

const app = createApp();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions,
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
          primaryStudent: { select: { userId: true } },
          secondaryStudent: { select: { userId: true } },
          landlord: { select: { userId: true } },
        },
      });

      if (!conversation) return;

      const participantIds = [conversation.primaryStudent?.userId, conversation.secondaryStudent?.userId, conversation.landlord?.userId].filter(Boolean);
      if (!participantIds.includes(currentUser.id)) return;

      socket.join(`conversation:${payload.conversationId}`);
      socket.emit("conversation:joined", { conversationId: payload.conversationId });
    });

    socket.on("send_message", async (payload: { conversationId?: string; content?: string; messageType?: string; attachments?: Array<{ url: string; publicId?: string; fileName?: string; mimeType?: string; fileSize?: number; type?: "IMAGE" | "PDF" }> }) => {
      if (!payload?.conversationId) return;

      const message = await conversationService.sendMessage(currentUser.id, payload.conversationId, {
        content: payload.content,
        messageType: (payload.messageType as "TEXT" | "IMAGE" | "SYSTEM") ?? undefined,
        attachments: payload.attachments,
      });

      io.to(`conversation:${payload.conversationId}`).emit("conversation:message", {
        ...message,
        createdAt: message.createdAt.toISOString(),
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

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("Database connection established", { service: "edurus-backend" });

    const server = httpServer.listen(port, "0.0.0.0", () => {
      logger.info("Server started", { port, environment: env.NODE_ENV, service: "edurus-backend" });
    });

    let isShuttingDown = false;

    async function shutdown(signal: string) {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info("Shutdown requested", { signal, service: "edurus-backend" });
      server.close(async (error) => {
        if (error) {
          logger.error("Failed to shut down cleanly", { error, service: "edurus-backend" });
          process.exit(1);
        }

        await prisma.$disconnect();
        logger.info("Shutdown completed", { service: "edurus-backend" });
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout", { service: "edurus-backend" });
        process.exit(1);
      }, 10_000);
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("unhandledRejection", (reason) => logger.error("Unhandled rejection", { reason, service: "edurus-backend" }));
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught exception", { error, service: "edurus-backend" });
      process.exit(1);
    });

  } catch (error) {
    logger.error("Failed to start server", { error, service: "edurus-backend" });
    process.exit(1);
  }
}

startServer();