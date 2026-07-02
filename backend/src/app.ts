import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { logger } from "./config/logger";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { AppError } from "./utils/AppError";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "10kb" }));
  app.use(cookieParser());
  app.use(
    morgan("combined", {
      stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) },
    })
  );

  // Blanket rate limit; auth endpoints will get a stricter limit added in
  // Phase 1 hardening once real traffic patterns are known.
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/api/v1", routes);

  app.use((req, _res, next) => next(AppError.notFound(`Route ${req.originalUrl} not found`)));
  app.use(errorHandler);

  return app;
}
