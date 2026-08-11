// =============================================================================
// Articles Service — Server-Side Database Logic with MySQL Prisma & Speed Optimization
// Next.js App Router • Strict Editorial Role Approval System
// =============================================================================

import { prisma } from "../prisma";
import { generateArticleSlug } from "../defaultArticles";

export type WorkflowArticleStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "PUBLISHED" | "REJECTED";

export interface ArticleQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  status?: string;
  role?: string;
  authorId?: string;
}

// Optimized select fields for fast list queries (omits heavy longtext body)
const ARTICLE_LIST_SELECT = {
  id: true,
  title: true,
  titleHi: true,
  slug: true,
  summary: true,
  summaryHi: true,
  featuredImage: true,
  featuredImageAlt: true,
  status: true,
  isBreaking: true,
  isTrending: true,
  isFeatured: true,
  isEditorsPick: true,
  readTime: true,
  views: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, nameHi: true, slug: true, color: true } },
  author: { select: { id: true, name: true, avatar: true } },
};

/**
 * Get Public Articles — Strictly Returns Status: "PUBLISHED" directly from MySQL DB
 * Speed Optimized: Uses lightweight select projection to avoid transferring heavy body HTML payload over network.
 */
export async function getPublicArticles(params: ArticleQueryParams = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      status: "PUBLISHED",
    };

    if (params.category) {
      where.category = { slug: params.category };
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },
        { summary: { contains: params.search } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
        select: ARTICLE_LIST_SELECT,
      }),
      prisma.article.count({ where }),
    ]);

    const mapped = articles.map((art) => ({
      ...art,
      isHero: !!art.isFeatured,
      status: (art.status || "PUBLISHED") as WorkflowArticleStatus
    }));

    return { articles: mapped, total, page, limit };
  } catch (error) {
    console.error("Error fetching public articles from MySQL DB:", error);
    return { articles: [], total: 0, page, limit };
  }
}

/**
 * Get All Articles for Admin Control Center directly from MySQL DB
 */
export async function getAllArticlesForAdmin(params: ArticleQueryParams = {}) {
  try {
    const where: any = {};

    if (params.status && params.status.toUpperCase() !== "ALL") {
      where.status = params.status.toUpperCase();
    }

    if (params.authorId) {
      where.OR = [
        { authorId: params.authorId },
        { author: { name: { contains: params.authorId } } }
      ];
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },
        { summary: { contains: params.search } }
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        select: ARTICLE_LIST_SELECT,
      }),
      prisma.article.count({ where })
    ]);

    return { articles, total };
  } catch (e) {
    console.error("Error fetching admin articles from MySQL DB:", e);
    return { articles: [], total: 0 };
  }
}

/**
 * Get Article by Slug or ID directly from MySQL DB (Full details including body)
 */
export async function getArticleBySlug(slug: string) {
  const targetSlug = decodeURIComponent(slug).trim().toLowerCase();

  try {
    let article = await prisma.article.findFirst({
      where: {
        OR: [{ slug: targetSlug }, { id: targetSlug }],
      },
      include: {
        category: { select: { id: true, name: true, nameHi: true, slug: true, color: true } },
        author: { select: { id: true, name: true, avatar: true, bio: true } },
      },
    });

    if (!article) {
      const parts = targetSlug.split("-");
      const possibleId = parts[parts.length - 1];
      if (possibleId && possibleId.length >= 2) {
        article = await prisma.article.findFirst({
          where: {
            OR: [{ id: possibleId }, { id: { endsWith: possibleId } }, { slug: { contains: possibleId } }],
          },
          include: {
            category: { select: { id: true, name: true, nameHi: true, slug: true, color: true } },
            author: { select: { id: true, name: true, avatar: true, bio: true } },
          },
        });
      }
    }

    return article ? { ...article, isHero: !!article.isFeatured } : null;
  } catch (error) {
    console.error("Error fetching article by slug from MySQL DB:", error);
    return null;
  }
}

/**
 * Delete Article by ID or Slug directly from MySQL DB
 */
