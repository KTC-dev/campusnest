import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { logger } from "../config/logger";
import { isProd } from "../config/env";

// Must be registered last, after all routes. Express recognizes it as an
// error handler purely by its 4-argument signature.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let message = "Something went wrong";
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Translate common Prisma error codes into friendly, safe messages
    // rather than leaking raw database errors to clients.
    if (err.code === "P2002") {
      statusCode = 409;
      message = `A record with this ${(err.meta?.target as string[])?.join(", ") ?? "value"} already exists`;
      isOperational = true;
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
      isOperational = true;
    }
  }

  if (!isOperational) {
    logger.error("Unhandled error", { err, path: req.path, method: req.method, statusCode });
  } else {
    logger.warn(message, { path: req.path, method: req.method, statusCode });
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only leak stack traces outside production, and only for real bugs.
    ...(!isProd && !isOperational && err instanceof Error ? { stack: err.stack } : {}),
  });
}
