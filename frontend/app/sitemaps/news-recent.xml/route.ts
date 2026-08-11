// =============================================================================
// app/sitemaps/news-recent.xml/route.ts — Recent News Sitemap
// URL: https://globalawaaz.com/sitemaps/news-recent.xml
//
// Standard sitemap (NOT Google News format) for articles published in the
// last 72 hours (3 days).  Used by Bing, Yandex, and other crawlers.
//
// Revalidated every 1 hour by Vercel ISR.
// =============================================================================

import { NextResponse } from "next/server";
import {
  BASE_URL,
  fetchRecentPublishedArticles,
  buildArticleUrl,
  escapeXml,
  toW3CDate,
  xmlHeaders,
} from "@/lib/sitemap-utils";

// Revalidate every 1 hour on Vercel ISR
export const revalidate = 3600;

export async function GET(): Promise<NextResponse> {
  // Fetch articles published within the last 72 hours
  const articles = await fetchRecentPublishedArticles(72);

  // ---------------------------------------------------------------------------
  // Build standard <url> entries
  // ---------------------------------------------------------------------------
  const urlEntries = articles
    .map((art) => {
      const loc     = escapeXml(buildArticleUrl(art));
      const lastmod = toW3CDate(art.updatedAt ?? art.publishedAt);

      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`;
    })
    .join("\n");

  // ---------------------------------------------------------------------------
  // Assemble the XML document
  // ---------------------------------------------------------------------------
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, { headers: xmlHeaders(3600) });
}
