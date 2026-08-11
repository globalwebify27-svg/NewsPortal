// =============================================================================
// app/sitemap.ts — Sitemap Index
// URL: https://globalawaaz.com/sitemap.xml
//
// Sitemap index referencing sub-sitemaps:
//   • /pages-sitemap.xml
//   • /categories-sitemap.xml
//   • /news-recent-sitemap.xml
// =============================================================================

import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/sitemap-utils";

export const revalidate = 21600; // 6 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  return [
    {
      url: `${BASE_URL}/pages-sitemap.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/categories-sitemap.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/news-recent-sitemap.xml`,
      lastModified: now,
    },
  ];
}
