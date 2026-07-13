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

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;

  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://campusnest.app",
    "https://www.campusnest.app",
    "https://campusnest.pages.dev",
  ];

  for (const allowed of allowedOrigins) {
    if (allowed === origin) return true;

    if (allowed.endsWith(".pages.dev") && origin.endsWith(".pages.dev")) {
      const allowedBase = allowed.replace(".pages.dev", "");
      const originBase = origin.replace(".pages.dev", "");
      if (originBase.startsWith(allowedBase.replace(/^https?:\/\//, ""))) {
        return true;
      }
    }
  }

  return false;
};

export function createApp() {
  const app = express();

  app.set("trust proxy", env.TRUST_PROXY);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Authorization"],
    })
  );

  app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(204);
  });

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