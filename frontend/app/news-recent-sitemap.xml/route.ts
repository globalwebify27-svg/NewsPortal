// =============================================================================
// app/news-recent-sitemap.xml/route.ts — Google News Sitemap (Last 3 Days)
// URL: https://globalawaaz.com/news-recent-sitemap.xml
// =============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BASE_URL, buildArticleUrl, escapeXml } from "@/lib/sitemap-utils";

export const revalidate = 3600;

function formatImageUrl(rawUrl: string): string {
  if (!rawUrl) return "";

  // Fix malformed protocols stored in the database (https// → https://)
  let url = rawUrl;
  if (url.startsWith("https//")) url = url.replace("https//", "https://");
  if (url.startsWith("http//")) url = url.replace("http//", "http://");

  // Rewrite Hostinger media URLs to the main domain so internal
  // hosting infrastructure is never exposed in the public sitemap.
  const HOSTINGER_ORIGIN = "https://yellowgreen-rook-384455.hostingersite.com";

  if (url.includes("yellowgreen-rook-384455.hostingersite.com")) {
    const path = url.replace(HOSTINGER_ORIGIN, "");
    return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const clean = url.startsWith("/") ? url : `/${url}`;
  return `${BASE_URL}${clean}`;
}

/**
 * Safely clean string content inside CDATA blocks to prevent XML syntax breaks.
 */
function cleanCdata(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "")        // Remove HTML tags
    .replace(/\]\]>/g, "]]&gt;")    // Prevent premature CDATA termination
    .trim();
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

  // Build <url> entries with strict XML entity escaping
  const urlEntries = articles
    .map((art) => {
      const loc = escapeXml(buildArticleUrl(art));
      const lastmod = (art.updatedAt ? new Date(art.updatedAt) : new Date()).toISOString();
      const pubDate = (art.publishedAt ? new Date(art.publishedAt) : new Date(art.updatedAt || Date.now())).toISOString();
      const title = cleanCdata(art.title || "");

      // Image handling
      const imageUrlRaw = art.image || art.featuredImage;
      const hasImage = Boolean(imageUrlRaw);
      const imageUrl = hasImage ? escapeXml(formatImageUrl(imageUrlRaw)) : "";
      const imgTitle = cleanCdata(art.imageTitle || art.featuredImageAlt || title);
      const imgCaption = cleanCdata(art.imageCaption || art.featuredImageAlt || title);

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
