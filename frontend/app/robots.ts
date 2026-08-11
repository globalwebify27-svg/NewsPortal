// =============================================================================
// app/robots.ts — Dynamic robots.txt
// URL: https://globalawaaz.com/robots.txt
//
// Allows all public pages; blocks admin, API, and CMS internals.
// References the main sitemap index and active sitemaps.
// =============================================================================

import { MetadataRoute } from "next";

const BASE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://globalawaaz.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/login",
          "/_next/",
          "/static/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/admin", "/api/", "/login"],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/news-recent-sitemap.xml`,
    ],
    host: BASE_URL,
  };
}
