import { Role } from "@prisma/client";

// Augments Express's Request type so `req.user` is available and typed
// everywhere after the auth middleware runs, without `as any` casts
// scattered through controllers.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        email: string;
      };
    }
  }
}

export {};
