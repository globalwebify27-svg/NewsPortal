// =============================================================================
// app/sitemap.ts — Dynamic Sitemap Index
// Base URL: https://globalawaaz.com/sitemap.xml
//
// Master index referencing all specialized sub-sitemaps:
//   • /sitemaps/google-news.xml
//   • /sitemaps/news-recent.xml
//   • /sitemaps/pages.xml
//   • /sitemaps/categories.xml
//   • /sitemaps/articles-[month].xml (grouped dynamically by year and month)
// =============================================================================

import { MetadataRoute } from "next";
import {
  BASE_URL,
  fetchAllPublishedArticles,
  groupArticlesByMonth,
} from "@/lib/sitemap-utils";

export const revalidate = 21600; // 6 hours cache revalidation

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static sub-sitemaps
  const staticSitemaps: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/sitemaps/google-news.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemaps/news-recent.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemaps/pages.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemaps/categories.xml`,
      lastModified: now,
    },
  ];

  // 2. Dynamic monthly article sitemaps
  const publishedArticles = await fetchAllPublishedArticles();
  const months = groupArticlesByMonth(publishedArticles);

  const monthlySitemaps: MetadataRoute.Sitemap = months.map(({ label }) => ({
    url: `${BASE_URL}/sitemaps/articles-${label}.xml`,
    lastModified: now,
  }));

  return [...staticSitemaps, ...monthlySitemaps];
}
