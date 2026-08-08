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
 * // ─── Dictionary for Hindi-to-English Clean Keyword Fallback ──────────────────
 */
const HINDI_TO_ENGLISH_MAP: Record<string, string> = {
  // Nations, Leaders & Geography
  "दुनिया": "world", "विश्व": "world", "देश": "country", "विदेश": "foreign",
  "भारत": "india", "चीन": "china", "अमेरिका": "us", "रूस": "russia",
  "यूक्रेन": "ukraine", "इजराइल": "israel", "हमास": "hamas", "पाकिस्तान": "pakistan",
  "पुतिन": "putin", "ट्रंप": "trump", "ऋषि": "rishi", "सुनक": "sunak",
  "मोदी": "modi", "नरेंद्र": "narendra", "राहुल": "rahul", "गांधी": "gandhi",
  "अमित": "amit", "शाह": "shah", "केजरीवाल": "kejriwal", "झारखंड": "jharkhand",
  "बिहार": "bihar", "दिल्ली": "delhi", "रांची": "ranchi", "पटना": "patna",
  "उत्तर": "north", "प्रदेश": "state", "राजस्थान": "rajasthan", "महाराष्ट्र": "maharashtra",

  // Government, Law & Politics
  "नेताओं": "leaders", "नेता": "leader", "राष्ट्रपति": "president",
  "प्रधानमंत्री": "prime-minister", "मुख्यमंत्री": "chief-minister",
  "मंत्री": "minister", "मंत्रालय": "ministry", "सरकार": "government",
  "विपक्ष": "opposition", "कांग्रेस": "congress", "भाजपा": "bjp",
  "सुप्रीम": "supreme", "कोर्ट": "court", "लोकसभा": "lok-sabha",
  "राज्यसभा": "rajya-sabha", "संसद": "parliament", "फैसला": "verdict",
  "कानून": "law", "पुलिस": "police", "क्राइम": "crime", "जांच": "probe",
  "सीबीआई": "cbi", "चुनाव": "election", "मतदान": "voting",

  // Economy, Finance & Business
  "शेयर": "share", "बाजार": "market", "अर्थव्यवस्था": "economy",
  "रुपया": "rupee", "डॉलर": "dollar", "बैंक": "bank", "महंगाई": "inflation",
  "बजट": "budget", "टैक्स": "tax", "सोना": "gold", "चांदी": "silver",
  "तेल": "oil", "उद्योग": "industry", "व्यापार": "trade", "निवेश": "investment",

  // Energy, Tech & Space
  "ऊर्जा": "energy", "स्वच्छ": "clean", "मिशन": "mission", "गति": "momentum",
  "टेक": "tech", "एआई": "ai", "गूगल": "google", "ऐप्पल": "apple",
  "इसरो": "isro", "नासा": "nasa", "अंतरिक्ष": "space", "रोवर": "rover",
  "मंगल": "mars", "चांद": "moon", "उपग्रह": "satellite", "स्वास्थ्य": "health",
  "सीमा": "limits", "मील": "milestones", "पत्थर": "milestone", "सफलता": "success",

  // Consumer, Utilities & Daily Life
  "उपभोक्ताओं": "consumers", "उपभोक्ता": "consumer", "ग्राहकों": "customers",
  "ग्राहक": "customer", "बढ़": "increase", "बढ़ने": "increase", "बढ़ती": "rising",
  "सकती": "may", "सकता": "may", "सकते": "may", "परेशानी": "trouble",
  "समस्या": "issues", "तारीख": "date", "तिथि": "deadline", "खाता": "account",
  "खाते": "accounts", "कार्ड": "card", "पैन": "pan", "आधार": "aadhaar",
  "केवाईसी": "kyc", "सिलेंडर": "cylinder", "गैस": "gas", "कीमत": "price",
  "कीमतें": "prices", "दाम": "rate", "रेट": "rates", "योजना": "scheme",
  "सब्सिडी": "subsidy", "बदलाव": "change", "नियम": "rule", "नियमों": "rules",

  // Sports & Entertainment
  "क्रिकेट": "cricket", "मैच": "match", "टीम": "team", "कप्तान": "captain",
  "जीत": "win", "हार": "loss", "फाइनल": "final", "विश्वकप": "worldcup",
  "आईपीएल": "ipl", "फिल्म": "movie", "सिनेमा": "cinema", "बॉलीवुड": "bollywood",
  "अभिनेता": "actor", "अभिनेत्री": "actress", "स्टार": "star",

  // News Headlines & Descriptors
  "सबसे": "top", "बड़ी": "big", "बड़ा": "big", "खबर": "news", "समाचार": "news",
  "ताजा": "latest", "अपडेट": "update", "लिस्ट": "list", "सूची": "list",
  "सामने": "out", "आई": "out", "आया": "out", "शामिल": "included", "नंबर": "number",
  "जारी": "released", "घोषणा": "announced", "दावा": "claim", "हमला": "attack",
  "हादसा": "accident", "मौत": "death", "अलर्ट": "alert", "मौसम": "weather",
  "बारिश": "rain", "धमाका": "blast", "राहत": "relief",

  // Additional Sports, Numbers & News Keywords
  "६००": "600", "६": "6", "ज्यादा": "more", "अधिक": "more", "कम": "less",
  "विकेट": "wickets", "फिर": "still", "इंडिया": "india", "एंट्री": "entry",
  "नहीं": "no", "कब": "when", "होंगे": "will-be", "होगा": "will-be",
  "मेहरबान": "kind", "धर्मेंद्रसिंह": "dharmendrasinh", "जडेजा": "jadeja",
  "सेलेक्टर्स": "selectors", "चयनकर्ता": "selectors", "खिलाड़ी": "player",
  "खिलाड़ियों": "players", "रन": "runs", "शतक": "century", "अर्धशतक": "fifty",
  "गेंदबाज": "bowler", "बल्लेबाज": "batsman",

  // Prepositions & Stop Words (omitted for clean English slugs)
  "के": "", "का": "", "की": "", "को": "", "से": "", "में": "in", "मे": "in",
  "पर": "", "ने": "", "और": "and", "या": "or", "भी": "", "तक": "by",
  "हुआ": "", "हुई": "", "है": "", "हैं": "", "था": "", "थी": "", "थे": ""
};

