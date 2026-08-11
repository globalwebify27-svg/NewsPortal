// =============================================================================
// app/news-recent-sitemap.xml/route.ts — Google News Sitemap (Last 3 Days)
// URL: https://globalawaaz.com/news-recent-sitemap.xml
// =============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BASE_URL, buildArticleUrl } from "@/lib/sitemap-utils";

export const revalidate = 3600;

function formatImageUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }
  const clean = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  return `${BASE_URL}${clean}`;
}

export async function GET(): Promise<NextResponse> {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  // Fetch published articles from the last 3 days, max 1000, sorted by publishedAt DESC
  let articles: any[] = [];
  try {
    articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: threeDaysAgo },
      },
      orderBy: { publishedAt: "desc" },
      take: 1000,
      select: {
        id: true,
        slug: true,
        title: true,
        featuredImage: true,
        featuredImageAlt: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
    });
  } catch (error) {
    console.error("[Google News Sitemap] Prisma fetch error:", error);
  }

  // Build <url> entries
  const urlEntries = articles
    .map((art) => {
      const loc = buildArticleUrl(art);
      const lastmod = (art.updatedAt ? new Date(art.updatedAt) : new Date()).toISOString();
      const pubDate = (art.publishedAt ? new Date(art.publishedAt) : new Date(art.updatedAt || Date.now())).toISOString();
      const title = art.title || "";

      // Image handling
      const imageUrlRaw = art.image || art.featuredImage;
      const hasImage = Boolean(imageUrlRaw);
      const imageUrl = hasImage ? formatImageUrl(imageUrlRaw) : "";
      const imgTitle = art.imageTitle || art.featuredImageAlt || title;
      const imgCaption = art.imageCaption || art.featuredImageAlt || title;

      const imageXml = hasImage && imageUrl ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title><![CDATA[${imgTitle}]]></image:title>
      <image:caption><![CDATA[${imgCaption}]]></image:caption>
    </image:image>` : "";

      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <news:news>
      <news:publication>
        <news:name>Global Awaaz</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${title}]]></news:title>
    </news:news>${imageXml}
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
