// =============================================================================
// app/categories-sitemap.xml/route.ts — Category Pages Sitemap
// URL: https://globalawaaz.com/categories-sitemap.xml
//
// Lists all category section pages.
//
// Strategy:
//   1. Start with a hardcoded list of known main categories.
//   2. Merge with any additional category slugs discovered live from the DB
//      (i.e., categories that actually have published articles).
//   3. Deduplicate and sort alphabetically.
//   4. Also include all Indian state/region pages (/jharkhand, /bihar, etc.)
//   5. Revalidate every 12 hours.
// =============================================================================

import { NextResponse } from "next/server";
import {
  BASE_URL,
  escapeXml,
  xmlHeaders,
  fetchPublishedCategorySlugs,
} from "@/lib/sitemap-utils";
import { INDIAN_STATES } from "@/lib/states";

// Revalidate every 12 hours
export const revalidate = 43200;

// ---------------------------------------------------------------------------
// Known main category slugs (always included)
// ---------------------------------------------------------------------------
const MAIN_CATEGORIES = [
  "india",
  "world",
  "education",
  "business",
  "technology",
  "sports",
  "entertainment",
  "science",
  "health",
  "opinion",
  "videos",
  "latest",
];

export async function GET(): Promise<NextResponse> {
  const now = new Date().toISOString();

  // ---------------------------------------------------------------------------
  // 1. Fetch dynamic category slugs from DB (categories with published articles)
  // ---------------------------------------------------------------------------
  const dbSlugs = await fetchPublishedCategorySlugs();

  // ---------------------------------------------------------------------------
  // 2. Merge & deduplicate with hardcoded list
  // ---------------------------------------------------------------------------
  const allCategorySlugs = Array.from(
    new Set(MAIN_CATEGORIES.concat(dbSlugs))
  ).sort();

  // ---------------------------------------------------------------------------
  // 3. State / region pages (e.g. /jharkhand, /bihar, /uttar-pradesh)
  // ---------------------------------------------------------------------------
  const stateSlugs = INDIAN_STATES.map((st) => st.slug);

  // ---------------------------------------------------------------------------
  // 4. Build URL entries
  // ---------------------------------------------------------------------------
  const categoryEntries = allCategorySlugs.map((slug) => {
    const loc = escapeXml(`${BASE_URL}/${slug}`);
    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  const stateEntries = stateSlugs.map((slug) => {
    const loc = escapeXml(`${BASE_URL}/${slug}`);
    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  const allEntries = categoryEntries.concat(stateEntries).join("\n");

  // ---------------------------------------------------------------------------
  // 5. Assemble XML
  // ---------------------------------------------------------------------------
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries}
</urlset>`;

  return new NextResponse(xml, { headers: xmlHeaders(43200) });
}
