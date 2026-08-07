import { MetadataRoute } from "next";

/**
 * Next.js 15 Dynamic Robots.txt Generator
 * URL: https://globalawaaz.com/robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.globalawaaz.com";

  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