const CONSONANT_MAP: Record<string, string> = {
  "क": "ka", "ख": "kha", "ग": "ga", "घ": "gha", "ङ": "nga",
  "च": "cha", "छ": "cha", "ज": "ja", "झ": "jha", "ञ": "nya",
  "ट": "ta", "ठ": "tha", "ड": "da", "ढ": "dha", "ण": "na",
  "त": "ta", "थ": "tha", "द": "da", "ध": "dha", "न": "na",
  "प": "pa", "फ": "fa", "ब": "ba", "भ": "bha", "म": "ma",
  "य": "ya", "र": "ra", "ल": "la", "व": "va",
  "श": "sha", "ष": "sha", "स": "sa", "ह": "ha",
  "क्ष": "xa", "त्र": "tra", "ज्ञ": "gya", "ड़": "da", "ढ़": "dha"
};

const MATRA_MAP: Record<string, string> = {
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "ृ": "ri",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ं": "n", "्": ""
};

const VOWEL_MAP: Record<string, string> = {
  "अ": "a", "आ": "a", "इ": "i", "ई": "i", "उ": "u", "ऊ": "u", "ऋ": "r",
  "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "अं": "an"
};

/**
 * Convert Devanagari (Hindi) text into clean English words.
 * Uses dictionary translation first, then phonetic transliteration for proper nouns.
 */
export function transliterateDevanagari(text: string): string {
  if (!text) return "";

  const cleanStr = text.replace(/[,;:.!?\|"'`()\[\]\{\}]/g, " ").trim();
  const words = cleanStr.split(/\s+/);

  const translatedWords = words.map((w) => {
    const hindiCharsOnly = w.replace(/[^\u0900-\u097F]/g, "");
    if (hindiCharsOnly && HINDI_TO_ENGLISH_MAP[hindiCharsOnly] !== undefined) {
      return HINDI_TO_ENGLISH_MAP[hindiCharsOnly];
    }
    if (/^[a-zA-Z0-9]+$/.test(w)) {
      return w.toLowerCase();
    }
    // Phonetic transliteration fallback for unmapped proper nouns / names
    let res = "";
    for (let i = 0; i < w.length; i++) {
      const char = w[i];
      const nextChar = w[i + 1];

      if (VOWEL_MAP[char]) {
        res += VOWEL_MAP[char];
      } else if (CONSONANT_MAP[char]) {
        const base = CONSONANT_MAP[char];
        if (nextChar && MATRA_MAP[nextChar] !== undefined) {
          res += base.slice(0, -1) + MATRA_MAP[nextChar];
          i++;
        } else if (i === w.length - 1) {
          res += base.slice(0, -1);
        } else {
          res += base;
        }
      } else if (MATRA_MAP[char] !== undefined) {
        res += MATRA_MAP[char];
      } else {
        res += char;
      }
    }
    return res;
  });

  return translatedWords.filter(Boolean).join(" ");
}

/**
 * Asynchronously translates Hindi headlines to clean, grammatically natural English slugs.
 */
export async function translateHindiToEnglishSlug(text: string): Promise<string> {
  if (!text || !text.trim()) return "";
  const hasHindi = /[\u0900-\u097F]/.test(text);
  if (!hasHindi) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-");
  }

  // 1. Try Google Translate free API (natural English sentence grammar)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const cleanText = text.replace(/[\n\r]+/g, " ").trim();
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=en&dt=t&q=${encodeURIComponent(cleanText)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const fullTranslation = data[0].map((item: any) => (Array.isArray(item) ? item[0] : "")).join("").trim();
        if (fullTranslation && !/[\u0900-\u097F]/.test(fullTranslation)) {
          const cleanSlug = fullTranslation
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/[\s-]+/g, "-")
            .slice(0, 95)
            .replace(/^-+|-+$/g, "");
          if (cleanSlug.length > 5) return cleanSlug;
        }
      }
    }
  } catch (e) {}

  // 2. Fallback: MyMemory API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const cleanText = text.replace(/[,;:.!?\|"'`()\[\]\{\}]/g, " ").trim();
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=hi|en`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const translated = json?.responseData?.translatedText;
      if (translated && typeof translated === "string" && !/[\u0900-\u097F]/.test(translated)) {
        const cleanSlug = translated
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/[\s-]+/g, "-")
          .slice(0, 95)
          .replace(/^-+|-+$/g, "");
        if (cleanSlug.length > 5) return cleanSlug;
      }
    }
  } catch (e) {}

  // 3. Fallback: Word mapping & phonetic transliteration
  return transliterateDevanagari(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 95)
    .replace(/^-+|-+$/g, "");
}

/** 
 * Format Article Slug in English with Date (dd-mm-yy) and Unique ID:
 * Format: {headline-english-slug}-{dd-mm-yy}-{uniqueId}
 */
export function formatArticleSlug(article: any): string {
  if (!article) return "news-07-08-26-000";

  const englishTitle = article.titleEn || article.englishTitle || article.title_en;

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

  let rawTitle = (englishTitle || article.title || article.slug || "news")
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
 */
export function getArticleUrl(article: any): string {
  if (!article) return "/article/news-070826-000";
  const catSlug = article.category?.slug
    ? article.category.slug.toLowerCase().trim().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")
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
