// =============================================================================
// app/robots.ts — Dynamic robots.txt
// URL: https://globalawaaz.com/robots.txt
//
// Allows all public pages; blocks admin, API, and CMS internals.
// References the sitemap index and key sub-sitemaps.
// =============================================================================

import { MetadataRoute } from "next";

const BASE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://globalawaaz.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // -------------------------------------------------------
        // All crawlers: allow public site, block internal paths
        // -------------------------------------------------------
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
        // -------------------------------------------------------
        // Googlebot: additionally allow sitemaps sub-directory
        // -------------------------------------------------------
        userAgent: "Googlebot",
        allow: ["/", "/sitemaps/"],
        disallow: ["/admin", "/api/", "/login"],
      },
    ],
    // Primary sitemap index
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/sitemaps/google-news.xml`,
      `${BASE_URL}/sitemaps/news-recent.xml`,
    ],
    host: BASE_URL,
  };
}
