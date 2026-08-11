// =============================================================================
// app/sitemaps/pages.xml/route.ts — Static Core Pages Sitemap
// URL: https://globalawaaz.com/sitemaps/pages.xml
// =============================================================================

import { NextResponse } from "next/server";
import { BASE_URL, escapeXml, xmlHeaders } from "@/lib/sitemap-utils";

export const revalidate = 86400; // 24 hours revalidation

interface StaticPage {
  path: string;
  changefreq: string;
  priority: string;
}

const STATIC_PAGES: StaticPage[] = [
  { path: "/",                      changefreq: "always",  priority: "1.0" },
  { path: "/about",                 changefreq: "monthly", priority: "0.6" },
  { path: "/contact",               changefreq: "monthly", priority: "0.6" },
  { path: "/privacy-policy",        changefreq: "yearly",  priority: "0.4" },
  { path: "/terms-and-conditions",  changefreq: "yearly",  priority: "0.4" },
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
