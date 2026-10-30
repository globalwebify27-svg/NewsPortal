// =============================================================================
// Articles Service — Server-Side Database Logic with MySQL Prisma & Speed Optimization
// Next.js App Router • Strict Editorial Role Approval System
// =============================================================================

import { prisma } from "../prisma";
import { generateArticleSlug, normalizeSlugDateToYyMmDd, findDefaultArticle } from "../defaultArticles";
import { INDIAN_STATES } from "../states";
import { serverCache, TTL } from "../cache";

export type WorkflowArticleStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "PUBLISHED" | "REJECTED";

export interface ArticleQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  subCategory?: string;
  tag?: string;
  search?: string;
  status?: string;
  role?: string;
  authorId?: string;
  state?: string;
  district?: string;
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
  state: true,
  district: true,
  subCategory: true,
  categories: true,
  adTitle: true,
  adSubtitle: true,
  adLink: true,
  adImage: true,
  adBadge: true,
  customAds: true,
  category: { select: { id: true, name: true, nameHi: true, slug: true, color: true } },
  author: { select: { id: true, name: true, avatar: true } },
};

// Full select fields for Admin Control Center (includes body and SEO fields so editing works seamlessly)
const ARTICLE_ADMIN_SELECT = {
  ...ARTICLE_LIST_SELECT,
  body: true,
  bodyHi: true,
  seoTitle: true,
  seoDesc: true,
  seoKeywords: true,
  canonicalUrl: true,
  submittedAt: true,
  approvedBy: true,
  approvedAt: true,
  rejectedBy: true,
  rejectedAt: true,
  rejectionReason: true,
};

function parseCategories(raw: unknown, fallbackCat?: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(String);
    } catch (e) {
      if (raw.includes(",")) return raw.split(",").map((c: string) => c.trim()).filter(Boolean);
      return [raw.trim()];
    }
  }
  const catName = (typeof fallbackCat === "object" && fallbackCat !== null && "name" in fallbackCat)
    ? String((fallbackCat as { name?: unknown }).name)
    : (typeof fallbackCat === "string" ? fallbackCat : null);
  return catName ? [catName] : ["Top News"];
}

import fs from "fs";
import path from "path";

const ARTICLES_SNAPSHOT_FILE = path.join(process.cwd(), "articles_db.json");

