// =============================================================================
// lib/sitemap-utils.ts — Global Awaaz Sitemap Utility Library
// Helper functions, Prisma query wrappers, XML formatters, and Google Ping tool
// =============================================================================

import { prisma } from "./prisma";

// ---------------------------------------------------------------------------
// Types & Interfaces
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
  month: number;
  label: string; // Format: "YYYY-MM"
  articleCount: number;
}

// ---------------------------------------------------------------------------
// Configuration Constants
// ---------------------------------------------------------------------------

export const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://globalawaaz.com"
).replace(/\/$/, "");

export const SITE_NAME = "Global Awaaz";
export const SITE_LANGUAGE = "hi";

// ---------------------------------------------------------------------------
// XML Formatting Helpers
// ---------------------------------------------------------------------------

/**
 * Escapes XML entity characters to ensure valid XML responses.
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
 * Constructs absolute canonical URL for an article item.
 * Output format: https://globalawaaz.com/{categorySlug}/{articleSlug}
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
 * Converts a Date object or timestamp string to standard W3C ISO-8601 format.
 */
export function toW3CDate(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

/**
 * Prepares standard HTTP headers for XML sitemap HTTP responses.
 */
export function xmlHeaders(revalidateSeconds = 3600): Record<string, string> {
  return {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": `public, s-maxage=${revalidateSeconds}, stale-while-revalidate=${revalidateSeconds * 2}`,
    "X-Robots-Tag": "noindex",
  };
}

// ---------------------------------------------------------------------------
// Async Prisma Database Queries
// ---------------------------------------------------------------------------

const SITEMAP_ARTICLE_SELECT = {
  id: true,
  slug: true,
  title: true,
  publishedAt: true,
  updatedAt: true,
  category: { select: { slug: true } },
} as const;

/**
 * Fetch all published articles with status = 'PUBLISHED' (or 'published').
 */
export async function fetchAllPublishedArticles(): Promise<SitemapArticle[]> {
  try {
    return await prisma.article.findMany({
      where: {
        OR: [
          { status: "PUBLISHED" as any },
          { status: "published" as any },
        ],
      },
      orderBy: { publishedAt: "desc" },
      select: SITEMAP_ARTICLE_SELECT,
    });
  } catch (err) {
    console.error("[Sitemap Utils] fetchAllPublishedArticles error:", err);
    return [];
  }
}

/**
 * Fetch published articles within the last N hours.
 */
export async function fetchRecentPublishedArticles(
  hours: number
): Promise<SitemapArticle[]> {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  try {
    return await prisma.article.findMany({
      where: {
        OR: [
          { status: "PUBLISHED" as any },
          { status: "published" as any },
        ],
        publishedAt: { gte: cutoff },
      },
      orderBy: { publishedAt: "desc" },
      select: SITEMAP_ARTICLE_SELECT,
    });
  } catch (err) {
    console.error("[Sitemap Utils] fetchRecentPublishedArticles error:", err);
    return [];
  }
}

/**
 * Fetch published articles for a given year and month.
 */
export async function fetchArticlesByMonth(
  year: number,
  month: number
): Promise<SitemapArticle[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  try {
    return await prisma.article.findMany({
      where: {
        OR: [
          { status: "PUBLISHED" as any },
          { status: "published" as any },
        ],
        publishedAt: { gte: startDate, lt: endDate },
      },
      orderBy: { publishedAt: "desc" },
      select: SITEMAP_ARTICLE_SELECT,
    });
  } catch (err) {
    console.error(`[Sitemap Utils] fetchArticlesByMonth(${year}-${month}) error:`, err);
    return [];
  }
}

/**
 * Fetch unique active category slugs containing published articles.
 */
export async function fetchPublishedCategorySlugs(): Promise<string[]> {
  try {
    const rows = await prisma.article.findMany({
      where: {
        OR: [
          { status: "PUBLISHED" as any },
          { status: "published" as any },
        ],
      },
      select: { category: { select: { slug: true } } },
      distinct: ["categoryId"],
    });
    return Array.from(new Set(rows.map((r) => r.category?.slug).filter(Boolean) as string[]));
  } catch (err) {
    console.error("[Sitemap Utils] fetchPublishedCategorySlugs error:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Month Grouping & Google Ping Optimization
// ---------------------------------------------------------------------------

/**
 * Groups an array of published articles by month (YYYY-MM).
 */
export function groupArticlesByMonth(articles: SitemapArticle[]): MonthGroup[] {
  const countsMap = new Map<string, number>();

  for (const art of articles) {
    const date = art.publishedAt ? new Date(art.publishedAt) : new Date(art.updatedAt);
    if (isNaN(date.getTime())) continue;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    countsMap.set(key, (countsMap.get(key) ?? 0) + 1);
  }

  return Array.from(countsMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([label, articleCount]) => {
      const [year, month] = label.split("-").map(Number);
      return { year, month, label, articleCount };
    });
}

/**
 * Sends a ping request to Google Search Console to re-crawl the sitemap index.
 * 
 * WORKFLOW CALLSITE COMMENT:
 * Call this function inside your article publish API handler or Server Action:
 * 
 *   // app/api/v1/articles/route.ts (or publish action)
 *   if (article.status === 'PUBLISHED') {
 *     await pingSitemapToGoogle();
 *   }
 */
export async function pingSitemapToGoogle(): Promise<void> {
  const sitemapIndexUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
  const googlePingUrl = `https://www.google.com/ping?sitemap=${sitemapIndexUrl}`;

  try {
    const res = await fetch(googlePingUrl, { method: "GET", cache: "no-store" });
    if (res.ok) {
      console.info("[Sitemap Ping] Successfully notified Google of sitemap update.");
    } else {
      console.warn("[Sitemap Ping] Google ping responded with status:", res.status);
    }
  } catch (err) {
    console.warn("[Sitemap Ping] Failed to ping Google (non-fatal):", err);
  }
}
