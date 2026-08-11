// =============================================================================
// app/sitemaps/articles-[month].xml/route.ts — Monthly Article Sitemap
// URL pattern: https://globalawaaz.com/sitemaps/articles-2026-08.xml
//
// Returns all published articles for a given calendar month.
// The [month] segment must match the pattern YYYY-MM (e.g. "2026-08").
//
// • Invalid segment → 400 Bad Request
// • Valid segment with no articles → empty urlset (200)
// • Revalidated every hour for the current month, every 24 h for past months
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  BASE_URL,
  fetchArticlesByMonth,
  buildArticleUrl,
  escapeXml,
  toW3CDate,
  xmlHeaders,
} from "@/lib/sitemap-utils";

// ---------------------------------------------------------------------------
// Route segment config
// ---------------------------------------------------------------------------

// Default ISR revalidation — overridden per-request below
export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse the [month] param (format: "YYYY-MM") into { year, month } numbers.
 * Returns null if the format is invalid.
 */
function parseMonthParam(month: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;

  const year  = parseInt(match[1], 10);
  const month_ = parseInt(match[2], 10);

  if (year < 2020 || year > 2100) return null;
  if (month_ < 1   || month_ > 12) return null;

  return { year, month: month_ };
}

/**
 * Determine whether a given year+month is the current calendar month.
 * Used to decide on a shorter revalidation window (articles still publishing).
 */
function isCurrentMonth(year: number, month: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() + 1 === month;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ month: string }> | { month: string } }
): Promise<NextResponse> {
  // Resolve params (Next.js 15 async params)
  const resolvedParams = await params;
  const monthParam = resolvedParams?.month ?? "";

  // ----- Validate the [month] segment -----
  const parsed = parseMonthParam(monthParam);
  if (!parsed) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><error>Invalid month format. Use YYYY-MM (e.g. articles-2026-08.xml)</error>`,
      {
        status: 400,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }

  const { year, month } = parsed;

  // ----- Fetch articles for this month from DB -----
  const articles = await fetchArticlesByMonth(year, month);

  // ----- Build <url> entries -----
  const urlEntries = articles
    .map((art) => {
      const loc     = escapeXml(buildArticleUrl(art));
      const lastmod = toW3CDate(art.updatedAt ?? art.publishedAt);

      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${isCurrentMonth(year, month) ? "daily" : "monthly"}</changefreq>
    <priority>${isCurrentMonth(year, month) ? "0.9" : "0.6"}</priority>
  </url>`;
    })
    .join("\n");

  // ----- Assemble XML -----
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Monthly article sitemap for ${monthParam} | ${articles.length} articles | Global Awaaz -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  // Current month revalidates every hour; past months every 24 h
  const revalidateSeconds = isCurrentMonth(year, month) ? 3600 : 86400;

  return new NextResponse(xml, { headers: xmlHeaders(revalidateSeconds) });
}
