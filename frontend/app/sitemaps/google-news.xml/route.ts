// =============================================================================
// app/sitemaps/google-news.xml/route.ts — Google News Specification Sitemap
// URL: https://globalawaaz.com/sitemaps/google-news.xml
// =============================================================================

import { NextResponse } from "next/server";
import {
  SITE_NAME,
  SITE_LANGUAGE,
  fetchRecentPublishedArticles,
  buildArticleUrl,
  escapeXml,
  toW3CDate,
  xmlHeaders,
} from "@/lib/sitemap-utils";

export const revalidate = 3600; // 1 hour revalidation

export async function GET(): Promise<NextResponse> {
  // Google News index window: last 48 hours
  const articles = await fetchRecentPublishedArticles(48);

  // Google News limit: maximum 1,000 articles per news sitemap
  const limitedArticles = articles.slice(0, 1000);

  const urlEntries = limitedArticles
    .map((article) => {
      const loc = escapeXml(buildArticleUrl(article));
      const title = escapeXml(article.title || "");
      const pubDate = toW3CDate(article.publishedAt ?? article.updatedAt);

      return `
  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>${SITE_LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
    <lastmod>${pubDate}</lastmod>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
>
${urlEntries}
</urlset>`;

  return new NextResponse(xml, { headers: xmlHeaders(3600) });
}
