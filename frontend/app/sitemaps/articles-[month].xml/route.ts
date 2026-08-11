// =============================================================================
// app/sitemaps/articles-[month].xml/route.ts — Monthly Article Archive Sitemap
// URL format: https://globalawaaz.com/sitemaps/articles-YYYY-MM.xml
// Example: https://globalawaaz.com/sitemaps/articles-2026-08.xml
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  fetchArticlesByMonth,
  buildArticleUrl,
  escapeXml,
  toW3CDate,
  xmlHeaders,
} from "@/lib/sitemap-utils";

export const revalidate = 3600; // 1 hour revalidation

/**
 * Parses and validates "YYYY-MM" route parameter into year and month numbers.
 */
function parseMonthParam(monthParam: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(monthParam);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);

  if (year < 2000 || year > 2100) return null;
  if (month < 1 || month > 12) return null;

  return { year, month };
}

/**
 * Checks if year and month correspond to the current active calendar month.
 */
function isCurrentMonth(year: number, month: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() + 1 === month;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ month: string }> | { month: string } }
): Promise<NextResponse> {
  const resolvedParams = await params;
  const monthParam = resolvedParams?.month ?? "";

  const parsedMonth = parseMonthParam(monthParam);
  if (!parsedMonth) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><error>Invalid month format. Expected YYYY-MM (e.g. articles-2026-08.xml)</error>`,
      {
        status: 400,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }

  const { year, month } = parsedMonth;
  const articles = await fetchArticlesByMonth(year, month);

  const urlEntries = articles
    .map((article) => {
      const loc = escapeXml(buildArticleUrl(article));
      const lastmod = toW3CDate(article.updatedAt ?? article.publishedAt);

      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${isCurrentMonth(year, month) ? "daily" : "monthly"}</changefreq>
    <priority>${isCurrentMonth(year, month) ? "0.9" : "0.6"}</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Monthly Article Sitemap for ${monthParam} | ${articles.length} Published Articles -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  const ttl = isCurrentMonth(year, month) ? 3600 : 86400;
  return new NextResponse(xml, { headers: xmlHeaders(ttl) });
}
