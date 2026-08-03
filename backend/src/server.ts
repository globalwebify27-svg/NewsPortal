// =============================================================================
// Global Awaaz — HTTP Server Entry Point
// =============================================================================

import "dotenv/config";
import { httpServer } from "./app";
import { prisma } from "./config/database";
import { redis } from "./config/redis";
import { logger } from "./config/logger";
import { validateEnv } from "./config/env.config";

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  try {
    validateEnv();

    // ─── Database Connection ──────────────────────────────────────────────────
    await prisma.$connect();
    logger.info("✅ MySQL database connected via Prisma");

    // ─── Redis Connection ─────────────────────────────────────────────────────
    try {
      await redis.ping();
      logger.info("✅ Redis connected");
    } catch (redisErr) {
      logger.warn("⚠️ Redis connection failed, proceeding without Redis cache.");
    }

    // ─── Start HTTP Server ────────────────────────────────────────────────────
    httpServer.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════╗
║           GLOBAL AWAAZ — CMS API SERVER               ║
╠═══════════════════════════════════════════════════════╣
║  Environment : ${(process.env.NODE_ENV || "development").padEnd(38)}║
║  Port        : ${String(PORT).padEnd(38)}║
║  API Base    : http://localhost:${PORT}/api/v1${" ".repeat(15)}║
║  Health      : http://localhost:${PORT}/health${" ".repeat(15)}║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
async function shutdown(signal: string) {
  logger.info(`\n📴 Received ${signal}. Shutting down gracefully...`);
  httpServer.close(async () => {
    await prisma.$disconnect();
    await redis.quit();
    logger.info("✅ Server closed. Goodbye.");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

bootstrap();
