import { NextFunction, Request, Response } from "express";

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  const sanitize = (obj: unknown): unknown => {
    if (typeof obj === "string") {
      return obj.replace(/\0/g, "").trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === "object") {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body) as typeof req.body;
  req.query = sanitize(req.query) as typeof req.query;
  req.params = sanitize(req.params) as typeof req.params;

  next();
}

