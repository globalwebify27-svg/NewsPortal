// =============================================================================
// app/sitemaps/news-recent.xml/route.ts — Recent News Sitemap (Last 72 Hours)
// URL: https://globalawaaz.com/sitemaps/news-recent.xml
// =============================================================================

import { NextResponse } from "next/server";
import {
  fetchRecentPublishedArticles,
  buildArticleUrl,
  escapeXml,
  toW3CDate,
  xmlHeaders,
} from "@/lib/sitemap-utils";

export const revalidate = 3600; // 1 hour revalidation

export async function GET(): Promise<NextResponse> {
  // Articles published in the last 72 hours (3 days)
  const articles = await fetchRecentPublishedArticles(72);

  const urlEntries = articles
    .map((article) => {
      const loc = escapeXml(buildArticleUrl(article));
      const lastmod = toW3CDate(article.updatedAt ?? article.publishedAt);

      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, { headers: xmlHeaders(3600) });
}
