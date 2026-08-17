/**
 * Default articles registry.
 */
import { extractYouTubeId } from "@/lib/youtube";
import { cleanMediaUrl } from "@/lib/mediaUpload";

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

/** No hardcoded articles — all content is managed via Admin Panel and served from the database. */
export const defaultEnglishArticles: DefaultArticle[] = [];

/** No hardcoded articles — all content is managed via Admin Panel and served from the database. */
export const defaultHindiArticles: DefaultArticle[] = [];

/** All default articles combined — empty, DB is the source of truth. */
export const allDefaultArticles: DefaultArticle[] = [];





// =============================================================================
// SLUG UTILITIES — Single Source of Truth
// Always generate slug ONCE at save time. Never re-generate at read time.
// =============================================================================

/**
 * Transliterate Devanagari for extreme offline fallback only.
 * Not used for headline slugs — Google Translate handles that.
 */
export function transliterateDevanagari(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u0900-\u097F]+/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * generateArticleSlug — THE ONLY place slugs are created.
 *
 * Strategy (in order):
 *  1. Google Translate free API  — returns natural grammatical English
 *  2. MyMemory free API          — another free translation service
 *  3. Remove non-latin chars     — keeps any existing English words in title
 *
 * Format returned: {english-headline}-{dd-mm-yy}-{shortId}
 *
 * Call this ONCE at save time. Store the result. Never call again.
 */
export async function generateArticleSlug(
  title: string,
  id?: string,
  dateStr?: string
): Promise<string> {
  const suffix = buildSuffix(id, dateStr);

  // If title is already pure English/Latin — just slugify it directly
  if (!/[\u0900-\u097F]/.test(title)) {
    const base = slugifyText(title);
    return base ? `${base}-${suffix}` : `news-${suffix}`;
  }

  // 1. Google Translate (free, no key required)
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=en&dt=t&q=${encodeURIComponent(title.trim())}`,
      { signal: ctrl.signal }
    );
    clearTimeout(t);
    if (res.ok) {
      const data = await res.json();
      const translated: string = (data?.[0] ?? [])
        .map((x: any) => (Array.isArray(x) ? x[0] ?? "" : ""))
        .join("")
        .trim();
      if (translated && !/[\u0900-\u097F]/.test(translated)) {
        const base = slugifyText(translated);
        if (base.length > 4) return `${base}-${suffix}`;
      }
    }
  } catch (_) {}

  // 2. MyMemory free API
  try {
    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), 3000);
    const res2 = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(title.trim())}&langpair=hi|en`,
      { signal: ctrl2.signal }
    );
    clearTimeout(t2);
    if (res2.ok) {
      const json = await res2.json();
      const translated2: string = json?.responseData?.translatedText ?? "";
      if (translated2 && !/[\u0900-\u097F]/.test(translated2)) {
        const base = slugifyText(translated2);
        if (base.length > 4) return `${base}-${suffix}`;
      }
    }
  } catch (_) {}

  // 3. Last-resort: strip Hindi chars, keep any English words
  const fallback = slugifyText(title.replace(/[\u0900-\u097F]/g, " "));
  return fallback.length > 2 ? `${fallback}-${suffix}` : `news-${suffix}`;
}

/** Build the date+id suffix: {yy-mm-dd}-{shortId} */
function buildSuffix(id?: string, dateIso?: string): string {
  let dd = "13", mm = "08", yy = "26";
  try {
    const d = new Date(dateIso || Date.now());
    if (!isNaN(d.getTime())) {
      dd = String(d.getDate()).padStart(2, "0");
      mm = String(d.getMonth() + 1).padStart(2, "0");
      yy = String(d.getFullYear()).slice(-2);
    }
  } catch (_) {}
  const shortId = id
    ? id.replace(/[^a-zA-Z0-9]/g, "").slice(-8)
    : Math.random().toString(36).substring(2, 8);
  return `${yy}-${mm}-${dd}-${shortId}`;
}

