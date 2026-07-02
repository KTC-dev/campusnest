// A single error shape used across the app so the error-handling middleware
// can decide status codes and response bodies in one place, instead of
// every controller crafting its own res.status(...).json(...) on failure.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean; // true = expected/handled, false = bug

  constructor(message: string, statusCode = 400, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request") {
    return new AppError(message, 400);
  }
  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }
  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }
  static notFound(message = "Not found") {
    return new AppError(message, 404);
  }
  static conflict(message = "Conflict") {
    return new AppError(message, 409);
  }
  static internal(message = "Internal server error") {
    return new AppError(message, 500, false);
  }
}
