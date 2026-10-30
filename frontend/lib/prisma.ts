// =============================================================================
// Prisma Client Singleton with Production Connection Pooling — Global Awaaz
// =============================================================================

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Normalizes connection pool parameters to prevent connection starvation or overload.
 * Ensures connection_limit=10, pool_timeout=15, and connect_timeout=15.
 */
function getOptimizedDatabaseUrl(): string | undefined {
  const urlStr = process.env.DATABASE_URL;
  if (!urlStr) return undefined;

  try {
    const url = new URL(urlStr);
    const params = url.searchParams;

    // Set or optimize connection pool size
    const currentLimit = Number(params.get("connection_limit"));
    if (!currentLimit || currentLimit < 5) {
      params.set("connection_limit", "10");
    }

    if (!params.has("pool_timeout")) {
      params.set("pool_timeout", "15");
    }

    if (!params.has("connect_timeout")) {
      params.set("connect_timeout", "15");
    }

    return url.toString();
  } catch {
    return urlStr;
  }
}

const optimizedUrl = getOptimizedDatabaseUrl();

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    ...(optimizedUrl
      ? {
          datasources: {
            db: { url: optimizedUrl },
          },
        }
      : {}),
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

globalThis.__prisma = globalThis.__prisma ?? prisma;

/**
 * Health check utility to probe the database connection pool.
 * Measures round-trip ping latency and validates active connectivity.
 */
export async function checkDatabasePoolHealth(): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      ok: true,
      latencyMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database connection failed";
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: msg,
    };
  }
}

// Graceful pool disconnection on process termination
if (typeof process !== "undefined" && typeof process.on === "function") {
  const cleanup = async () => {
    try {
      await prisma.$disconnect();
    } catch {}
  };
  process.once("beforeExit", cleanup);
  process.once("SIGTERM", cleanup);
  process.once("SIGINT", cleanup);
}

export default prisma;