/** Convert any text to lowercase hyphen slug (full title, no truncation) */
function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


/**
 * translateHindiToEnglishSlug — backward compat alias for generateArticleSlug.
 * New code should use generateArticleSlug() directly.
 */
export async function translateHindiToEnglishSlug(text: string): Promise<string> {
  return generateArticleSlug(text);
}

/**
 * Helper to ensure any date suffix in a slug strictly uses YY-MM-DD format (-26-08-13-)
 */
export function normalizeSlugDateToYyMmDd(rawSlug: string): string {
  if (!rawSlug) return rawSlug;
  const s = rawSlug.toLowerCase().trim();

  // Match -DD-MM-YY-hash or -DD-MM-YYYY-hash at the end of the slug
  return s.replace(/-(\d{2})-(\d{2})-(2\d|\d{4})-([a-zA-Z0-9]+)$/, (_match, day, month, yearRaw, hash) => {
    let year = yearRaw;
    if (year.length === 4) year = year.slice(-2);
    const dNum = parseInt(day, 10);
    const yNum = parseInt(year, 10);
    // If first part is day (<= 31) and 3rd part is year (>= 20), swap to YY-MM-DD
    if (dNum <= 31 && yNum >= 20 && yNum <= 35) {
      return `-${year}-${month}-${day}-${hash}`;
    }
    return `-${day}-${month}-${year}-${hash}`;
  });
}

/**
 * formatArticleSlug — Normalizes and returns clean article slug with YY-MM-DD date suffix.
 */
export function formatArticleSlug(article: any): string {
  if (!article) return "news";
  const s = (article.slug ?? article.id ?? "news").toString();
  const cleaned = s.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return normalizeSlugDateToYyMmDd(cleaned);
}

/**
 * getArticleUrl — Returns the full URL path for an article.
 * Reads article.slug directly; slug was set once at save time.
 */
export function getArticleUrl(article: any): string {
  if (!article) return "/top-news/article";
  const catSlug = (article.category?.slug || "top-news")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const slug = formatArticleSlug(article);

  // Video articles or category 'videos' route directly to /videos
  if (catSlug === "videos" || article.format === "video") {
    if (article.youtubeId || (article.videoUrl && !article.slug)) {
      const ytId = article.youtubeId || extractYouTubeId(article.videoUrl);
      if (ytId) return `/videos?v=${ytId}`;
    }
    return `/videos/${slug}`;
  }

  return `/${catSlug}/${slug}`;
}

/** Find a default article by slug or ID */
export function findDefaultArticle(slug: string, lang?: "EN" | "HI"): DefaultArticle | undefined {
  const target = decodeURIComponent(slug).trim().toLowerCase();
  let found = allDefaultArticles.find((a) => (a.slug ?? "").toLowerCase() === target);
  if (!found) {
    const parts = target.split("-");
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
 * Also rewrites any Hostinger internal URLs to the main domain so they are never exposed publicly.
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

  // Rewrite Hostinger internal URLs to main domain
  const HOSTINGER_ORIGIN = "https://yellowgreen-rook-384455.hostingersite.com";
  if (img.includes("yellowgreen-rook-384455.hostingersite.com")) {
    const pathPart = img.replace(HOSTINGER_ORIGIN, "");
    return `https://globalawaaz.com${pathPart.startsWith("/") ? pathPart : `/${pathPart}`}`;
  }

  // Auto-compress Unsplash images to WebP format with 800px width constraint for ultra-fast mobile loading
  if (img.includes("images.unsplash.com") && !img.includes("w=")) {
    img = `${img}${img.includes("?") ? "&" : "?"}w=800&q=75&auto=format`;
  }

  // Auto-compress Cloudinary images to WebP with auto quality
  if (img.includes("res.cloudinary.com") && !img.includes("f_auto")) {
    img = img.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
  }

  // Clean and normalize all uploaded media paths to /uploads/filename.ext
  return cleanMediaUrl(img);
}
