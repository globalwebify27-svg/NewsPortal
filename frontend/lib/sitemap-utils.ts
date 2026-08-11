// =============================================================================
// Global Awaaz — Sitemap Utility Library
// Shared helpers used across all sitemap route handlers
// =============================================================================

import { prisma } from "./prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SitemapArticle {
  id: string;
  slug: string;
  title: string;
  publishedAt: Date | null;
  updatedAt: Date;
  category: { slug: string } | null;
}

export interface MonthGroup {
  year: number;
  month: number;          // 1-12
  label: string;          // "2026-08"
  articleCount: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const BASE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://globalawaaz.com").replace(/\/$/, "");

export const SITE_NAME = "Global Awaaz";
export const SITE_LANGUAGE = "hi";

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------

/**
 * Escape all XML special characters so the sitemap remains valid XML.
 */
export function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Build an absolute article URL from the stored slug and its category slug.
 * Pattern: /{categorySlug}/{articleSlug}
 */
export function buildArticleUrl(article: SitemapArticle): string {
  const catSlug = (article.category?.slug || "article")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  const artSlug = article.slug.toLowerCase();
  return `${BASE_URL}/${catSlug}/${artSlug}`;
}

/**
 * Format a Date to ISO 8601 (W3C datetime) used in lastmod tags.
 */
export function toW3CDate(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

/**
 * Standard XML response headers for all sitemap routes.
 */
export function xmlHeaders(revalidateSeconds = 3600): Record<string, string> {
  return {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": `public, s-maxage=${revalidateSeconds}, stale-while-revalidate=${revalidateSeconds * 2}`,
    "X-Robots-Tag": "noindex",
  };
}

// ---------------------------------------------------------------------------
// Prisma query helpers
// ---------------------------------------------------------------------------

/**
 * Minimal field projection used by all sitemap queries —
 * intentionally omits heavy body/summary columns for speed.
 */
const SITEMAP_SELECT = {
  id: true,
  slug: true,
  title: true,
  publishedAt: true,
  updatedAt: true,
  category: { select: { slug: true } },
} as const;

/**
 * Fetch all PUBLISHED articles from the database.
 * Results are ordered newest first.
 */
export async function fetchAllPublishedArticles(): Promise<SitemapArticle[]> {
  try {
    return await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: SITEMAP_SELECT,
    });
  } catch (err) {
    console.error("[Sitemap] fetchAllPublishedArticles error:", err);
    return [];
  }
}

/**
 * Fetch PUBLISHED articles published within the last `hours` hours.
 */
export async function fetchRecentPublishedArticles(
  hours: number
): Promise<SitemapArticle[]> {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  try {
    return await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: cutoff },
      },
      orderBy: { publishedAt: "desc" },
      select: SITEMAP_SELECT,
    });
  } catch (err) {
    console.error("[Sitemap] fetchRecentPublishedArticles error:", err);
    return [];
  }
}

/**
 * Fetch PUBLISHED articles for a specific calendar month.
 * @param year  Full 4-digit year (e.g. 2026)
 * @param month 1-indexed month (1 = January)
 */
export async function fetchArticlesByMonth(
  year: number,
  month: number
): Promise<SitemapArticle[]> {
  const from = new Date(year, month - 1, 1);          // 1st day of month
  const to   = new Date(year, month, 1);               // 1st day of next month
  try {
    return await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: from, lt: to },
      },
      orderBy: { publishedAt: "desc" },
      select: SITEMAP_SELECT,
    });
  } catch (err) {
    console.error(`[Sitemap] fetchArticlesByMonth(${year}-${month}) error:`, err);
    return [];
  }
}

/**
 * Fetch PUBLISHED articles for all categories from DB.
 * Returns a deduplicated list of category slugs.
 */
export async function fetchPublishedCategorySlugs(): Promise<string[]> {
  try {
    const rows = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { category: { select: { slug: true } } },
      distinct: ["categoryId"],
    });
    return Array.from(new Set(rows.map((r) => r.category?.slug).filter(Boolean) as string[]));
  } catch (err) {
    console.error("[Sitemap] fetchPublishedCategorySlugs error:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Month grouping utility
// ---------------------------------------------------------------------------

/**
 * Given an array of articles, return a list of unique {year, month} tuples
 * sorted from newest to oldest.  Used by sitemap.ts to generate monthly
 * sitemap index entries without fetching full article bodies.
 */
export function groupArticlesByMonth(articles: SitemapArticle[]): MonthGroup[] {
  const map = new Map<string, number>(); // "2026-08" → count

  for (const art of articles) {
    const d = art.publishedAt ? new Date(art.publishedAt) : new Date(art.updatedAt);
    if (isNaN(d.getTime())) continue;
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0])) // newest first
    .map(([label, articleCount]) => {
      const [y, m] = label.split("-").map(Number);
      return { year: y, month: m, label, articleCount };
    });
}

// ---------------------------------------------------------------------------
// Google Ping utility
// ---------------------------------------------------------------------------

/**
 * Ping Google Search Console with the main sitemap URL.
 *
 * Call this function AFTER a new article is published, e.g.:
 *
 *   // Inside your publish workflow (API route / server action):
 *   import { pingSitemapToGoogle } from "@/lib/sitemap-utils";
 *   await pingSitemapToGoogle();
 *
 * Note: Google deprecated the /ping endpoint in 2023 for standard sitemaps,
 * but it still works for Google News sitemaps via Search Console.
 * The recommended approach is submitting via the Search Console API.
 */
export async function pingSitemapToGoogle(): Promise<void> {
  const sitemapUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
  const pingUrl = `https://www.google.com/ping?sitemap=${sitemapUrl}`;

  try {
    const res = await fetch(pingUrl, { method: "GET", cache: "no-store" });
    if (res.ok) {
      console.info("[Sitemap] Successfully pinged Google with sitemap URL.");
    } else {
      console.warn("[Sitemap] Google ping returned status:", res.status);
    }
  } catch (err) {
    // Non-fatal — do not throw; ping failure should not block publishing
    console.warn("[Sitemap] Google ping failed (non-fatal):", err);
  }
}
