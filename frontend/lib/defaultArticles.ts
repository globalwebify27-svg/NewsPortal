/**
 * Default articles registry.
 * Set to empty arrays & strict admin image resolution so the platform strictly displays live database / admin-created content and admin-uploaded photos.
 */

export interface DefaultArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  featuredImage: string;
  category: { name: string; slug: string; color: string };
  author: { name: string; bio?: string };
  readTime: string;
  language: "EN" | "HI";
  createdAt?: string;
  isPinned?: boolean;
  isHero?: boolean;
  isSuperfast?: boolean;
  status?: string;
  views?: number;
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
}

export const defaultEnglishArticles: DefaultArticle[] = [];
export const defaultHindiArticles: DefaultArticle[] = [];

/** All default articles combined */
export const allDefaultArticles: DefaultArticle[] = [];

/** 
 * Format Article Slug with Date (DDMMYY) and Unique ID at the end:
 * Format: {headline-slug}-{DDMMYY}-{uniqueId}
 * Example: breaking-news-story-070826-art101
 */
export function formatArticleSlug(article: any): string {
  if (!article) return "news-070826-000";

  const rawId = (article.id || article.slug || Math.random().toString(36).substring(2, 8)).toString();
  const cleanId = rawId.replace(/[^a-zA-Z0-9]/g, "").slice(-8) || "001";

  const rawDate = article.createdAt || article.publishedAt || new Date().toISOString();
  let dateStr = "070826";
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = String(d.getFullYear()).slice(-2);
      dateStr = `${dd}${mm}${yy}`;
    }
  } catch (e) {}

  let baseTitle = (article.title || article.slug || "news")
    .toString()
    .toLowerCase()
    .replace(/-\d{6}-[a-zA-Z0-9]+$/, "")
    .replace(/-\d{8}-[a-zA-Z0-9]+$/, "")
    .replace(/[^a-zA-Z0-9\u0900-\u097F\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);

  if (!baseTitle) baseTitle = "news";

  return `${baseTitle}-${dateStr}-${cleanId}`;
}

/**
 * Format Full Article Path under category tab:
 * Format: /{tab}/{headline-slug}-{DDMMYY}-{uniqueId}
 * Example: /india/lok-sabha-news-070826-art101
 */
export function getArticleUrl(article: any): string {
  if (!article) return "/article/news-070826-000";
  const catSlug = article.category?.slug
    ? article.category.slug.toLowerCase().trim()
    : "article";
  const slug = formatArticleSlug(article);
  return `/${catSlug}/${slug}`;
}

/** Find a default article by slug or ID */
export function findDefaultArticle(slug: string, lang?: "EN" | "HI"): DefaultArticle | undefined {
  const targetSlug = decodeURIComponent(slug).trim().toLowerCase();
  
  let found = allDefaultArticles.find(
    (a) => a.slug === targetSlug || formatArticleSlug(a) === targetSlug
  );

  if (!found) {
    const parts = targetSlug.split("-");
    const possibleId = parts[parts.length - 1];
    if (possibleId && possibleId.length >= 2) {
      found = allDefaultArticles.find(
        (a) => a.id === possibleId || a.id?.toLowerCase().endsWith(possibleId)
      );
    }
  }

  return found;
}

/** Helper to strip HTML tags for clean plain text display in cards & previews */
export function stripHtml(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** 
 * Strict Admin Image Resolver.
 * Resolves relative /uploads/ paths to full Hostinger storage URL in production and local paths in dev mode.
 */
export function getArticleImage(article: any, index: number = 0): string {
  let img = "";
  if (article?.featuredImage && typeof article.featuredImage === "string" && article.featuredImage.trim().length > 3) {
    img = article.featuredImage.trim();
  } else if (article?.image && typeof article.image === "string" && article.image.trim().length > 3) {
    img = article.image.trim();
  }

  if (!img) return "";

  // Auto-correct missing colon after protocol (e.g. https// -> https://)
  if (img.startsWith("https//")) {
    img = img.replace("https//", "https://");
  } else if (img.startsWith("http//")) {
    img = img.replace("http//", "http://");
  }

  // If full HTTP/HTTPS URL or Data URL, return as-is
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
    return img;
  }

  // Handle relative /uploads/ paths
  if (img.startsWith("/uploads/") || img.startsWith("uploads/")) {
    const cleanPath = img.startsWith("/") ? img : `/${img}`;
    
    // In browser environment, check if we are on localhost vs live production site
    if (typeof window !== "undefined") {
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (isLocalhost) {
        return cleanPath; // Load directly from local dev server /public/uploads/
      }
    }

    const hostingerBase = process.env.NEXT_PUBLIC_HOSTINGER_MEDIA_URL || "https://yellowgreen-rook-384455.hostingersite.com/public";
    return `${hostingerBase}${cleanPath}`;
  }

  return img;
}
