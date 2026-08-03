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

export async function createOrUpdateArticle(data: any) {
  try {
    let catId = data.categoryId;
    if (!catId && data.category?.name) {
      const catSlug = data.category.slug || data.category.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const cat = await prisma.category.upsert({
        where: { slug: catSlug },
        update: { name: data.category.name },
        create: {
          name: data.category.name,
          slug: catSlug,
          color: data.category.color || "#e50914",
        },
      });
      catId = cat.id;
    }

    let authorId = data.authorId;
    if (!authorId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) {
        authorId = defaultUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            name: data.author?.name || "Global Admin",
            email: "admin@globalawaaz.com",
            password: "$2a$10$abcdefghijklmnopqrstuv",
            role: "SUPERADMIN",
          },
        });
        authorId = newUser.id;
      }
    }

    const slug = data.slug || `story-${Date.now()}`;
    const article = await prisma.article.upsert({
      where: { slug },
      update: {
        title: data.title,
        summary: data.summary,
        body: data.body,
        featuredImage: data.featuredImage,
        status: data.status === "DRAFT" ? ArticleStatus.DRAFT : ArticleStatus.PUBLISHED,
        isFeatured: !!data.isHero,
        publishedAt: new Date(),
      },
      create: {
        title: data.title,
        slug,
        summary: data.summary,
        body: data.body || data.title,
        featuredImage: data.featuredImage || "",
        status: data.status === "DRAFT" ? ArticleStatus.DRAFT : ArticleStatus.PUBLISHED,
        isFeatured: !!data.isHero,
        publishedAt: new Date(),
        categoryId: catId,
        authorId: authorId,
      },
      include: {
        category: true,
        author: true,
      },
    });

    return article;
  } catch (error) {
    console.error("Error creating/updating article in database:", error);
    return null;
  }
}
