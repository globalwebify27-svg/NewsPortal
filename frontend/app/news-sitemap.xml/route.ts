import { NextResponse } from "next/server";
import { allDefaultArticles, stripHtml, getArticleUrl } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";

const BASE_URL = "https://globalawaaz.com";
const SITE_NAME = "GLOBAL AWAAZ";

async function getRecentNewsArticles() {
  let list: any[] = [];
  try {
    const res = await fetch(API_ENDPOINTS.articles, { next: { revalidate: 120 } });
    if (res.ok) {
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) {
        list = json.data;
      }
    }
  } catch (e) {
    // DB unavailable — serve empty sitemap
  }

  // No hardcoded fallback — all articles come from DB

  // Filter articles published within last 48 hours (or fallback to recent ones if mock date)
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const filtered = list.filter((art) => {
    if (!art.createdAt) return true;
    const artDate = new Date(art.createdAt);
    return artDate >= fortyEightHoursAgo || isNaN(artDate.getTime());
  });

  return filtered.length > 0 ? filtered : list.slice(0, 10);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await getRecentNewsArticles();

  const xmlItems = articles
    .map((art) => {
      const title = escapeXml(stripHtml(art.title || ""));
      const path = getArticleUrl(art);
      const pubDate = art.createdAt
        ? new Date(art.createdAt).toISOString()
        : new Date().toISOString();
      const lang = art.language === "HI" ? "hi" : "hi"; // Google news language publication code

      return `
    <url>
      <loc>${BASE_URL}${path}</loc>
      <news:news>
        <news:publication>
          <news:name>${SITE_NAME}</news:name>
          <news:language>${lang}</news:language>
        </news:publication>
        <news:publication_date>${pubDate}</news:publication_date>
        <news:title>${title}</news:title>
      </news:news>
    </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${xmlItems}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
