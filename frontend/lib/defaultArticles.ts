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
 * Transliterate Devanagari (Hindi) text into Roman / English characters.
 */
export function transliterateDevanagari(text: string): string {
  if (!text) return "";

  const HINDI_WORD_MAP: Record<string, string> = {
    "दुनिया": "duniya",
    "के": "ke",
    "का": "ka",
    "की": "ki",
    "को": "ko",
    "से": "se",
    "में": "mein",
    "पर": "par",
    "ने": "ne",
    "और": "aur",
    "या": "ya",
    "तक": "tak",
    "सबसे": "sabse",
    "अमीर": "ameer",
    "नेताओं": "netaon",
    "नेता": "neta",
    "लिस्ट": "list",
    "आई": "aai",
    "आया": "aaya",
    "सामने": "samne",
    "पुतिन": "putin",
    "नंबर": "number",
    "ट्रंप": "trump",
    "ऋषि": "rishi",
    "सुनक": "sunak",
    "मोदी": "modi",
    "भारत": "bharat",
    "चीन": "china",
    "अमेरिका": "america",
    "पाकिस्तान": "pakistan",
    "रूस": "russia",
    "यूक्रेन": "ukraine",
    "इजराइल": "israel",
    "हमास": "hamas",
    "चुनाव": "chunav",
    "सरकार": "sarkar",
    "विपक्ष": "vipaksh",
    "कांग्रेस": "congress",
    "भाजपा": "bjp",
    "सुप्रीम": "supreme",
    "कोर्ट": "court",
    "पुलिस": "police",
    "क्रिकेट": "cricket",
    "टीम": "team",
    "मैच": "match",
    "विश्व": "vishwa",
    "देश": "desh",
    "विदेश": "videsh",
    "खेल": "khel",
    "सिनेमा": "cinema",
    "फिल्म": "film",
    "बॉलीवुड": "bollywood",
    "टेक": "tech",
    "ऑटो": "auto",
    "बिजनेस": "business",
    "शेयर": "share",
    "बाजार": "bazar",
    "मौसम": "mausam",
    "बारिश": "baarish",
    "अलर्ट": "alert",
    "खबर": "khabar",
    "ताजा": "taaza",
    "बड़ी": "badi",
    "अपडेट": "update",
    "वीडियो": "video",
    "फोटो": "photo",
    "लाइव": "live",
  };

  const DEVANAGARI_CHAR_MAP: Record<string, string> = {
    "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo", "ऋ": "ri",
    "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "अं": "an", "अः": "ah",
    "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ri",
    "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ं": "n", "ः": "h",
    "ॅ": "e", "ॉ": "o", "़": "", "्": "",
    "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
    "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
    "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
    "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
    "प": "p", "फ": "f", "ब": "b", "भ": "bh", "म": "m",
    "य": "y", "र": "r", "ल": "l", "व": "v",
    "श": "sh", "ष": "sh", "स": "s", "ह": "h",
    "ळ": "l", "क्ष": "ksh", "त्र": "tr", "ज्ञ": "gya",
    "ड़": "d", "ढ़": "dh", "ॐ": "om", "₹": "rs"
  };

  const normalized = text.replace(/[-_]+/g, " ").trim();
  const words = normalized.split(/\s+/);

  const transliteratedWords = words.map((w) => {
    const cleanWord = w.replace(/[^\u0900-\u097F]/g, "");
    if (cleanWord && HINDI_WORD_MAP[cleanWord]) {
      return HINDI_WORD_MAP[cleanWord];
    }

    let result = "";
    for (let i = 0; i < w.length; i++) {
      const char = w[i];
      if (DEVANAGARI_CHAR_MAP[char] !== undefined) {
        result += DEVANAGARI_CHAR_MAP[char];
      } else {
        result += char;
      }
    }
    return result;
  });

  return transliteratedWords.join(" ");
}

/** 
 * Format Article Slug in English only with Date (dd-mm-yy) and Unique ID at the end:
 * Format: {headline-english-slug}-{dd-mm-yy}-{uniqueId}
 * Example: duniya-ke-sabse-ameer-netaon-ki-list-aai-samne-putin-number-1-trump-aur-rishi-03-08-26-art101
 */
export function formatArticleSlug(article: any): string {
  if (!article) return "news-07-08-26-000";

  const rawId = (article.id || article.slug || Math.random().toString(36).substring(2, 8)).toString();
  const cleanId = rawId.replace(/[^a-zA-Z0-9]/g, "").slice(-8) || "001";

  const rawDate = article.createdAt || article.publishedAt || new Date().toISOString();
  let dateStr = "07-08-26";
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = String(d.getFullYear()).slice(-2);
      dateStr = `${dd}-${mm}-${yy}`;
    }
  } catch (e) {}

  let rawTitle = (article.title || article.slug || "news")
    .toString()
    .replace(/-\d{2}-\d{2}-\d{2}-[a-zA-Z0-9]+$/, "")
    .replace(/-\d{6}-[a-zA-Z0-9]+$/, "")
    .replace(/-\d{8}-[a-zA-Z0-9]+$/, "");

  let englishText = transliterateDevanagari(rawTitle);

  let baseTitle = englishText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 85)
    .replace(/^-+|-+$/g, "");

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
