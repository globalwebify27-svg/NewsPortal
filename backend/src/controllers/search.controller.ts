// =============================================================================
// Search Controller — Meilisearch Engine with Database Fallback & Auto-Complete
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { ArticleStatus } from "@prisma/client";
import { prisma } from "../config/database";
import { cache, cacheKeys } from "../config/redis";
import { searchArticles, meili, INDICES, indexArticle } from "../config/meilisearch";
import { sendSuccess } from "../utils/response.utils";
import { getPaginationParams } from "../utils/response.utils";

// ─── 1. Full-Text Search (Meilisearch with DB Fallback) ──────────────────────
export async function searchContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = (req.query.q as string)?.trim() || "";
    const { page, limit, skip } = getPaginationParams(req.query);
    const category = req.query.category as string | undefined;

    if (!q) {
      sendSuccess(res, { hits: [], total: 0, query: "" });
      return;
    }

    try {
      // Build Meilisearch filter string
      const filters: string[] = ["status = PUBLISHED"];
      if (category) filters.push(`category = "${category}"`);

      const searchRes = await searchArticles(q, {
        limit,
        offset: skip,
        filter: filters.join(" AND "),
      });

      sendSuccess(res, {
        hits: searchRes.hits,
        total: searchRes.estimatedTotalHits || searchRes.hits.length,
        query: q,
        processingTimeMs: searchRes.processingTimeMs,
        source: "meilisearch",
      });
      return;
    } catch {
      // ─── Fallback to MySQL LIKE Search ──────────────────────────────────────
      const where: any = {
        status: ArticleStatus.PUBLISHED,
        OR: [
          { title: { contains: q } },
          { summary: { contains: q } },
          { body: { contains: q } },
        ],
      };

      if (category) {
        where.category = { slug: category };
      }

      const [articles, total] = await Promise.all([
        prisma.article.findMany({
          where,
          skip,
          take: limit,
          orderBy: { publishedAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            featuredImage: true,
            readTime: true,
            publishedAt: true,
            category: { select: { name: true, slug: true } },
            author: { select: { name: true } },
          },
        }),
        prisma.article.count({ where }),
      ]);

      sendSuccess(res, {
        hits: articles,
        total,
        query: q,
        source: "database_fallback",
      });
    }
  } catch (error) {
    next(error);
  }
}

// ─── 2. Instant Auto-Complete Suggestions ───────────────────────────────────
export async function searchAutoComplete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = (req.query.q as string)?.trim() || "";

    if (!q || q.length < 2) {
      sendSuccess(res, []);
      return;
    }

    const cacheKey = cacheKeys.searchSuggest(q);
    const cached = await cache.get<unknown[]>(cacheKey);
    if (cached) {
      sendSuccess(res, cached);
      return;
    }

    let suggestions: { id: string; title: string; slug: string; category: string }[] = [];

    try {
      const searchRes = await meili.index(INDICES.ARTICLES).search(q, {
        limit: 8,
        attributesToRetrieve: ["id", "title", "slug", "categoryName"],
      });

      suggestions = searchRes.hits.map((h: any) => ({
        id: h.id,
        title: h.title,
        slug: h.slug,
        category: h.categoryName || "General",
      }));
    } catch {
      // Fallback
      const DBhits = await prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          title: { contains: q },
        },
        take: 8,
        select: {
          id: true,
          title: true,
          slug: true,
          category: { select: { name: true } },
        },
      });

      suggestions = DBhits.map((h) => ({
        id: h.id,
        title: h.title,
        slug: h.slug,
        category: h.category?.name || "General",
      }));
    }

    await cache.set(cacheKey, suggestions, 300); // Cache 5 mins

    sendSuccess(res, suggestions);
  } catch (error) {
    next(error);
  }
}

// ─── 3. Bulk Sync All Articles to Meilisearch (Admin) ────────────────────────
export async function syncMeilisearchIndex(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const articles = await prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      include: {
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } },
        tags: { include: { tag: { select: { name: true } } } },
      },
    });

    const documents = articles.map((art) => ({
      id: art.id,
      title: art.title,
      titleHi: art.titleHi,
      slug: art.slug,
      summary: art.summary,
      summaryHi: art.summaryHi,
      body: art.body,
      featuredImage: art.featuredImage,
      categoryName: art.category?.name,
      category: art.category?.slug,
      authorName: art.author?.name,
      authorId: art.authorId,
      publishedAt: art.publishedAt?.getTime() || art.createdAt.getTime(),
      readTime: art.readTime,
      views: art.views,
      tags: art.tags.map((t) => t.tag.name),
      status: art.status,
      isBreaking: art.isBreaking,
      isTrending: art.isTrending,
      isFeatured: art.isFeatured,
      isPremium: art.isPremium,
    }));

    await meili.index(INDICES.ARTICLES).addDocuments(documents);

    sendSuccess(res, { syncedCount: documents.length }, "Meilisearch index synchronized!");
  } catch (error) {
    next(error);
  }
}
