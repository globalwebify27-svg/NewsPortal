// =============================================================================
// app/sitemaps/google-news.xml/route.ts — Google News Sitemap
// URL: https://globalawaaz.com/sitemaps/google-news.xml
//
// Contains only articles published within the last 48 hours.
// Follows the official Google News sitemap spec:
//   https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
//
// Rules enforced:
//   • Max 1000 URLs (Google requirement)
//   • Only articles ≤ 48 hours old
//   • Includes <news:news> metadata block with publication name, language,
//     publication_date, and title
//   • Revalidated every hour by Vercel ISR
// =============================================================================

import { NextResponse } from "next/server";
import {
  BASE_URL,
  SITE_NAME,
  SITE_LANGUAGE,
  fetchRecentPublishedArticles,
  buildArticleUrl,
  escapeXml,
  toW3CDate,
  xmlHeaders,
} from "@/lib/sitemap-utils";

// Revalidate every 1 hour on Vercel Edge / ISR
export const revalidate = 3600;

export async function GET(): Promise<NextResponse> {
  // Fetch articles published in the last 48 hours (Google News window)
  const articles = await fetchRecentPublishedArticles(48);

  // Google requires at most 1 000 URLs per news sitemap
  const limited = articles.slice(0, 1000);

  // ---------------------------------------------------------------------------
  // Build <url> entries with the required <news:news> metadata block
  // ---------------------------------------------------------------------------
  const urlEntries = limited
    .map((art) => {
      const loc         = escapeXml(buildArticleUrl(art));
      const title       = escapeXml(art.title || "");
      const pubDate     = toW3CDate(art.publishedAt ?? art.updatedAt);

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

  // ---------------------------------------------------------------------------
  // Assemble the final XML document
  // ---------------------------------------------------------------------------
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
>
${urlEntries}
</urlset>`;

  return new NextResponse(xml, { headers: xmlHeaders(3600) });
}
