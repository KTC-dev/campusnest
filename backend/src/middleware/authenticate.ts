import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt";

// Reads the access token from the Authorization header, verifies it, and
// attaches the decoded payload to req.user. Downstream middleware
// (requireRole) and controllers rely on req.user being set.
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Missing or malformed authorization header"));
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired access token"));
  }
}