export async function deleteArticleByIdOrSlug(idOrSlug: string) {
  try {
    await prisma.article.deleteMany({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting article from MySQL DB:", error);
    return false;
  }
}

/**
 * Create or Update Article directly in MySQL DB with Editorial Workflow Rules
 */
export async function createOrUpdateArticle(data: any) {
  try {
    const role = (data.userRole || data.role || "super_admin").toLowerCase();
    const isEditorRole = (role === "editor" || role.includes("staff")) && !role.includes("super") && !role.includes("admin") && !role.includes("chief");

    const now = new Date();
    let requestedStatus: WorkflowArticleStatus = (data.status || "PUBLISHED").toUpperCase() as WorkflowArticleStatus;

    if (isEditorRole) {
      if (requestedStatus === "PUBLISHED" || requestedStatus === "APPROVED" || requestedStatus === "PENDING_REVIEW") {
        requestedStatus = "PENDING_REVIEW";
      } else {
        requestedStatus = "DRAFT";
      }
    }

    // Ensure clean English slug
    let slug = data.slug;
    if (!slug || /[\u0900-\u097F]/.test(slug)) {
      slug = await generateArticleSlug(data.title || "News Story", data.id, now.toISOString());
    }

    // Category Resolution: check by ID first, then by name or slug
    let catId: string | null = data.categoryId || null;
    if (catId) {
      const existingCat = await prisma.category.findFirst({
        where: { OR: [{ id: catId }, { name: catId }, { slug: catId.toLowerCase() }] }
      });
      if (existingCat) {
        catId = existingCat.id;
      } else {
        catId = null;
      }
    }

    if (!catId && data.category) {
      const catName = typeof data.category === "string" ? data.category : data.category.name || "General";
      const catSlug = (typeof data.category === "object" && data.category.slug) 
        ? data.category.slug 
        : catName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      
      const cat = await prisma.category.upsert({
        where: { slug: catSlug },
        update: { name: catName },
        create: { name: catName, slug: catSlug, color: (typeof data.category === "object" && data.category.color) || "#e50914" }
      });
      catId = cat.id;
    }

    if (!catId) {
      const defaultCat = await prisma.category.findFirst();
      if (defaultCat) {
        catId = defaultCat.id;
      } else {
        const createdCat = await prisma.category.create({
          data: { name: "General", slug: "general", color: "#e50914" }
        });
        catId = createdCat.id;
      }
    }

    // Author Resolution: convert authorId (if string name like "Global Admin") to valid User DB ID
    let authorId: string | null = data.authorId || null;
    let validAuthor = null;

    if (authorId) {
      validAuthor = await prisma.user.findFirst({
        where: { OR: [{ id: authorId }, { name: authorId }, { email: authorId }] }
      });
    }

    if (!validAuthor && data.userName) {
      validAuthor = await prisma.user.findFirst({
        where: { OR: [{ name: data.userName }, { email: data.userName }] }
      });
    }

    if (validAuthor) {
      authorId = validAuthor.id;
    } else {
      const defaultUser = await prisma.user.findFirst({
        where: { role: { in: ["SUPERADMIN", "ADMIN"] } }
      }) || await prisma.user.findFirst();

      if (defaultUser) {
        authorId = defaultUser.id;
      } else {
        const createdUser = await prisma.user.create({
          data: {
            name: data.userName || "Global Admin",
            email: `admin_${Date.now()}@globalawaaz.com`,
            role: "SUPERADMIN"
          }
        });
        authorId = createdUser.id;
      }
    }

    const payload = {
      title: data.title,
      slug: slug,
      summary: data.summary || "",
      body: data.body || data.title,
      featuredImage: data.featuredImage || data.image || "",
      status: requestedStatus as any,
      isFeatured: !!data.isHero || !!data.isFeatured,
      isBreaking: !!data.isBreaking,
      isTrending: !!data.isTrending,
      publishedAt: requestedStatus === "PUBLISHED" ? (data.publishedAt ? new Date(data.publishedAt) : now) : null,
      categoryId: catId,
      authorId: authorId,
    };

    let articleRecord;
    const isTempId = !data.id || (typeof data.id === "string" && data.id.startsWith("art_"));

    if (data.id && !isTempId) {
      articleRecord = await prisma.article.upsert({
        where: { id: data.id },
        update: payload,
        create: { id: data.id, ...payload },
        include: { category: true, author: true }
      });
    } else {
      articleRecord = await prisma.article.upsert({
        where: { slug: slug },
        update: payload,
        create: payload,
        include: { category: true, author: true }
      });
    }

    return articleRecord;
  } catch (error: any) {
    console.error("Error creating/updating article in MySQL DB:", error);
    return null;
  }
}
