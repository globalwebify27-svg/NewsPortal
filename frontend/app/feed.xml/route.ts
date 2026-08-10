import { NextResponse } from "next/server";
import { allDefaultArticles, stripHtml, getArticleUrl } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";

const BASE_URL = "https://globalawaaz.com";
const SITE_NAME = "GLOBAL AWAAZ";
const SITE_TAGLINE = "LOCAL से GLOBAL तक";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let articles: any[] = [];
  try {
    const res = await fetch(API_ENDPOINTS.articles, { next: { revalidate: 180 } });
    if (res.ok) {
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) {
        articles = json.data;
      }
    }
  } catch (e) {
    // DB unavailable — serve empty feed
  }

  // No hardcoded fallback — all articles come from DB

  const rssItems = articles
    .slice(0, 30)
    .map((art) => {
      const title = escapeXml(stripHtml(art.title || ""));
      const description = escapeXml(stripHtml(art.summary || art.body || ""));
      const link = `${BASE_URL}${getArticleUrl(art)}`;
      const pubDate = art.createdAt
        ? new Date(art.createdAt).toUTCString()
        : new Date().toUTCString();
      const author = escapeXml(art.author?.name || "Global Awaaz Staff");

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${author}</dc:creator>
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} — ${SITE_TAGLINE}</title>
    <link>${BASE_URL}</link>
    <description>GLOBAL AWAAZ — Breaking Hindi &amp; English News, World Affairs, Sports, Business and Analytical Coverage.</description>
    <language>hi-IN</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
