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

export function createApp() {
  const app = express();

  app.set("trust proxy", env.TRUST_PROXY);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(express.json({ limit: "15mb" }));
  app.use(cookieParser());
  app.use(
    morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
      stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) },
    })
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get("/health", (_req, res) =>
    res.status(200).json({
      status: "ok",
      version: env.APP_VERSION,
      environment: env.NODE_ENV,
    })
  );

  app.use("/api/v1", routes);

  app.use((req, _res, next) => next(AppError.notFound(`Route ${req.originalUrl} not found`)));
  app.use(errorHandler);

  return app;
}