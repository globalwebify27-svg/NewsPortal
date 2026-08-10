// =============================================================================
// Articles Service — Server-Side Database Logic with Persistent File DB Fallback
// Next.js App Router • Strict Editorial Role Approval System
// =============================================================================

import { prisma } from "../prisma";
import fs from "fs";
import path from "path";

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

const DB_FILE_PATH = path.join(process.cwd(), "..", "backend", "prisma", "articles_db.json");
const ALT_DB_FILE_PATH = path.join(process.cwd(), "articles_db.json");

function readArticlesFromDisk(): any[] {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {}
  try {
    if (fs.existsSync(ALT_DB_FILE_PATH)) {
      const raw = fs.readFileSync(ALT_DB_FILE_PATH, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {}
  return [];
}

function writeArticlesToDisk(articles: any[]): boolean {
  let written = false;
  try {
    const dir1 = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir1)) {
      fs.mkdirSync(dir1, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(articles, null, 2), "utf-8");
    written = true;
  } catch (e) {}
  try {
    fs.writeFileSync(ALT_DB_FILE_PATH, JSON.stringify(articles, null, 2), "utf-8");
    written = true;
  } catch (e) {}
  return written;
}

/**
 * Get Public Articles — Strictly Returns Status: "PUBLISHED"
 */
export async function getPublicArticles(params: ArticleQueryParams = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
  const skip = (page - 1) * limit;

  // 1. Try Prisma Database
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
        { body: { contains: params.search } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
        include: {
          category: { select: { id: true, name: true, nameHi: true, slug: true, color: true } },
          author: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    if (articles && articles.length > 0) {
      const mapped = articles.map((art) => ({
        ...art,
        isHero: !!art.isFeatured,
        status: (art.status || "PUBLISHED") as WorkflowArticleStatus
      }));
      return { articles: mapped, total, page, limit };
    }
  } catch (error) {
    console.warn("Prisma fetch notice, attempting file database fallback:", error);
  }

  // 2. Persistent File Database Fallback (Strictly Published)
  const disk = readArticlesFromDisk();
  const publishedOnly = disk.filter((a) => (a.status || "PUBLISHED").toUpperCase() === "PUBLISHED");

  let filtered = publishedOnly;
  if (params.category) {
    const catSlug = params.category.toLowerCase().trim();
    filtered = filtered.filter((a) => {
      const name = (a.category?.name || a.category || "").toLowerCase();
      const slug = (a.category?.slug || "").toLowerCase();
      return name.includes(catSlug) || slug.includes(catSlug);
    });
  }

  if (params.search) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter((a) => a.title?.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q));
  }

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);

  return { articles: paginated, total, page, limit };
}

/**
 * Get All Articles for Admin Control Center (Including Drafts, Pending Reviews, Approved, Published & Rejected)
 */
export async function getAllArticlesForAdmin(params: ArticleQueryParams = {}) {
  const disk = readArticlesFromDisk();
  let dbList: any[] = [];

  try {
    const dbArticles = await prisma.article.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: true,
        author: true
      }
    });
    if (dbArticles && dbArticles.length > 0) {
      dbList = dbArticles;
    }
  } catch (e) {}

  // Merge disk & db
  const diskMap = new Map(disk.map((a) => [a.id, a]));
  const dbFiltered = dbList.filter((b) => !diskMap.has(b.id));
  let combined = [...disk, ...dbFiltered];

  if (params.status && params.status.toUpperCase() !== "ALL") {
    const targetSt = params.status.toUpperCase();
    combined = combined.filter((a) => (a.status || "PUBLISHED").toUpperCase() === targetSt);
  }

  if (params.authorId) {
    combined = combined.filter((a) => a.authorId === params.authorId || a.author?.name === params.authorId);
  }

  if (params.search) {
    const q = params.search.toLowerCase().trim();
    combined = combined.filter((a) => a.title?.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q));
  }

  return { articles: combined, total: combined.length };
}

/**
 * Get Article by Slug or ID
 */
export async function getArticleBySlug(slug: string) {
  const targetSlug = decodeURIComponent(slug).trim().toLowerCase();

  // Check Disk DB First
  const disk = readArticlesFromDisk();
  const diskFound = disk.find((a) => {
    const aSlug = (a.slug || "").trim().toLowerCase();
    const aId = (a.id || "").trim().toLowerCase();
    return aSlug === targetSlug || aId === targetSlug || targetSlug.endsWith(aId);
  });

  if (diskFound) {
    return diskFound;
  }

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
    return null;
  }
}

/**
 * Delete Article by ID or Slug
 */
export async function deleteArticleByIdOrSlug(idOrSlug: string) {
  const disk = readArticlesFromDisk();
  const filteredDisk = disk.filter((a) => a.id !== idOrSlug && a.slug !== idOrSlug);
  writeArticlesToDisk(filteredDisk);

  try {
    await prisma.article.deleteMany({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });
  } catch (error) {}

  return true;
}

/**
 * Create or Update Article with Enforced Editorial Workflow Rules
 */
