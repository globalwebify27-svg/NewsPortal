// =============================================================================
// Prisma Database Client (Singleton)
// =============================================================================

import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "event", level: "error" },
            { emit: "event", level: "warn" },
          ]
        : [{ emit: "event", level: "error" }],
    errorFormat: "pretty",
  });
}

// ─── Singleton: reuse in dev to avoid connection pool exhaustion ─────────────
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// ─── Query logging in development ────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  (prisma as any).$on("query", (e: any) => {
    logger.debug(`Prisma Query: ${e.query} [${e.duration}ms]`);
  });
}

export default prisma;