function getDiskArticles(): any[] {
  try {
    if (fs.existsSync(ARTICLES_SNAPSHOT_FILE)) {
      const content = fs.readFileSync(ARTICLES_SNAPSHOT_FILE, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return [];
}

function saveDiskArticles(newArticles: any[]): void {
  try {
    if (!Array.isArray(newArticles) || newArticles.length === 0) return;
    const existing = getDiskArticles();
    const map = new Map<string, any>();
    for (const art of existing) {
      const key = art?.id || art?.slug;
      if (key) map.set(key, art);
    }
    for (const art of newArticles) {
      const key = art?.id || art?.slug;
      if (key) {
        const prev = map.get(key) || {};
        map.set(key, { ...prev, ...art });
      }
    }
    const merged = Array.from(map.values())
      .sort((a, b) => new Date(b.createdAt || b.publishedAt || 0).getTime() - new Date(a.createdAt || a.publishedAt || 0).getTime())
      .slice(0, 500);

    fs.writeFileSync(ARTICLES_SNAPSHOT_FILE, JSON.stringify(merged, null, 2), "utf8");
  } catch (_) {}
}

function saveSingleDiskArticle(article: any): void {
  if (article && (article.id || article.slug)) {
    saveDiskArticles([article]);
  }
}

function deleteDiskArticle(idOrSlug: string, altId?: string): boolean {
  try {
    if (!fs.existsSync(ARTICLES_SNAPSHOT_FILE)) return false;
    const content = fs.readFileSync(ARTICLES_SNAPSHOT_FILE, "utf8");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed) || parsed.length === 0) return false;

    const targets = [idOrSlug, altId]
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .map((s) => s.trim().toLowerCase());

    if (targets.length === 0) return false;

    const initialLen = parsed.length;
    const filtered = parsed.filter((art: any) => {
      const artId = (art?.id ? String(art.id) : "").trim().toLowerCase();
      const artSlug = (art?.slug ? String(art.slug) : "").trim().toLowerCase();
      return !targets.includes(artId) && !targets.includes(artSlug);
    });

    if (filtered.length !== initialLen) {
      fs.writeFileSync(ARTICLES_SNAPSHOT_FILE, JSON.stringify(filtered, null, 2), "utf8");
      return true;
    }
  } catch (err) {
    console.error("Error removing article from disk snapshot:", err);
  }
  return false;
}


/**
 * Get Public Articles — Strictly Returns Status: "PUBLISHED" directly from MySQL DB
 * Speed Optimized: Uses lightweight select projection to avoid transferring heavy body HTML payload over network.
 */
export async function getPublicArticles(params: ArticleQueryParams = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
  const skip = (page - 1) * limit;

  // Build a stable cache key from all query params
  const cacheKey = `articles:public:${JSON.stringify({ page, limit, ...params })}`;
  const cached = serverCache.get<{ articles: any[]; total: number; page: number; limit: number }>(cacheKey);
  if (cached) return cached;

  try {
    const where: any = {
      status: "PUBLISHED",
    };

    if (params.category) {
      const catVal = params.category.trim();
      where.OR = [
        { category: { slug: catVal } },
        { category: { name: { contains: catVal } } },
        { categories: { contains: catVal } },
      ];
    }

    if (params.state && params.state !== "ALL" && params.state !== "all") {
      const stVal = params.state.trim().toLowerCase();
      const stateObj = INDIAN_STATES.find(
        (s) => s.code.toLowerCase() === stVal || s.slug.toLowerCase() === stVal || s.nameEn.toLowerCase() === stVal
      );
      const terms = stateObj
        ? [stateObj.nameEn, stateObj.code, stateObj.nameHi, stateObj.slug, "National", "All"]
        : [params.state, "National", "All"];

      where.OR = (where.OR || []).concat(
        terms.map((term) => ({ state: { contains: term } }))
      );
    }

    if (params.district && params.district !== "ALL" && params.district !== "all") {
      where.district = { contains: params.district.trim() };
    }

    if (params.search) {
      where.OR = (where.OR || []).concat([
        { title: { contains: params.search } },
        { summary: { contains: params.search } },
      ]);
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        select: ARTICLE_LIST_SELECT,
      }),
      prisma.article.count({ where }),
    ]);

    const mapped = articles.map((art) => ({
      ...art,
      categories: parseCategories(art.categories, art.category),
      isHero: !!art.isFeatured,
      status: (art.status || "PUBLISHED") as WorkflowArticleStatus
    }));

    if (mapped.length > 0) {
      saveDiskArticles(mapped);
    }

    const result = { articles: mapped, total, page, limit };
    serverCache.set(cacheKey, result, TTL.ARTICLES_LIST);
    return result;
  } catch (error) {
    console.error("Error fetching public articles from MySQL DB:", error);
    const fallback = serverCache.getStale<{ articles: any[]; total: number; page: number; limit: number }>(cacheKey);
    if (fallback && fallback.articles?.length > 0) return fallback;

    const diskArticles = getDiskArticles();
    if (diskArticles.length > 0) {
      let filtered = diskArticles;
      if (params.category) {
        const catVal = params.category.toLowerCase().trim();
        filtered = filtered.filter((a) => {
          const cSlug = (a.category?.slug || a.category?.name || "").toLowerCase();
          const cMulti = Array.isArray(a.categories) ? a.categories.map((c: string) => c.toLowerCase()) : [];
          return cSlug.includes(catVal) || catVal.includes(cSlug) || cMulti.some((c: string) => c.includes(catVal));
        });
      }
      if (params.state && params.state !== "ALL" && params.state !== "all") {
        const stVal = params.state.toLowerCase().trim();
        filtered = filtered.filter((a) => (a.state || "").toLowerCase().includes(stVal) || stVal.includes((a.state || "").toLowerCase()));
      }
      if (params.district && params.district !== "ALL" && params.district !== "all") {
        const distVal = params.district.toLowerCase().trim();
        filtered = filtered.filter((a) => (a.district || "").toLowerCase().includes(distVal) || distVal.includes((a.district || "").toLowerCase()));
      }
      if (params.search) {
        const q = params.search.toLowerCase().trim();
        filtered = filtered.filter((a) => (a.title || "").toLowerCase().includes(q) || (a.summary || "").toLowerCase().includes(q));
      }
      return { articles: filtered.slice(skip, skip + limit), total: filtered.length, page, limit };
    }
    return { articles: [], total: 0, page, limit };
  }
}

