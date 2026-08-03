/**
 * Default articles registry.
 * Set to empty arrays so the platform strictly displays live database / admin-created content.
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
  status?: string;
  views?: number;
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
}

export const defaultEnglishArticles: DefaultArticle[] = [];
export const defaultHindiArticles: DefaultArticle[] = [];

/** All default articles combined */
export const allDefaultArticles: DefaultArticle[] = [];

/** Find a default article by slug */
export function findDefaultArticle(slug: string, lang?: "EN" | "HI"): DefaultArticle | undefined {
  return undefined;
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
