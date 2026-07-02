import { PrismaClient } from "@prisma/client";
import { isProd } from "./env";

// A single shared PrismaClient instance. Recreating it per-request (or per
// module import, without this guard) exhausts the Postgres connection pool
// under load and is a common source of "too many connections" errors.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: isProd ? ["error", "warn"] : ["query", "error", "warn"],
  });

if (!isProd) {
  global.__prisma = prisma;
}
