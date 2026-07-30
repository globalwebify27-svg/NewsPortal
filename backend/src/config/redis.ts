// =============================================================================
// Redis Client (ioredis) — Caching, Sessions, Rate Limiting, Pub/Sub
// =============================================================================

import Redis from "ioredis";
import { logger } from "./logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  retryStrategy: (times: number) => {
    if (times > 10) {
      logger.error("Redis: Max retry attempts reached. Giving up.");
      return null;
    }
    const delay = Math.min(times * 200, 2000);
    logger.warn(`Redis: Retrying connection in ${delay}ms (attempt ${times})`);
    return delay;
  },
});

redis.on("connect", () => logger.info("Redis: Connection established"));
redis.on("ready", () => logger.info("Redis: Ready to accept commands"));
redis.on("error", (err) => logger.error("Redis error:", err));
redis.on("close", () => logger.warn("Redis: Connection closed"));
redis.on("reconnecting", () => logger.info("Redis: Reconnecting..."));

// ─── Cache Helper Functions ───────────────────────────────────────────────────

const DEFAULT_TTL = Number(process.env.REDIS_TTL) || 3600; // 1 hour

export const cache = {
  /** Get a cached value (returns parsed JSON or null) */
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },

  /** Set a value with optional TTL in seconds */
  async set(key: string, value: unknown, ttl: number = DEFAULT_TTL): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl > 0) {
      await redis.setex(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
  },

  /** Delete a cache key */
  async del(key: string | string[]): Promise<void> {
    const keys = Array.isArray(key) ? key : [key];
    if (keys.length > 0) await redis.del(...keys);
  },

  /** Delete all keys matching a pattern */
  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  },

  /** Check if a key exists */
  async exists(key: string): Promise<boolean> {
    const count = await redis.exists(key);
    return count > 0;
  },

  /** Get remaining TTL for a key */
  async ttl(key: string): Promise<number> {
    return redis.ttl(key);
  },

  /** Increment a counter */
  async incr(key: string, by: number = 1): Promise<number> {
    return redis.incrby(key, by);
  },
};

// ─── Cache Key Generators ─────────────────────────────────────────────────────
export const cacheKeys = {
  article: (slug: string) => `article:${slug}`,
  articles: (params: string) => `articles:${params}`,
  category: (slug: string) => `category:${slug}`,
  categories: () => "categories:all",
  breakingNews: () => "breaking_news:active",
  trending: () => "articles:trending",
  featured: () => "articles:featured",
  siteSettings: () => "site_settings:all",
  user: (id: string) => `user:${id}`,
  searchSuggest: (q: string) => `search:suggest:${q}`,
};

export default redis;
