// =============================================================================
// app/pages-sitemap.xml/route.ts — Static Pages Sitemap
// URL: https://globalawaaz.com/pages-sitemap.xml
//
// Lists all static/evergreen pages of Global Awaaz.
// These rarely change so they are cached for 24 hours.
// =============================================================================

import { NextResponse } from "next/server";
import { BASE_URL, escapeXml, xmlHeaders } from "@/lib/sitemap-utils";

// Revalidate once per day — static pages change infrequently
export const revalidate = 86400;

// ---------------------------------------------------------------------------
// Static page definitions
// Each entry: { path, changefreq, priority }
// ---------------------------------------------------------------------------
interface StaticPage {
  path: string;
  changefreq: string;
  priority: string;
}

const STATIC_PAGES: StaticPage[] = [
  { path: "/",           changefreq: "always",  priority: "1.0" },
  { path: "/about",      changefreq: "monthly", priority: "0.6" },
  { path: "/team",       changefreq: "monthly", priority: "0.5" },
  { path: "/careers",    changefreq: "weekly",  priority: "0.5" },
  { path: "/advertise",  changefreq: "monthly", priority: "0.5" },
  { path: "/epaper",     changefreq: "daily",   priority: "0.7" },
  { path: "/videos",     changefreq: "hourly",  priority: "0.8" },
];

export async function GET(): Promise<NextResponse> {
  const now = new Date().toISOString();

  const urlEntries = STATIC_PAGES.map(({ path, changefreq, priority }) => {
    const loc = escapeXml(`${BASE_URL}${path}`);
    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, { headers: xmlHeaders(86400) });
}
