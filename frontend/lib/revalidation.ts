// =============================================================================
// Fast Revalidation & Cache Invalidation System — Global Awaaz News Portal
// Purges in-memory server cache & triggers Next.js ISR on-demand revalidation
// whenever content is uploaded or updated from the Admin panel.
// =============================================================================

import { revalidatePath } from "next/cache";
import { serverCache } from "./cache";

function safeRevalidate(path: string, type?: "page" | "layout"): void {
  try {
    if (type) {
      revalidatePath(path, type);
    } else {
      revalidatePath(path);
    }
  } catch (err) {
    // In dev / test or non-edge context, revalidatePath may log a benign warning
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[FastRevalidate] Warning revalidating ${path} (${type || "default"}):`, err);
    }
  }
}

/**
 * Triggered on article create, update, publish, or delete.
 * Purges article list memory cache, sitemap memory cache, and revalidates
 * homepage, latest feed, category section, individual article pages, and RSS/sitemaps.
 */
export function fastRevalidateAfterArticle(options?: {
  slug?: string;
  categorySlug?: string;
}): void {
  // 1. Instantly flush in-memory server cache for all article and sitemap queries
  serverCache.invalidatePrefix("articles:");
  serverCache.invalidatePrefix("sitemap:");

  // 2. Revalidate Root Layout & Homepage (forces navbar, breaking news, hero ticker updates)
  safeRevalidate("/", "layout");
  safeRevalidate("/");
  safeRevalidate("/latest");

  // 3. Revalidate specific article and category if provided
  if (options?.slug) {
    safeRevalidate(`/article/${options.slug}`);
    safeRevalidate(`/article/${options.slug}`, "page");

    if (options.categorySlug) {
      safeRevalidate(`/${options.categorySlug}/${options.slug}`);
      safeRevalidate(`/${options.categorySlug}/${options.slug}`, "page");
    }
  }

  if (options?.categorySlug) {
    safeRevalidate(`/${options.categorySlug}`);
    safeRevalidate(`/${options.categorySlug}`, "page");
  }

  // 4. Revalidate feeds and SEO sitemaps
  safeRevalidate("/feed.xml");
  safeRevalidate("/news-recent-sitemap.xml");
  safeRevalidate("/sitemap.xml");
}

/**
 * Triggered on category create, update, or delete.
 * Purges category cache and refreshes header navigation, category pages, and sitemaps.
 */
export function fastRevalidateAfterCategory(categorySlug?: string): void {
  serverCache.delete("categories:active");
  serverCache.invalidatePrefix("sitemap:");
  serverCache.invalidatePrefix("articles:");

  safeRevalidate("/", "layout");
  safeRevalidate("/");
  safeRevalidate("/categories-sitemap.xml");
  safeRevalidate("/sitemap.xml");

  if (categorySlug) {
    safeRevalidate(`/${categorySlug}`);
    safeRevalidate(`/${categorySlug}`, "page");
  }
}

/**
 * Triggered on Site Settings, Ads, Logo, Social, or City News update.
 */
export function fastRevalidateAfterSettings(type?: "logo" | "ads" | "social" | "city" | "all"): void {
  if (!type || type === "all" || type === "logo") serverCache.delete("settings:logo:all");
  if (!type || type === "all" || type === "ads") serverCache.delete("settings:ads:all");
  if (!type || type === "all" || type === "city") serverCache.delete("settings:city_news:all");

  safeRevalidate("/", "layout");
  safeRevalidate("/");
}

/**
 * Triggered on Videos or Live TV changes.
 */
export function fastRevalidateAfterVideos(): void {
  safeRevalidate("/", "layout");
  safeRevalidate("/");
  safeRevalidate("/videos");
}

/**
 * Triggered on e-Paper editions upload/change.
 */
export function fastRevalidateAfterEpaper(): void {
  safeRevalidate("/", "layout");
  safeRevalidate("/");
  safeRevalidate("/epaper");
}

/**
 * Complete Fast Purge: Empties ALL in-memory cache and revalidates all primary routes.
 */
export function fastRevalidateEverything(): { success: boolean; timestamp: number } {
  serverCache.clear();

  safeRevalidate("/", "layout");
  safeRevalidate("/");
  safeRevalidate("/latest");
  safeRevalidate("/videos");
  safeRevalidate("/epaper");
  safeRevalidate("/team");
  safeRevalidate("/about");
  safeRevalidate("/careers");
  safeRevalidate("/feed.xml");
  safeRevalidate("/sitemap.xml");
  safeRevalidate("/categories-sitemap.xml");
  safeRevalidate("/news-recent-sitemap.xml");
  safeRevalidate("/pages-sitemap.xml");

  return { success: true, timestamp: Date.now() };
}
