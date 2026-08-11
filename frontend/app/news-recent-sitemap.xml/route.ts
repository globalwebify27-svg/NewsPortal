// =============================================================================
// app/news-recent-sitemap.xml/route.ts — Articles Sitemap
// URL: https://globalawaaz.com/news-recent-sitemap.xml
//
// Returns published articles for search engine indexers.
// =============================================================================

import { NextResponse } from "next/server";
import {
  fetchAllPublishedArticles,
  buildArticleUrl,
  escapeXml,
  toW3CDate,
  xmlHeaders,
} from "@/lib/sitemap-utils";

export const revalidate = 3600;

export async function GET(): Promise<NextResponse> {
  const articles = await fetchAllPublishedArticles();

  const urlEntries = articles
    .map((art) => {
      const loc     = escapeXml(buildArticleUrl(art));
      const lastmod = toW3CDate(art.updatedAt ?? art.publishedAt);

      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
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
