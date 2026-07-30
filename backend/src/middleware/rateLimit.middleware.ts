// =============================================================================
// Rate Limiting Middleware
// =============================================================================

import rateLimit, { Options } from "express-rate-limit";
import { redis } from "../config/redis";
import { Request, Response } from "express";

interface RateLimitConfig {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

// ─── Generic Rate Limiter Factory ─────────────────────────────────────────────
export function createRateLimiter(config: RateLimitConfig = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 200,
    message = "Too many requests. Please try again later.",
    skipSuccessfulRequests = false,
  } = config;

  return rateLimit({
    windowMs,
    max,
    message: { success: false, message, statusCode: 429 },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    keyGenerator: (req: Request) =>
      (req.headers["x-forwarded-for"] as string) || req.ip || "unknown",
    handler: (_req: Request, res: Response) => {
      res.status(429).json({ success: false, message, statusCode: 429 });
    },
  } as Partial<Options> as Options);
}

// ─── Auth Rate Limiter (Strict) ───────────────────────────────────────────────
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 min
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: "Too many auth attempts. Please wait 15 minutes.",
  skipSuccessfulRequests: true,
});

// ─── API Write Limiter ────────────────────────────────────────────────────────
export const writeRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  message: "Too many write requests. Please slow down.",
});

// ─── Search Rate Limiter ──────────────────────────────────────────────────────
export const searchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many search requests.",
});
