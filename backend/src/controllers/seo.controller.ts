// =============================================================================
// SEO Controller — Dynamic XML Sitemap, Google News Sitemap, robots.txt & Schema.org
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { ArticleStatus } from "@prisma/client";
import { prisma } from "../config/database";
import { sendSuccess } from "../utils/response.utils";
import { NotFoundError } from "../middleware/error.middleware";

const BASE_URL = process.env.FRONTEND_URL || "https://globalawaaz.com";

// ─── 1. Dynamic XML Sitemap ───────────────────────────────────────────────────
export async function getXmlSitemap(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [articles, categories] = await Promise.all([
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        select: { slug: true, updatedAt: true, publishedAt: true, title: true },
        orderBy: { publishedAt: "desc" },
        take: 50000,
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <!-- Homepage -->
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Categories -->
  ${categories
    .map(
      (cat) => `
  <url>
    <loc>${BASE_URL}/${cat.slug}.html</loc>
    <lastmod>${(cat.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}

  <!-- Articles -->
  ${articles
    .map(
      (art) => `
  <url>
    <loc>${BASE_URL}/article.html?slug=${art.slug}</loc>
    <lastmod>${(art.updatedAt || art.publishedAt || new Date()).toISOString()}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.7</priority>
    <news:news>
      <news:publication>
        <news:name>Global Awaaz</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${(art.publishedAt || new Date()).toISOString()}</news:publication_date>
      <news:title>${art.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</news:title>
    </news:news>
  </url>`
    )
    .join("")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemapXml);
  } catch (error) {
    next(error);
  }
}

// ─── 2. Dynamic robots.txt ────────────────────────────────────────────────────
export async function getRobotsTxt(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /search?

Sitemap: ${BASE_URL}/sitemap.xml
`;
    res.header("Content-Type", "text/plain");
    res.send(robotsTxt);
  } catch (error) {
    next(error);
  }
}

// ─── 3. Schema.org NewsArticle & Breadcrumb JSON-LD Generator ────────────────
export async function getArticleJsonLd(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug as string;

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { name: true, avatar: true } },
      },
    });

    if (!article) throw new NotFoundError("Article not found.");

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${BASE_URL}/article.html?slug=${article.slug}`,
      },
      headline: article.title,
      description: article.summary,
      image: article.featuredImage ? [article.featuredImage] : undefined,
      datePublished: (article.publishedAt || article.createdAt).toISOString(),
      dateModified: article.updatedAt.toISOString(),
      author: {
        "@type": "Person",
        name: article.author.name,
      },
      publisher: {
        "@type": "Organization",
        name: "Global Awaaz",
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/logo.png`,
        },
      },
      articleSection: article.category.name,
    };

    sendSuccess(res, jsonLd);
  } catch (error) {
    next(error);
  }
}
