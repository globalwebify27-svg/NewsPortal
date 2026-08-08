// =============================================================================
// Slug & Read Time Utilities
// =============================================================================

import slugify from "slugify";
import { prisma } from "../config/database";

// ─── Convert / Translate Devanagari Hindi Title into Clean English Slug Words ──────
export function transliterateDevanagari(text: string): string {
  if (!text) return "";

  const HINDI_TO_ENGLISH_MAP: Record<string, string> = {
    "दुनिया": "world",
    "विश्व": "world",
    "देश": "country",
    "विदेश": "foreign",
    "भारत": "india",
    "चीन": "china",
    "अमेरिका": "us",
    "रूस": "russia",
    "यूक्रेन": "ukraine",
    "इजराइल": "israel",
    "हमास": "hamas",
    "पाकिस्तान": "pakistan",
    "पुतिन": "putin",
    "ट्रंप": "trump",
    "ऋषि": "rishi",
    "सुनक": "sunak",
    "मोदी": "modi",
    "नरेंद्र": "narendra",
    "राहुल": "rahul",
    "गांधी": "gandhi",
    "अमित": "amit",
    "शाह": "shah",
    "केजरीवाल": "kejriwal",
    "झारखंड": "jharkhand",
    "बिहार": "bihar",
    "दिल्ली": "delhi",
    "रांची": "ranchi",
    "पटना": "patna",

    // Consumer, Utilities & LPG Services
    "उपभोक्ताओं": "consumers",
    "उपभोक्ता": "consumer",
    "ग्राहकों": "customers",
    "ग्राहक": "customer",
    "बढ़": "increase",
    "बढ़ने": "increase",
    "बढ़ती": "rising",
    "सकती": "may",
    "सकता": "may",
    "सकते": "may",
    "परेशानी": "trouble",
    "समस्या": "issues",
    "तारीख": "date",
    "तिथि": "deadline",
    "करा": "complete",
    "लें": "do",
    "करवाएं": "complete",
    "कराएं": "complete",
    "करें": "do",
    "रखें": "keep",
    "खाता": "account",
    "खाते": "accounts",
    "कार्ड": "card",
    "पैन": "pan",
    "आधार": "aadhaar",
    "केवाईसी": "kyc",
    "सिलेंडर": "cylinder",
    "गैस": "gas",
    "कीमत": "price",
    "कीमतें": "prices",
    "दाम": "rate",
    "रेट": "rates",
    "योजना": "scheme",
    "सब्सिडी": "subsidy",

    "अमीर": "richest",
    "गरीब": "poor",
    "नेताओं": "leaders",
    "नेता": "leader",
    "राष्ट्रपति": "president",
    "प्रधानमंत्री": "prime-minister",
    "मुख्यमंत्री": "chief-minister",
    "मंत्री": "minister",
    "मंत्रालय": "ministry",
    "सरकार": "government",
    "विपक्ष": "opposition",
    "कांग्रेस": "congress",
    "भाजपा": "bjp",
    "सुप्रीम": "supreme",
    "कोर्ट": "court",
    "लोकसभा": "lok-sabha",
    "राज्यसभा": "rajya-sabha",
    "संसद": "parliament",
    "फैसला": "verdict",
    "कानून": "law",
    "पुलिस": "police",
    "क्राइम": "crime",
    "जांच": "probe",
    "सीबीआई": "cbi",

    "इस": "this",
    "वर्ष": "year",
    "साल": "year",
    "दौरे": "trips",
    "दौरा": "visit",
    "यात्रा": "visit",
    "यात्राओं": "trips",
    "खर्च": "expenditure",
    "लागत": "cost",
    "द्वारा": "by",
    "दिया": "provided",
    "गया": "",
    "जानकारी": "details",
    "विवरण": "details",
    "बयान": "statement",
    "रिपोर्ट": "report",
    "निर्देश": "order",
    "आदेश": "instructions",
    "लागू": "effective",
    "अंतिम": "last",
    "जरूरी": "mandatory",

    "शेयर": "share",
    "बाजार": "market",
    "अर्थव्यवस्था": "economy",
    "रुपया": "rupee",
    "डॉलर": "dollar",
    "बैंक": "bank",
    "महंगाई": "inflation",
    "बजट": "budget",
    "टैक्स": "tax",
    "सोना": "gold",
    "चांदी": "silver",
    "तेल": "oil",
    "टेक": "tech",
    "एआई": "ai",
    "गूगल": "google",
    "ऐप्पल": "apple",
    "इसरो": "isro",
    "नासा": "nasa",
    "अंतरिक्ष": "space",
    "रोवर": "rover",
    "मंगल": "mars",
    "चांद": "moon",

    "क्रिकेट": "cricket",
    "मैच": "match",
    "टीम": "team",
    "कप्तान": "captain",
    "जीत": "win",
    "हार": "loss",
    "फाइनल": "final",
    "विश्वकप": "worldcup",
    "आईपीएल": "ipl",
    "फिल्म": "movie",
    "सिनेमा": "cinema",
    "बॉलीवुड": "bollywood",
    "अभिनेता": "actor",
    "अभिनेत्री": "actress",
    "स्टार": "star",

    "सबसे": "most",
    "बड़ी": "big",
    "बड़ा": "big",
    "खबर": "news",
    "समाचार": "news",
    "ताजा": "latest",
    "अपडेट": "update",
    "लिस्ट": "list",
    "सूची": "list",
    "सामने": "out",
    "आई": "out",
    "आया": "out",
    "शामिल": "included",
    "नंबर": "number",
    "बदलाव": "change",
    "जारी": "released",
    "घोषणा": "announced",
    "दावा": "claim",
    "हमला": "attack",
    "हादसा": "accident",
    "मौत": "death",
    "अलर्ट": "alert",
    "मौसम": "weather",
    "बारिश": "rain",

    // Grammatical prepositions / stop words cleared for clean URLs
    "के": "", "का": "", "की": "", "को": "", "से": "", "में": "in", "मे": "in", "पर": "", "ने": "",
    "और": "and", "या": "or", "भी": "", "तक": "by", "हुआ": "", "हुई": "", "होगा": "",
    "है": "", "हैं": "", "था": "", "थी": "", "थे": ""
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

  const cleanStr = text.replace(/[,;:.!?\|"'`()\[\]\{\}]/g, " ").trim();
  const words = cleanStr.split(/\s+/);

  const translatedWords = words.map((w) => {
    const hindiCharsOnly = w.replace(/[^\u0900-\u097F]/g, "");
    if (hindiCharsOnly && HINDI_TO_ENGLISH_MAP[hindiCharsOnly] !== undefined) {
      return HINDI_TO_ENGLISH_MAP[hindiCharsOnly];
    }

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

// ─── Generate Unique Article Slug ─────────────────────────────────────────────
export async function createUniqueArticleSlug(title: string, customId?: string, createdAt?: Date): Promise<string> {
  const englishTitle = transliterateDevanagari(title);
  const baseSlug = slugify(englishTitle || title, {
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
  // Remove HTML tags
  const plainText = text.replace(/<[^>]*>/g, "");
  const words = plainText.trim().split(/\s+/).length;
  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