export async function createOrUpdateArticle(data: any) {
  try {
    const role = (data.userRole || data.role || "editor").toLowerCase();
    const isEditorRole = role === "editor" || role.includes("staff");
    const isChiefOrSuperAdmin = role.includes("chief") || role.includes("super") || role.includes("admin");

    const nowIso = new Date().toISOString();
    let requestedStatus: WorkflowArticleStatus = (data.status || "DRAFT").toUpperCase() as WorkflowArticleStatus;

    // RULE ENFORCEMENT: Editor cannot publish directly!
    if (isEditorRole) {
      if (requestedStatus === "PUBLISHED" || requestedStatus === "APPROVED" || requestedStatus === "PENDING_REVIEW") {
        requestedStatus = "PENDING_REVIEW";
      } else {
        requestedStatus = "DRAFT";
      }
    }

    const disk = readArticlesFromDisk();
    const slug = data.slug || `story-${Date.now()}`;
    const existingIndex = disk.findIndex((a) => a.id === data.id || a.slug === slug);
    const existing = existingIndex >= 0 ? disk[existingIndex] : null;

    let submittedAt = existing?.submittedAt || data.submittedAt;
    if (requestedStatus === "PENDING_REVIEW" && !submittedAt) {
      submittedAt = nowIso;
    }

    let approvedBy = existing?.approvedBy || data.approvedBy;
    let approvedAt = existing?.approvedAt || data.approvedAt;
    let rejectedBy = existing?.rejectedBy || data.rejectedBy;
    let rejectedAt = existing?.rejectedAt || data.rejectedAt;
    let rejectionReason = existing?.rejectionReason || data.rejectionReason;

    // If approving or publishing
    if ((requestedStatus === "APPROVED" || requestedStatus === "PUBLISHED") && isChiefOrSuperAdmin) {
      approvedBy = data.reviewerName || data.userName || "Chief Editor / Super Admin";
      approvedAt = nowIso;
      rejectedBy = undefined;
      rejectedAt = undefined;
      rejectionReason = undefined;
    }

    // If rejecting
    if (requestedStatus === "REJECTED" && isChiefOrSuperAdmin) {
      rejectedBy = data.reviewerName || data.userName || "Chief Editor / Super Admin";
      rejectedAt = nowIso;
      rejectionReason = data.rejectionReason || data.reviewComment || "Revision requested by Editorial Team.";
      approvedBy = undefined;
      approvedAt = undefined;
    }

    const articleRecord = {
      id: data.id || existing?.id || `art-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: data.title,
      slug,
      summary: data.summary || "",
      body: data.body || data.title,
      featuredImage: data.featuredImage || existing?.featuredImage || "",
      status: requestedStatus,
      authorId: data.authorId || data.userName || existing?.authorId || "Global Admin",
      submittedAt: submittedAt || null,
      approvedBy: approvedBy || null,
      approvedAt: approvedAt || null,
      rejectedBy: rejectedBy || null,
      rejectedAt: rejectedAt || null,
      rejectionReason: rejectionReason || null,
      isHero: !!data.isHero,
      isFeatured: !!data.isHero,
      isBreaking: !!data.isBreaking,
      isTrending: !!data.isTrending,
      publishedAt: requestedStatus === "PUBLISHED" ? (existing?.publishedAt || nowIso) : (existing?.publishedAt || null),
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
      category: data.category || existing?.category || { name: "General", slug: "general", color: "#e50914" },
      author: data.author || existing?.author || { name: data.userName || "Global Admin" }
    };

    if (existingIndex >= 0) {
      disk[existingIndex] = articleRecord;
    } else {
      disk.unshift(articleRecord);
    }
    writeArticlesToDisk(disk);

    // Sync to Prisma DB if accessible
    try {
      let catId = data.categoryId;
      if (!catId && articleRecord.category?.name) {
        const catSlug = articleRecord.category.slug || articleRecord.category.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const cat = await prisma.category.upsert({
          where: { slug: catSlug },
          update: { name: articleRecord.category.name },
          create: { name: articleRecord.category.name, slug: catSlug, color: articleRecord.category.color || "#e50914" }
        });
        catId = cat.id;
      }

      let authorId = data.authorId;
      if (!authorId) {
        const defaultUser = await prisma.user.findFirst();
        if (defaultUser) authorId = defaultUser.id;
      }

      await prisma.article.upsert({
        where: { slug: articleRecord.slug },
        update: {
          title: articleRecord.title,
          summary: articleRecord.summary,
          body: articleRecord.body,
          featuredImage: articleRecord.featuredImage,
          status: articleRecord.status as any,
          submittedAt: articleRecord.submittedAt ? new Date(articleRecord.submittedAt) : null,
          approvedBy: articleRecord.approvedBy,
          approvedAt: articleRecord.approvedAt ? new Date(articleRecord.approvedAt) : null,
          rejectedBy: articleRecord.rejectedBy,
          rejectedAt: articleRecord.rejectedAt ? new Date(articleRecord.rejectedAt) : null,
          rejectionReason: articleRecord.rejectionReason,
          isFeatured: articleRecord.isHero,
          publishedAt: articleRecord.publishedAt ? new Date(articleRecord.publishedAt) : null
        } as any,
        create: {
          title: articleRecord.title,
          slug: articleRecord.slug,
          summary: articleRecord.summary,
          body: articleRecord.body,
          featuredImage: articleRecord.featuredImage,
          status: articleRecord.status as any,
          submittedAt: articleRecord.submittedAt ? new Date(articleRecord.submittedAt) : null,
          approvedBy: articleRecord.approvedBy,
          approvedAt: articleRecord.approvedAt ? new Date(articleRecord.approvedAt) : null,
          rejectedBy: articleRecord.rejectedBy,
          rejectedAt: articleRecord.rejectedAt ? new Date(articleRecord.rejectedAt) : null,
          rejectionReason: articleRecord.rejectionReason,
          isFeatured: articleRecord.isHero,
          publishedAt: articleRecord.publishedAt ? new Date(articleRecord.publishedAt) : null,
          categoryId: catId || "cat_gen",
          authorId: authorId || "usr_admin"
        } as any
      });
    } catch (e) {}

    return articleRecord;
  } catch (error: any) {
    console.error("Error in createOrUpdateArticle:", error);
    return null;
  }
}
