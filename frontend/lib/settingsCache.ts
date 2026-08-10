// =============================================================================
// Lightweight In-Memory & LocalStorage Client Cache for NewsPortal
// Prevents redundant API fetches and accelerates page loads dramatically
// =============================================================================

const cacheStore: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL_MS = 60000; // 60 seconds TTL

export async function fetchWithCache<T = any>(url: string, ttlMs: number = CACHE_TTL_MS): Promise<T | null> {
  const now = Date.now();
  if (cacheStore[url] && now - cacheStore[url].timestamp < ttlMs) {
    return cacheStore[url].data as T;
  }

  try {
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      cacheStore[url] = { data: json, timestamp: now };
      return json as T;
    }
  } catch (err) {
    console.warn(`[CacheFetch] Error fetching ${url}:`, err);
  }

  // Fallback to expired cache if available
  if (cacheStore[url]) {
    return cacheStore[url].data as T;
  }

  return null;
}

export function clearCacheKey(url: string) {
  delete cacheStore[url];
}

export function clearAllCache() {
  Object.keys(cacheStore).forEach((key) => delete cacheStore[key]);
}
