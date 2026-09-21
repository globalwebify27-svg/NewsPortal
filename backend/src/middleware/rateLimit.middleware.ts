// =============================================================================
// Rate Limiting Middleware — Redis-backed for horizontal scaling
// =============================================================================

import rateLimit, { Options } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis";
import { Request, Response } from "express";

interface RateLimitConfig {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  prefix?: string;
}

// ─── Create a Redis-backed store (falls back to memory on Redis failure) ──────
function createStore(prefix: string): InstanceType<typeof RedisStore> | undefined {
  try {
    return new RedisStore({
      // rate-limit-redis v6 uses sendCommand for ioredis compatibility
      sendCommand: async (...args: string[]) => {
        return redis.call(args[0], ...args.slice(1)) as Promise<number>;
      },
      prefix: `rl:${prefix}:`,
    });
  } catch (err) {
    // If Redis is unavailable, fall back to in-memory (not suitable for multi-instance)
    console.warn("[RateLimit] Redis store unavailable, falling back to in-memory:", err);
    return undefined;
  }
}

// ─── Generic Rate Limiter Factory ─────────────────────────────────────────────
export function createRateLimiter(config: RateLimitConfig = {}) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 200,
    message = "Too many requests. Please try again later.",
    skipSuccessfulRequests = false,
    prefix = "global",
  } = config;

  const store = createStore(prefix);

  return rateLimit({
    windowMs,
    max,
    message: { success: false, message, statusCode: 429 },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    store,
    keyGenerator: (req: Request) =>
      (req.headers["x-forwarded-for"] as string) || req.ip || "unknown",
    handler: (_req: Request, res: Response) => {
      res.status(429).json({ success: false, message, statusCode: 429 });
    },
  } as Partial<Options> as Options);
}

// ─── Auth Rate Limiter (Strict — 10 attempts per 15 min) ─────────────────────
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: "Too many auth attempts. Please wait 15 minutes.",
  skipSuccessfulRequests: true,
  prefix: "auth",
});

// ─── API Write Limiter (30 writes per minute) ─────────────────────────────────
export const writeRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many write requests. Please slow down.",
  prefix: "write",
});

// ─── Search Rate Limiter (60 searches per minute) ─────────────────────────────
export const searchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many search requests.",
  prefix: "search",
});
