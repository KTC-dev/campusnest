import { NextFunction, Request, Response } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

// Wraps an async route handler so any rejected promise is forwarded to
// Express's error middleware instead of crashing the process or requiring
// a try/catch block in every single controller.
export const catchAsync = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch(next);
};
