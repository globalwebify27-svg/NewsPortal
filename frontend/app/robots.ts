import { MetadataRoute } from "next";

/**
 * Next.js 15 Dynamic Robots.txt Generator
 * URL: https://globalawaaz.com/robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://globalawaaz.com";
  const disableIndexing = process.env.NEXT_PUBLIC_ROBOTS_NOINDEX === "true";

  if (disableIndexing) {
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

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin/*",
          "/api/",
          "/login",
          "/upload.php",
          "/*.json",
        ],
      },
      {
        userAgent: "Googlebot-News",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Mediapartners-Google",
        allow: "/",
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/news-sitemap.xml`,
    ],
    host: baseUrl,
  };
}
