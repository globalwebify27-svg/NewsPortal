// =============================================================================
// In-Process Server-Side Cache — Global Awaaz News Portal
// Eliminates repeated DB round-trips for frequently read data.
// TTL-based map cache; safe for Next.js serverless (per-process).
// =============================================================================

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();
  private staleStore = new Map<string, any>(); // Permanent in-memory fallback backup

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
    if (data && (!Array.isArray(data) || data.length > 0)) {
      this.staleStore.set(key, data);
    }
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /**
   * Returns stale data if current TTL has expired but DB connection is unavailable.
   */
  getStale<T>(key: string): T | null {
    return (this.staleStore.get(key) as T) || null;
  }

  delete(key: string): void {
    this.store.delete(key);
    this.staleStore.delete(key);
  }

  /** Invalidate all keys that start with a prefix (e.g. "articles:") */
  invalidatePrefix(prefix: string): void {
    for (const key of Array.from(this.store.keys())) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
    this.staleStore.clear();
  }
}

// Singleton — shared across all API requests within the same Node.js process
const globalForCache = globalThis as unknown as { __ga_cache?: MemoryCache };
export const serverCache = globalForCache.__ga_cache ?? (globalForCache.__ga_cache = new MemoryCache());

// TTL constants (milliseconds)
export const TTL = {
  ARTICLES_LIST: 30_000,     // 30s — public article lists
  ARTICLE_DETAIL: 60_000,    // 60s — single article page
  CATEGORIES: 300_000,       // 5 min — rarely changes
  BREAKING_NEWS: 20_000,     // 20s — very time-sensitive
  SETTINGS: 600_000,         // 10 min — site settings
} as const;