/**
 * Get All Articles for Admin Control Center directly from MySQL DB
 */
export async function getAllArticlesForAdmin(params: ArticleQueryParams = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(10000, Math.max(1, Number(params.limit) || 1000));
  const skip = (page - 1) * limit;

  const cacheKey = `articles:admin:${page}:${limit}:${params.status || "ALL"}:${params.authorId || ""}:${params.search || ""}`;
  const cached = serverCache.get<{ articles: any[]; total: number; page: number; limit: number }>(cacheKey);
  if (cached) return cached;

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
        { summary: { contains: params.search } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        select: ARTICLE_ADMIN_SELECT,
      }),
      prisma.article.count({ where })
    ]);

    const mapped = articles.map((art: any) => ({
      ...art,
      categories: parseCategories(art.categories, art.category),
      seoDescription: art.seoDesc || art.seoDescription || art.summary || "",
      isHero: !!art.isFeatured,
      status: (art.status || "PUBLISHED") as WorkflowArticleStatus
    }));

    const result = { articles: mapped, total, page, limit };
    serverCache.set(cacheKey, result, 20_000); // 20s TTL for admin
    return result;
  } catch (e) {
    console.error("Error fetching admin articles from MySQL DB:", e);
    const fallback = serverCache.getStale<{ articles: any[]; total: number; page: number; limit: number }>(cacheKey);
    if (fallback) return fallback;
    const diskArticles = getDiskArticles();
    if (diskArticles.length > 0) {
      return { articles: diskArticles.slice(skip, skip + limit), total: diskArticles.length, page, limit };
    }
    return { articles: [], total: 0, page: 1, limit: 50 };
  }
}

/**
 * Get Article by Slug or ID directly from MySQL DB (Full details including body)
 */
