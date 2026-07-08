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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed.includes("*")) {
          const pattern = "^" + allowed.replace(/[.]/g, "\\.").replace(/\*/g, "[^.]+") + "$";
          return new RegExp(pattern).test(origin);
        }
        return allowed === origin;
      });

      callback(null, isAllowed);
    },
    credentials: true,
  })
);

  app.set("trust proxy", env.TRUST_PROXY);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "15mb" }));
  app.use(cookieParser());
  app.use(
    morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
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
