// =============================================================================
// Articles Service — Server-Side Database Logic for Next.js App Router
// =============================================================================

import { prisma } from "../prisma";
import { ArticleStatus } from "@prisma/client";

export interface ArticleQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
}

export async function getPublicArticles(params: ArticleQueryParams = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
  const skip = (page - 1) * limit;

  const where: any = {
    status: ArticleStatus.PUBLISHED,
  };

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (params.tag) {
    where.tags = { some: { tag: { slug: params.tag } } };
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { summary: { contains: params.search } },
      { body: { contains: params.search } },
    ];
  }

  try {
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          category: { select: { id: true, name: true, nameHi: true, slug: true, color: true } },
          author: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return { articles, total, page, limit };
  } catch (error) {
    console.warn("Database fetch error, using empty set:", error);
    return { articles: [], total: 0, page, limit };
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, nameHi: true, slug: true, color: true } },
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    if (article) {
      // Async increment view count
      prisma.article.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => {});
    }

    return article;
  } catch (error) {
    console.warn("Error fetching article by slug:", error);
    return null;
  }
}

export async function deleteArticleByIdOrSlug(idOrSlug: string) {
  try {
    await prisma.article.deleteMany({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
    });
    return true;
  } catch (error) {
    console.warn("Error deleting article from database:", error);
    return false;
  }
}
