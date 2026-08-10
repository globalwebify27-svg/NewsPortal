// =============================================================================
// Slug & Read Time Utilities
// =============================================================================

import slugify from "slugify";
import { prisma } from "../config/database";

// ─── Dictionary for Hindi-to-English Clean Keyword Fallback ──────────────────
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

  // Time & Calendar
  "अगले": "next", "अगला": "next", "महीने": "month", "महीना": "month", "साल": "year",
  "वर्ष": "year", "दिन": "day", "आज": "today", "कल": "tomorrow", "सप्ताह": "week",
  "हफ्ते": "week", "माह": "month",

  // Delivery, Rules & Change
  "डिलीवरी": "delivery", "बदले": "rules-change", "बदलाव": "change", "बदल": "change",
  "बदलेगा": "will-change", "नियम": "rule", "नियमों": "rules", "शर्तें": "terms",
  "लागू": "enforced", "अनिवार्य": "mandatory", "जरूरी": "essential",

  // State, City & Crime
  "तस्कर": "smuggler", "तस्करी": "smuggling", "गिरफ्तार": "arrested", "आरोपी": "accused",
  "पकड़ा": "caught", "मुठभेड़": "encounter", "हत्या": "murder",
  "मामला": "case", "कार्रवाई": "action",

  // Culture, Religion & Festivals
  "पूजा": "pooja", "परंपरा": "tradition", "मंदिर": "temple", "सुरक्षित": "safe",
  "उद्घाटन": "inauguration", "रोजगार": "jobs", "युवाओं": "youth", "प्रत्यक्ष": "direct",

  // Consumer, Utilities & Daily Life
  "उपभोक्ताओं": "consumers", "उपभोक्ता": "consumer", "ग्राहकों": "customers",
  "ग्राहक": "customer", "बढ़": "increase", "बढ़ने": "increase", "बढ़ती": "rising",
  "सकती": "may", "सकता": "may", "सकते": "may", "परेशानी": "trouble",
  "समस्या": "issues", "तारीख": "date", "तिथि": "deadline", "खाता": "account",
  "खाते": "accounts", "कार्ड": "card", "पैन": "pan", "आधार": "aadhaar",
  "केवाईसी": "kyc", "सिलेंडर": "cylinder", "गैस": "gas", "कीमत": "price",
  "कीमतें": "prices", "दाम": "rate", "रेट": "rates", "योजना": "scheme",
  "सब्सिडी": "subsidy",

  // Sports & Entertainment
  "क्रिकेट": "cricket", "मैच": "match", "टीम": "team", "कप्तान": "captain",
  "जीत": "win", "हार": "loss", "फाइनल": "final", "विश्वकप": "worldcup",
  "आईपीएल": "ipl", "फिल्म": "movie", "सिनेमा": "cinema", "बॉलीवुड": "bollywood",
  "अभिनेता": "actor", "अभिनेत्री": "actress", "स्टार": "star",

  // News Headlines & Descriptors
  "सबसे": "top", "बड़ी": "big", "बड़ा": "big", "خبر": "news", "समाचार": "news",
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

// ─── Convert Devanagari Hindi Text into Clean English Keywords ────────────────
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

// ─── Translate Hindi Headline to Proper English Text ──────────────────────────
export async function translateHindiToEnglish(text: string): Promise<string> {
  if (!text || !text.trim()) return "";
  const hasHindi = /[\u0900-\u097F]/.test(text);
  if (!hasHindi) {
    return text;
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
      const data = (await res.json()) as any;
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const fullTranslation = data[0].map((item: any) => (Array.isArray(item) ? item[0] : "")).join("").trim();
        if (fullTranslation && !/[\u0900-\u097F]/.test(fullTranslation)) {
          return fullTranslation;
        }
      }
    }
  } catch {}

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
      const json = (await res.json()) as any;
      const translated = json?.responseData?.translatedText;
      if (translated && typeof translated === "string" && !/[\u0900-\u097F]/.test(translated)) {
        return translated.trim();
      }
    }
  } catch {}

  // 3. Fallback: Dictionary word mapping & phonetics
  return transliterateDevanagari(text);
}

// ─── Generate Unique Article Slug in Proper English ───────────────────────────
export async function createUniqueArticleSlug(title: string, customId?: string, createdAt?: Date): Promise<string> {
  const englishText = await translateHindiToEnglish(title);
  const cleanEnglish = englishText || transliterateDevanagari(title) || "news";

  const baseSlug = slugify(cleanEnglish, {
    lower: true,
    strict: true,
    trim: true,
    replacement: "-",
  }) || "news";

  const d = createdAt ? new Date(createdAt) : new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  const dateStr = `${dd}-${mm}-${yy}`;
  const uniqueId = customId ? customId.replace(/[^a-zA-Z0-9]/g, "").slice(-8) : Math.random().toString(36).substring(2, 8);

  const fullSlug = `${baseSlug}-${dateStr}-${uniqueId}`;

  let slug = fullSlug;
  let counter = 1;

  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${fullSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// ─── Generate Category/Tag Slug ───────────────────────────────────────────────
export function createSlug(text: string): string {
  const englishText = transliterateDevanagari(text);
  return slugify(englishText || text, {
    lower: true,
    strict: true,
    trim: true,
    replacement: "-",
  });
}

// ─── Calculate Reading Time ───────────────────────────────────────────────────
export function calculateReadTime(text: string): string {
  if (!text) return "1 min read";
  const plainText = text.replace(/<[^>]*>/g, "");
  const words = plainText.trim().split(/\s+/).length;
  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

