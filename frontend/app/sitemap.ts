// =============================================================================
// app/sitemap.ts — Sitemap INDEX
// URL: https://globalawaaz.com/sitemap.xml
//
// Returns a sitemap index that lists all sub-sitemaps:
//   • Static pages
//   • Category pages
//   • Google News sitemap
//   • Recent news sitemap (last 72 h)
//   • One monthly sitemap per calendar month that has published articles
//
// Revalidated every 6 hours on Vercel Edge.
// =============================================================================

import { MetadataRoute } from "next";
import {
  BASE_URL,
  fetchAllPublishedArticles,
  groupArticlesByMonth,
} from "@/lib/sitemap-utils";

export const revalidate = 21600; // 6 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ---------------------------------------------------------------------------
  // 1. Sub-sitemap index entries — static sitemaps
  // ---------------------------------------------------------------------------
  const staticSitemaps: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/sitemaps/pages.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemaps/categories.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemaps/google-news.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemaps/news-recent.xml`,
      lastModified: now,
    },
  ];

  // ---------------------------------------------------------------------------
  // 2. Monthly article sitemaps — one entry per calendar month with articles
  //    e.g. /sitemaps/articles-2026-08.xml
  // ---------------------------------------------------------------------------
  const allArticles = await fetchAllPublishedArticles();
  const months = groupArticlesByMonth(allArticles);

  const monthlySitemaps: MetadataRoute.Sitemap = months.map(({ label }) => ({
    url: `${BASE_URL}/sitemaps/articles-${label}.xml`,
    lastModified: now,
  }));

  return [...staticSitemaps, ...monthlySitemaps];
}
