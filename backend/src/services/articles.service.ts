// =============================================================================
// Articles Service — Business Logic & Database Queries for Articles
// =============================================================================

import { ArticleStatus } from "@prisma/client";
import { prisma } from "../config/database";
import { cache, cacheKeys } from "../config/redis";
import { NotFoundError, ForbiddenError } from "../middleware/error.middleware";
import { createUniqueArticleSlug, calculateReadTime } from "../utils/slug.utils";

export interface ArticleQueryParams {
  page: number;
  limit: number;
  skip: number;
  category?: string;
  tag?: string;
  search?: string;
}

export class ArticlesService {
  /**
   * Fetch public published articles with filtering & pagination
   */
  static async getPublicArticles(params: ArticleQueryParams) {
    const { page, limit, skip, category, tag, search } = params;

    const where: any = {
      status: ArticleStatus.PUBLISHED,
    };

    if (category) {
      where.category = { slug: category };
    }

    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { body: { contains: search } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          category: { select: { id: true, name: true, nameHi: true, slug: true, color: true } },
          author: { select: { id: true, name: true, avatar: true } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true, color: true } } } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return { articles, total, page, limit };
  }

  /**
   * Fetch a single published article by slug (with Redis caching)
   */
  static async getArticleBySlug(slug: string) {
    const cacheKey = cacheKeys.article(slug);

    // Try Redis cache first
    const cached = await cache.get<unknown>(cacheKey);
    if (cached) {
      // Async view count increment
      prisma.article.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => {});
      return cached;
    }

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true, bio: true, twitterHandle: true } },
        tags: { include: { tag: true } },
        poll: { include: { options: true } },
        _count: { select: { comments: true, likes: true, bookmarks: true } },
      },
    });

    if (!article || article.status !== ArticleStatus.PUBLISHED) {
      throw new NotFoundError("Article not found or not published.");
    }

    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    await cache.set(cacheKey, article, 600); // Cache for 10 mins
    return article;
  }

  /**
   * Fetch featured story feeds (Hero, Breaking, Trending, Editors Pick)
   */
  static async getFeaturedFeeds() {
    const cacheKey = cacheKeys.featured();
    const cached = await cache.get<unknown>(cacheKey);
    if (cached) {
      return cached;
    }

    const [hero, breaking, trending, editorsPick] = await Promise.all([
      prisma.article.findFirst({
        where: { status: ArticleStatus.PUBLISHED, isFeatured: true },
        orderBy: { publishedAt: "desc" },
        include: { category: true, author: { select: { name: true, avatar: true } } },
      }),
      prisma.breakingNews.findMany({
        where: { isActive: true },
        orderBy: { priority: "asc" },
        take: 5,
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, isTrending: true },
        orderBy: { views: "desc" },
        take: 6,
        include: { category: true },
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, isEditorsPick: true },
        orderBy: { publishedAt: "desc" },
        take: 4,
        include: { category: true, author: { select: { name: true } } },
      }),
    ]);

    const feed = { hero, breaking, trending, editorsPick };
    await cache.set(cacheKey, feed, 300); // Cache for 5 mins
    return feed;
  }

  /**
   * Create a new article
   */
  static async createArticle(userId: string, data: any) {
    const slug = await createUniqueArticleSlug(data.title);
    const readTime = calculateReadTime(data.body);

    const { tagIds, ...articleData } = data;

    const article = await prisma.article.create({
      data: {
        ...articleData,
        slug,
        readTime,
        authorId: userId,
        publishedAt: data.status === ArticleStatus.PUBLISHED ? new Date() : null,
        tags: tagIds
          ? {
              create: tagIds.map((tagId: string) => ({ tagId })),
            }
          : undefined,
      },
      include: { category: true, tags: { include: { tag: true } } },
    });

    await cache.delPattern("articles:*");
    return article;
  }

  /**
   * Update existing article
   */
  static async updateArticle(id: string, user: { id: string; role: string }, data: any) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Article not found");

    if (existing.authorId !== user.id && !["ADMIN", "SUPERADMIN", "EDITOR"].includes(user.role)) {
      throw new ForbiddenError("You do not have permission to edit this article.");
    }

    const { tagIds, ...articleData } = data;

    const updatePayload: Record<string, unknown> = { ...articleData };
    if (data.body) {
      updatePayload.readTime = calculateReadTime(data.body);
    }
    if (data.status === ArticleStatus.PUBLISHED && !existing.publishedAt) {
      updatePayload.publishedAt = new Date();
    }

    const article = await prisma.article.update({
      where: { id },
      data: updatePayload,
      include: { category: true, tags: { include: { tag: true } } },
    });

    await cache.del(cacheKeys.article(article.slug));
    await cache.delPattern("articles:*");
    return article;
  }

  /**
   * Delete article
   */
  static async deleteArticle(id: string, user: { id: string; role: string }) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Article not found");

    if (!["ADMIN", "SUPERADMIN"].includes(user.role) && existing.authorId !== user.id) {
      throw new ForbiddenError("You do not have permission to delete this article.");
    }

    await prisma.article.delete({ where: { id } });
    await cache.del(cacheKeys.article(existing.slug));
    await cache.delPattern("articles:*");
  }
}
