// =============================================================================
// app/sitemaps/categories.xml/route.ts — Category Sections Sitemap
// URL: https://globalawaaz.com/sitemaps/categories.xml
// =============================================================================

import { NextResponse } from "next/server";
import {
  BASE_URL,
  escapeXml,
  xmlHeaders,
  fetchPublishedCategorySlugs,
} from "@/lib/sitemap-utils";

export const revalidate = 43200; // 12 hours revalidation

const REQUIRED_CATEGORIES = [
  "bihar",
  "jharkhand",
  "india",
  "world",
  "sports",
  "education",
];

export async function GET(): Promise<NextResponse> {
  const now = new Date().toISOString();

  // Fetch dynamic category slugs from published articles
  const dbCategorySlugs = await fetchPublishedCategorySlugs();

  // Combine, deduplicate, and sort category paths
  const allCategories = Array.from(
    new Set(REQUIRED_CATEGORIES.concat(dbCategorySlugs))
  ).sort();

  const urlEntries = allCategories
    .map((slug) => {
      const loc = escapeXml(`${BASE_URL}/category/${slug}`);
      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, { headers: xmlHeaders(43200) });
}