export async function getArticleBySlug(slug: string) {
  const targetSlug = decodeURIComponent(slug).trim().toLowerCase();

  // 1. Serve from memory cache if available (TTL: 10 min)
  const cacheKey = `articles:slug:${targetSlug}`;
  const cached = serverCache.get<any>(cacheKey);
  if (cached) return cached;

  let article: any = null;
  const cleanTargetSlug = targetSlug.includes("/") ? targetSlug.split("/").pop() || targetSlug : targetSlug;
  const normalizedSlug = normalizeSlugDateToYyMmDd(cleanTargetSlug);

  try {
    // 2. Query MySQL DB
    article = await prisma.article.findFirst({
      where: {
        OR: [{ slug: targetSlug }, { id: targetSlug }, { slug: cleanTargetSlug }, { id: cleanTargetSlug }],
      },
      include: {
        category: { select: { id: true, name: true, nameHi: true, slug: true, color: true } },
        author: { select: { id: true, name: true, avatar: true, bio: true } },
      },
    });

    if (!article && normalizedSlug !== cleanTargetSlug) {
      article = await prisma.article.findFirst({
        where: {
          OR: [{ slug: normalizedSlug }, { id: normalizedSlug }],
        },
        include: {
          category: { select: { id: true, name: true, nameHi: true, slug: true, color: true } },
          author: { select: { id: true, name: true, avatar: true, bio: true } },
        },
      });
    }

    // 3. Fall back to ID suffix matching or partial slug matching
    if (!article) {
      const parts = cleanTargetSlug.split("-");
      const possibleId = parts[parts.length - 1];
      if (possibleId && possibleId.length >= 3) {
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
  } catch (error) {
    console.warn("DB fetch error in getArticleBySlug (will fallback to cache/disk):", error);
  }

  // If found in MySQL, format, persist to disk snapshot and cache in memory
  if (article) {
    let customAdsArray: any[] = [];
    if (article.customAds && typeof article.customAds === "string") {
      try {
        customAdsArray = JSON.parse(article.customAds);
      } catch (e) {}
    } else if (Array.isArray(article.customAds)) {
      customAdsArray = article.customAds;
    }

    const rawAuthorName = article.author?.name;
    const submittedByName = (article as any).submittedBy;
    const authorName = (rawAuthorName && rawAuthorName !== "Global Awaaz Admin" && rawAuthorName !== "Global Admin")
      ? rawAuthorName
      : (submittedByName || rawAuthorName || "Global Awaaz Admin");

    const result = {
      ...article,
      categories: parseCategories((article as any).categories, article.category),
      customAds: customAdsArray.length > 0 ? customAdsArray : (article.customAds || undefined),
      author: {
        ...article.author,
        name: authorName,
        bio: article.author?.bio || (authorName === "Global Awaaz Admin" ? "Chief Editor & Administrator at Global Awaaz." : "Editor & Correspondent at Global Awaaz")
      },
      isHero: !!article.isFeatured
    };

    saveSingleDiskArticle(result);
    serverCache.set(cacheKey, result, TTL.ARTICLE_DETAIL);
    return result;
  }

  // 4. Fallback 1: Stale memory cache
  const fallback = serverCache.getStale<any>(cacheKey);
  if (fallback) return fallback;

  // 5. Fallback 2: Disk snapshot search
  const diskArticles = getDiskArticles();
  const parts = cleanTargetSlug.split("-");
  const possibleId = parts[parts.length - 1];

  const diskMatch = diskArticles.find(
    (a) =>
      (a.slug && a.slug.toLowerCase() === targetSlug) ||
      (a.id && a.id.toLowerCase() === targetSlug) ||
      (a.slug && a.slug.toLowerCase() === cleanTargetSlug) ||
      (a.slug && a.slug.toLowerCase() === normalizedSlug) ||
      (possibleId && possibleId.length >= 3 && a.slug && a.slug.toLowerCase().includes(possibleId.toLowerCase())) ||
      (possibleId && possibleId.length >= 3 && a.id && a.id.toLowerCase().includes(possibleId.toLowerCase())) ||
      (targetSlug.includes(a.slug || "") && a.slug)
  );

  if (diskMatch) {
    serverCache.set(cacheKey, diskMatch, TTL.ARTICLE_DETAIL);
    return diskMatch;
  }

  // 6. Fallback 3: Built-in default articles
  const defaultFound = findDefaultArticle(targetSlug) || findDefaultArticle(cleanTargetSlug);
  if (defaultFound) {
    serverCache.set(cacheKey, defaultFound, TTL.ARTICLE_DETAIL);
    return defaultFound;
  }

  return null;
}

/**
 * Delete Article by ID or Slug directly from MySQL DB and Disk Cache
 */
export async function deleteArticleByIdOrSlug(idOrSlug: string, altId?: string) {
  let dbDeleted = false;
  try {
    const rawTarget = decodeURIComponent(idOrSlug).trim();
    const rawAlt = altId ? decodeURIComponent(altId).trim() : "";

    const orConditions: any[] = [
      { id: rawTarget },
      { slug: rawTarget },
      { slug: rawTarget.toLowerCase() },
    ];
    if (rawAlt) {
      orConditions.push({ id: rawAlt });
      orConditions.push({ slug: rawAlt });
      orConditions.push({ slug: rawAlt.toLowerCase() });
    }

    const res = await prisma.article.deleteMany({
      where: {
        OR: orConditions,
      },
    });
    if (res.count > 0) {
      dbDeleted = true;
    }
  } catch (error) {
    console.error("Error deleting article from MySQL DB:", error);
  }

  // Also purge from disk snapshot file (articles_db.json)
  const diskDeleted = deleteDiskArticle(idOrSlug, altId);

  // Invalidate all article and sitemap caches after deletion
  serverCache.invalidatePrefix("articles:");
  serverCache.invalidatePrefix("sitemap:");

  return dbDeleted || diskDeleted;
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

    // Ensure clean English slug with YY-MM-DD date suffix
    let slug = data.slug;
    if (!slug || /[\u0900-\u097F]/.test(slug)) {
      slug = await generateArticleSlug(data.title || "News Story", data.id, now.toISOString());
    }
    slug = normalizeSlugDateToYyMmDd(slug);

    // Category Resolution with in-memory caching to avoid N+1 DB lookups
    let catId: string | null = data.categoryId || null;
    const catSearchKey = catId || (typeof data.category === "string" ? data.category : data.category?.slug || data.category?.name);
    const cachedCatId = catSearchKey ? serverCache.get<string>(`cat:res:${catSearchKey.toLowerCase()}`) : null;

    if (cachedCatId) {
      catId = cachedCatId;
    } else if (catId) {
      const existingCat = await prisma.category.findFirst({
        where: { OR: [{ id: catId }, { name: catId }, { slug: catId.toLowerCase() }] },
        select: { id: true },
      });
      if (existingCat) {
        catId = existingCat.id;
        serverCache.set(`cat:res:${catSearchKey!.toLowerCase()}`, catId, TTL.CATEGORIES);
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
        create: { name: catName, slug: catSlug, color: (typeof data.category === "object" && data.category.color) || "#e50914" },
        select: { id: true },
      });
      catId = cat.id;
      if (catSearchKey) {
        serverCache.set(`cat:res:${catSearchKey.toLowerCase()}`, catId, TTL.CATEGORIES);
      }
    }

    if (!catId) {
      const defaultCat = await prisma.category.findFirst({ select: { id: true } });
      if (defaultCat) {
        catId = defaultCat.id;
      } else {
        const createdCat = await prisma.category.create({
          data: { name: "General", slug: "general", color: "#e50914" },
          select: { id: true },
        });
        catId = createdCat.id;
      }
    }

    // Author Resolution with in-memory caching to avoid N+1 user queries
    const targetAuthorName = (typeof data.author === "object" && data.author?.name)
      ? data.author.name
      : (data.authorId || data.submittedBy || data.userName || "Global Awaaz Staff");

    const authorCacheKey = `author:res:${String(targetAuthorName).toLowerCase().trim()}`;
    let authorId: string | null = serverCache.get<string>(authorCacheKey);

    if (!authorId) {
      let validAuthor = await prisma.user.findFirst({
        where: {
          OR: [
            { id: targetAuthorName },
            { name: targetAuthorName },
            { email: targetAuthorName }
          ]
        },
        select: { id: true },
      });

      if (!validAuthor && data.submittedBy) {
        validAuthor = await prisma.user.findFirst({
          where: {
            OR: [
              { name: data.submittedBy },
              { email: data.submittedBy }
            ]
          },
          select: { id: true },
        });
      }

      if (validAuthor) {
        authorId = validAuthor.id;
      } else {
        const createdUser = await prisma.user.create({
          data: {
            name: targetAuthorName,
            email: `${targetAuthorName.toLowerCase().replace(/[^a-z0-9]/g, "") || "editor"}_${Date.now()}@globalawaaz.com`,
            role: "EDITOR"
          },
          select: { id: true },
        });
        authorId = createdUser.id;
      }

      if (authorId) {
        serverCache.set(authorCacheKey, authorId, 300_000); // 5m cache
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
      state: data.state || "National",
      district: data.district || "All",
      subCategory: data.subCategory || (typeof data.category === "object" ? data.category?.subCategory : null) || "General",
      categories: data.categories
        ? (typeof data.categories === "string" ? data.categories : JSON.stringify(Array.isArray(data.categories) ? data.categories : [data.categories]))
        : null,
      adTitle: data.adTitle || null,
      adSubtitle: data.adSubtitle || null,
      adLink: data.adLink || null,
      adImage: data.adImage || null,
      adBadge: data.adBadge || "SPONSORED",
      customAds: data.customAds ? (typeof data.customAds === "string" ? data.customAds : JSON.stringify(data.customAds)) : null,
      seoTitle: data.seoTitle || null,
      seoDesc: data.seoDescription || data.seoDesc || null,
      seoKeywords: data.seoKeywords || null,
      canonicalUrl: data.canonicalUrl || null,
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

    // Invalidate all article list and sitemap caches so next request gets fresh data
    serverCache.invalidatePrefix("articles:");
    serverCache.invalidatePrefix("sitemap:");
    return articleRecord;
  } catch (error: any) {
    console.error("Error creating/updating article in MySQL DB:", error);
    return null;
  }
}
