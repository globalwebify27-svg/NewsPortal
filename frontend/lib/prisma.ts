
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;

  if (!url) return undefined;

  try {
    const dbUrl = new URL(url);

    // Optimized connection pool for serverless & edge reliability
    const currentLimit = Number(dbUrl.searchParams.get("connection_limit"));
    if (!currentLimit || currentLimit < 5) {
      dbUrl.searchParams.set("connection_limit", "5");
    }
    if (!dbUrl.searchParams.has("pool_timeout")) {
      dbUrl.searchParams.set("pool_timeout", "15");
    }
    if (!dbUrl.searchParams.has("connect_timeout")) {
      dbUrl.searchParams.set("connect_timeout", "15");
    }

    return dbUrl.toString();
  } catch {
    return url;
  }
}

const databaseUrl = getDatabaseUrl();

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    ...(databaseUrl
      ? {
        datasources: {
          db: { url: databaseUrl },
        },
      }
      : {}),
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

globalThis.__prisma = globalThis.__prisma ?? prisma;

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
