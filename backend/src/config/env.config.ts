// =============================================================================
// Environment Variables Schema & Validation
// Fails fast at server boot if critical configuration is missing or invalid
// =============================================================================

import { z } from "zod";
import { logger } from "./logger";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  API_VERSION: z.string().default("v1"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  REDIS_TTL: z.coerce.number().default(3600),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET should be at least 16 chars long"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET should be at least 16 chars long"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("30d"),
  ALLOWED_ORIGINS: z.string().optional(),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    logger.error("❌ Invalid environment variables configuration:");
    logger.error(JSON.stringify(result.error.format(), null, 2));

    if (process.env.NODE_ENV === "production") {
      throw new Error("Critical environment variables missing or invalid for production.");
    } else {
      logger.warn("⚠️ Proceeding with default values in development mode.");
    }
  }

  // Warning check for default insecure secrets in production
  if (process.env.NODE_ENV === "production") {
    if (process.env.JWT_ACCESS_SECRET?.includes("super-secret")) {
      logger.warn("⚠️ SECURITY WARNING: You are using a default/sample JWT_ACCESS_SECRET in production!");
    }
  }

  return (result.data || process.env) as EnvConfig;
}
