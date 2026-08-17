import { MASTER_SUB_CATEGORIES } from "./subCategories";
import { INDIAN_STATES } from "./states";

export interface SeoPageConfig {
  path: string;
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: "summary_large_image" | "summary";
  robots: "index, follow" | "noindex, follow" | "index, nofollow" | "noindex, nofollow";
  jsonLdType: "NewsMediaOrganization" | "WebPage" | "CollectionPage" | "NewsArticle";
  schemaJson?: string;
  isSubTab?: boolean;
  isState?: boolean;
  parentCategory?: string;
}

export function generateStateSeoConfigs(): SeoPageConfig[] {
  const statePages: SeoPageConfig[] = [];
  
  if (Array.isArray(INDIAN_STATES)) {
    INDIAN_STATES.forEach((st) => {
      const pathDirect = `/${st.slug}`;

      statePages.push({
        path: pathDirect,
        pageName: `State: ${st.nameHi} (${st.nameEn})`,
        metaTitle: `${st.nameHi} समाचार (${st.nameEn} News) | Breaking News, Politics & Local Updates — Global Awaaz`,
        metaDescription: `${st.nameHi} (${st.nameEn}) की ताज़ा ख़बरें, मुख्य समाचार, राजनीति, ग्राउंड रिपोर्टिंग, प्रशासन और स्थानीय अपडेट्स पढ़ें ग्लोबल आवाज़ पर।`,
        keywords: `${st.nameHi}, ${st.nameEn} news, ${st.nameHi} breaking news, ${st.slug} latest news, Global Awaaz`,
        canonicalUrl: `https://www.globalawaaz.com${pathDirect}`,
        ogTitle: `${st.nameHi} — ताज़ा समाचार व ब्रेकिंग न्यूज़ | Global Awaaz`,
        ogDescription: `${st.nameHi} क्षेत्र की हर छोटी-बड़ी खबर, राजनीति और विकास कार्यों की विस्तृत कवरेज।`,
        ogImage: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&auto=format&fit=crop&q=80",
        ogType: "website",
        twitterCard: "summary_large_image" as const,
        robots: "index, follow" as const,
        jsonLdType: "CollectionPage" as const,
        isSubTab: true,
        isState: true,
        parentCategory: "india"
      });
    });
  }

  return statePages;
}

export function generateSubTabSeoConfigs(): SeoPageConfig[] {
  const subTabPages: SeoPageConfig[] = [];
  
  if (typeof MASTER_SUB_CATEGORIES === "object" && MASTER_SUB_CATEGORIES !== null) {
    Object.entries(MASTER_SUB_CATEGORIES).forEach(([catKey, subList]) => {
      if (Array.isArray(subList)) {
        subList.forEach((sub) => {
          const subSlug = sub.en.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
          const path = `/${catKey}/${subSlug}`;
          subTabPages.push({
            path,
            pageName: `Sub-Tab: ${sub.hi} (${sub.en})`,
            metaTitle: `${sub.hi} (${sub.en}) | ${catKey.toUpperCase()} News — Global Awaaz`,
            metaDescription: `${sub.hi} से जुड़ी ताज़ा ख़बरें, ब्रेकिंग समाचार, मुख्य अपडेट्स और विस्तृत विश्लेषणात्मक रिपोर्ट पढ़ें ग्लोबल आवाज़ पर।`,
            keywords: `${sub.hi}, ${sub.en}, ${catKey} news hindi, breaking news, Global Awaaz`,
            canonicalUrl: `https://www.globalawaaz.com${path}`,
            ogTitle: `${sub.hi} — ताज़ा समाचार व लाइव अपडेट्स | Global Awaaz`,
            ogDescription: `${sub.hi} क्षेत्र की हर छोटी-बड़ी खबर सबसे पहले और सबसे सटीक अंदाज में पढ़ें।`,
            ogImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80",
            ogType: "website",
            twitterCard: "summary_large_image",
            robots: "index, follow",
            jsonLdType: "CollectionPage",
            isSubTab: true,
            parentCategory: catKey
          });
        });
      }
    });
  }

  return subTabPages;
}

export const BASE_SEO_PAGES: SeoPageConfig[] = [
  {
    path: "/",
    pageName: "Homepage (मुख्य पृष्ठ)",
    metaTitle: "GLOBAL AWAAZ - LOCAL से GLOBAL तक | Breaking Hindi & English News Updates",
    metaDescription: "ग्लोबल आवाज़ पोर्टल पर पाएं भारत, झारखंड, शिक्षा, व्यापार, तकनीक, खेल, मनोरंजन और विश्व राजनीति की ताज़ा खबरें व विस्तृत संपादकीय विश्लेषण।",
    keywords: "Global Awaaz, Breaking News Hindi, Jharkhand News, Education News, Indian News Portal, World Politics, Technology News, Live News Updates",
    canonicalUrl: "https://www.globalawaaz.com",
    ogTitle: "GLOBAL AWAAZ — निष्पक्ष खबरें, सटीक विश्लेषण",
    ogDescription: "देश-दुनिया और आपके अपने राज्य की हर छोटी-बड़ी खबर सबसे पहले और सबसे सटीक अंदाज में पढ़ें।",
    ogImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "NewsMediaOrganization"
  },
  {
    path: "/education",
    pageName: "Education (शिक्षा)",
    metaTitle: "Education News (शिक्षा समाचार) | Board Exams, Competitive Exams & College Admissions — Global Awaaz",
    metaDescription: "10वीं और 12वीं बोर्ड परीक्षा, UPSC, JEE, NEET, कॉलेज एडमिशन और सरकारी नौकरी परीक्षा से जुड़ी ताज़ा जानकारी और गाइडेंस पढ़ें।",
    keywords: "Education News, Board Exams 2026, UPSC Exam News, JEE Main Preparation, NEET Updates, College Admissions, Career Guidance Hindi",
    canonicalUrl: "https://www.globalawaaz.com/education",
    ogTitle: "शिक्षा समाचार एवं प्रतियोगी परीक्षा अपडेट — Global Awaaz",
    ogDescription: "बोर्ड परीक्षाओं, प्रतियोगी परीक्षाओं और करियर गाइडेंस से जुड़ी ताज़ा अपडेट्स।",
    ogImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "CollectionPage"
  },
  {
    path: "/world",
    pageName: "World (विदेश)",
    metaTitle: "World News (विदेश व अंतरराष्ट्रीय समाचार) | Global Affairs & Diplomacy — Global Awaaz",
    metaDescription: "ग्लोबल पॉलिटिक्स, अंतरराष्ट्रीय मामले, कूटनीति, रक्षा समाचार और वैश्विक अर्थव्यवस्था की ताज़ा अंतरराष्ट्रीय रिपोर्ट।",
    keywords: "World News, International News Hindi, Global Politics, Defence News, US News, Diplomacy, World Economy",
    canonicalUrl: "https://www.globalawaaz.com/world",
    ogTitle: "अंतरराष्ट्रीय समाचार एवं वैश्विक विश्लेषण — Global Awaaz",
    ogDescription: "दुनिया भर के प्रमुख घटनाक्रमों और वैश्विक राजनीति की सटीक रिपोर्टिंग।",
    ogImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "CollectionPage"
  },
  {
    path: "/india",
    pageName: "India & States (भारत व राज्य)",
    metaTitle: "India News (राष्ट्रीय एवं राज्य-वार समाचार) | Jharkhand, Bihar, UP & National News — Global Awaaz",
    metaDescription: "भारत की राजनीति, राष्ट्रीय सुरक्षा, शासन और झारखंड सहित सभी प्रमुख राज्यों से जुड़ी ताज़ा ग्राउंड रिपोर्टिंग।",
    keywords: "India News, Jharkhand News, State News, National Politics, Governance, State Highlights Hindi",
    canonicalUrl: "https://www.globalawaaz.com/india",
    ogTitle: "राष्ट्रीय एवं राज्य-वार मुख्य समाचार — Global Awaaz",
    ogDescription: "झारखंड और भारत के सभी राज्यों की विश्वसनीय व सटीक खबरें।",
    ogImage: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "CollectionPage"
  },
  {
    path: "/business",
    pageName: "Business (व्यापार)",
    metaTitle: "Business & Market News (व्यापार व शेयर बाज़ार) | Stock Market, Economy & Crypto — Global Awaaz",
    metaDescription: "शेयर बाज़ार, सेंसेक्स, निफ्टी, स्टार्ट-अप, पर्सनल फाइनेंस, टैक्स और कॉर्पोरेट जगत की ताज़ा खबरें व बाज़ार रुझान।",
    keywords: "Business News Hindi, Sensex Nifty Today, Stock Market News, Personal Finance, Crypto Updates, Startups India",
    canonicalUrl: "https://www.globalawaaz.com/business",
    ogTitle: "व्यापार, अर्थव्यवस्था एवं शेयर बाज़ार लाइव समाचार — Global Awaaz",
    ogDescription: "मार्केट मूव्स, कंपनियों के नतीजे और पर्सनल फाइनेंस के नए टिप्स।",
    ogImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "CollectionPage"
  },
  {
    path: "/technology",
    pageName: "Technology (तकनीक)",
    metaTitle: "Technology News (तकनीक व गैजेट्स) | AI, Smartphones, Space Tech & Apps — Global Awaaz",
    metaDescription: "आर्टिफिशियल इंटेलिजेंस (AI), स्मार्टफोन रिव्यू, साइबर सुरक्षा, अंतरिक्ष तकनीक और सॉफ्टवेयर अपडेट्स की ताज़ा जानकारी।",
    keywords: "Technology News Hindi, Artificial Intelligence, AI News, Smartphone Reviews, Space Tech, Cybersecurity Updates",
    canonicalUrl: "https://www.globalawaaz.com/technology",
    ogTitle: "तकनीक एवं एआई की दुनिया से ताज़ा अपडेट्स — Global Awaaz",
    ogDescription: "स्मार्टफोन रिव्यू, AI टूल एनालिसिस और साइंस-टेक नवाचार।",
    ogImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "CollectionPage"
  },
  {
    path: "/sports",
    pageName: "Sports (खेल)",
    metaTitle: "Sports News (खेल समाचार) | Cricket, IPL, Football & Olympics — Global Awaaz",
    metaDescription: "क्रिकेट मैच स्कोर, आईपीएल अपडेट्स, फुटबॉल टूर्नामेंट, फॉर्मूला 1 और एथलेटिक्स की हर छोटी-बड़ी खेल खबर।",
    keywords: "Sports News Hindi, Cricket Live Score, IPL 2026, Football Updates, Olympics Athletics",
    canonicalUrl: "https://www.globalawaaz.com/sports",
    ogTitle: "खेल समाचार एवं लाइव मैच कवरेज — Global Awaaz",
    ogDescription: "क्रिकेट, फुटबॉल और अन्य खेलों की ताज़ा और विशेष रिपोर्टिंग।",
    ogImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "CollectionPage"
  },
  {
    path: "/entertainment",
    pageName: "Entertainment (मनोरंजन)",
    metaTitle: "Entertainment News (मनोरंजन) | Cinema, OTT Reviews & Celebrity Gossip — Global Awaaz",
    metaDescription: "बॉलीवुड, हॉलीवुड, ओटीटी वेब सीरीज रिव्यू, नए गानों और फिल्मी दुनिया की चटपटी खबरें पढ़ें।",
    keywords: "Entertainment News Hindi, Bollywood Gossip, Movie Reviews, OTT Web Series, Celebrity News",
    canonicalUrl: "https://www.globalawaaz.com/entertainment",
    ogTitle: "मनोरंजन एवं सिनेमा की दुनिया से चटपटी खबरें — Global Awaaz",
    ogDescription: "फिल्मी गॉसिप, नए मूवी रिव्यू और ट्रेंडिंग ओटीटी रिलीज।",
    ogImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "CollectionPage"
  },
  {
    path: "/science",
    pageName: "Science (विज्ञान)",
    metaTitle: "Science & Discovery News (विज्ञान व अनुसंधान) | ISRO, NASA & Environment — Global Awaaz",
    metaDescription: "अंतरिक्ष मिशन (ISRO/NASA), नई वैज्ञानिक खोजें, पर्यावरण और जलवायु परिवर्तन की प्रामाणिक वैज्ञानिक रिपोर्ट्स।",
    keywords: "Science News Hindi, ISRO Missions, Space Exploration, Climate Change, Discoveries",
    canonicalUrl: "https://www.globalawaaz.com/science",
    ogTitle: "विज्ञान अनुसंधान एवं अंतरिक्ष मिशन समाचार — Global Awaaz",
    ogDescription: "ISRO और दुनिया भर की प्रमुख वैज्ञानिक खोजों की विस्तृत कवरेज।",
    ogImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "CollectionPage"
  },
  {
    path: "/health",
    pageName: "Health (स्वास्थ्य)",
    metaTitle: "Health & Fitness (स्वास्थ्य व जीवनशैली) | Wellness, Yoga & Medicine — Global Awaaz",
    metaDescription: "योग, न्यूट्रिशन, डाइट टिप्स, मानसिक स्वास्थ्य और मेडिकल क्षेत्र के नए अनुसंधानों की भरोसेमंद जानकारी।",
    keywords: "Health Tips Hindi, Yoga Practices, Nutrition Guide, Mental Health, Medical Breakthroughs",
    canonicalUrl: "https://www.globalawaaz.com/health",
    ogTitle: "स्वास्थ्य एवं सेहत के रामबाण सुझाव — Global Awaaz",
    ogDescription: "आरोग्य जीवन, सही खान-पान और योग अभ्यास से जुड़ी उपयोगी सलाह।",
    ogImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "CollectionPage"
  },
  {
    path: "/opinion",
    pageName: "Opinion (विचार व संपादकीय)",
    metaTitle: "Editorials & Expert Opinion (संपादकीय विचार) | In-depth Columnists — Global Awaaz",
    metaDescription: "देश के वरिष्ठ संपादकों और विषय विशेषज्ञों द्वारा लिखित समसामयिक मुद्दों पर निष्पक्ष और विश्लेषणात्मक विचार।",
    keywords: "Editorial Columns Hindi, Expert Opinion, Analytical Articles, Daily Perspective",
    canonicalUrl: "https://www.globalawaaz.com/opinion",
    ogTitle: "संपादकीय विचार एवं विश्लेषणात्मक आलेख — Global Awaaz",
    ogDescription: "महत्वपूर्ण राष्ट्रीय व अंतरराष्ट्रीय मुद्दों पर विशेषज्ञों का नज़रिया।",
    ogImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "CollectionPage"
  },
  {
    path: "/videos",
    pageName: "Videos (वीडियो समाचार)",
    metaTitle: "Video News & Ground Reports (वीडियो बुलेटिन) | Live Video Coverage — Global Awaaz",
    metaDescription: "ग्राउंड रिपोर्टिंग, ट्रेंडिंग क्लिप्स, इंटरव्यू और वीडियो बुलेटिन के माध्यम से देखें खबरें सीधे मौके से।",
    keywords: "Video News Hindi, Live News Video, Ground Reports, Video Bulletin Global Awaaz",
    canonicalUrl: "https://www.globalawaaz.com/videos",
    ogTitle: "वीडियो बुलेटिन एवं लाइव ग्राउंड कवरेज — Global Awaaz",
    ogDescription: "वीडियो के ज़रिए देखें देश-दुनिया की बड़ी खबरें।",
    ogImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "CollectionPage"
  },
  {
    path: "/epaper",
    pageName: "e-Paper (डिजिटल ई-पेपर)",
    metaTitle: "Digital e-Paper (डिजिटल ई-पेपर संस्करण) | Read Daily Newspaper PDF — Global Awaaz",
    metaDescription: "ग्लोबल आवाज़ का दैनिक ई-पेपर डिजिटल फॉर्मेट में पढ़ें। प्रिंट संस्करण की तरह हर पन्ने का स्पष्ट अनुभव।",
    keywords: "e-Paper Hindi, Read Newspaper Online, Digital Hindi Newspaper PDF, Global Awaaz ePaper",
    canonicalUrl: "https://www.globalawaaz.com/epaper",
    ogTitle: "ग्लोबल आवाज़ दैनिक ई-पेपर — ऑनलाइन पठन",
    ogDescription: "दैनिक अखबार का डिजिटल संस्करण कहीं भी, कभी भी आसानी से पढ़ें।",
    ogImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "WebPage"
  },
  {
    path: "/shorts",
    pageName: "Shorts (क्विक रील्स व शॉर्ट्स)",
    metaTitle: "Quick News Shorts (60-सेकंड शॉर्ट्स) | Fast Visual News — Global Awaaz",
    metaDescription: "60 सेकंड में पढ़ें देश-दुनिया की बड़ी खबरें। त्वरित दृश्य समाचार कार्ड्स और रील्स।",
    keywords: "News Shorts Hindi, 60 Second News, Visual News Cards, Fast News Updates",
    canonicalUrl: "https://www.globalawaaz.com/shorts",
    ogTitle: "60 सेकंड में तेज़ और संक्षिप्त खबरें — Global Awaaz Shorts",
    ogDescription: "समय की बचत के साथ मिनटों में जानें दिन की मुख्य खबरें।",
    ogImage: "https://images.unsplash.com/photo-1616469829941-c7200edec809?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "WebPage"
  },
  {
    path: "/about",
    pageName: "About Us (हमारे बारे में)",
    metaTitle: "About Us (हमारे बारे में) | Editorial Values & Mission — Global Awaaz",
    metaDescription: "ग्लोबल आवाज़ न्यूज़ पोर्टल का संपादकीय मिशन, हमारी निष्पक्ष पत्रकारिता नीति और लीडरशिप टीम की जानकारी।",
    keywords: "About Global Awaaz, Editorial Principles, News Media Ethics, Media Team",
    canonicalUrl: "https://www.globalawaaz.com/about",
    ogTitle: "हमारे बारे में — निष्पक्ष एवं प्रामाणिक पत्रकारिता",
    ogDescription: "जानिए ग्लोबल आवाज़ के विज़न और सत्यनिष्ठ समाचार मानकों के बारे में।",
    ogImage: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary",
    robots: "index, follow",
    jsonLdType: "WebPage"
  }
];

export const DEFAULT_SEO_PAGES: SeoPageConfig[] = [
  ...BASE_SEO_PAGES,
  ...generateSubTabSeoConfigs(),
  ...generateStateSeoConfigs()
];

export const SEO_STORAGE_KEY = "ga_seo_settings";

import { prisma } from "./prisma";

export async function getAllSeoConfigs(): Promise<SeoPageConfig[]> {
  try {
    let rawData: any = null;

    if (typeof window === "undefined") {
      // SERVER-SIDE: Fast, direct Prisma DB query (no HTTP loopback or invalid relative URL errors)
      const setting = await prisma.siteSetting.findUnique({
        where: { key: "seo_settings_data" },
      });
      if (setting && setting.value) {
        try {
          rawData = JSON.parse(setting.value);
        } catch (e) {
          console.error("Error parsing SEO settings JSON from DB:", e);
        }
      }
    } else {
      // CLIENT-SIDE: Fetch from API endpoint
      const res = await fetch("/api/v1/seo-settings", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success) {
          rawData = json.data;
        }
      }
    }

    if (Array.isArray(rawData) && rawData.length > 0) {
      const parsedMap = new Map<string, SeoPageConfig>();
      
      rawData.forEach((item: SeoPageConfig) => {
        if (!item || !item.path) return;
        let cleanPath = item.path;
        if (cleanPath.startsWith("/india/")) {
          cleanPath = "/" + cleanPath.replace("/india/", "");
        }
        const cleanItem = {
          ...item,
          path: cleanPath,
          canonicalUrl: `https://www.globalawaaz.com${cleanPath}`
        };
        parsedMap.set(cleanPath, cleanItem);
      });

      const merged = DEFAULT_SEO_PAGES.map((def) => {
        const found = parsedMap.get(def.path);
        return found ? { ...def, ...found } : def;
      });

      const defaultPaths = new Set(DEFAULT_SEO_PAGES.map((d) => d.path));
      const extraCustom = Array.from(parsedMap.values()).filter(
        (p) => !defaultPaths.has(p.path) && !p.path.startsWith("/india/")
      );

      return [...merged, ...extraCustom];
    }
  } catch (e) {
    console.error("Error in getAllSeoConfigs:", e);
  }
  return DEFAULT_SEO_PAGES;
}

export async function getSeoConfigForPath(currentPath: string): Promise<SeoPageConfig> {
  const configs = await getAllSeoConfigs();
  const normalized = currentPath === "" ? "/" : currentPath;

  const exact = configs.find((c) => c.path === normalized);
  if (exact) return exact;

  // State route alias matching (/jharkhand <-> /india/jharkhand)
  let aliasPath = normalized;
  if (normalized.startsWith("/india/")) {
    aliasPath = "/" + normalized.replace("/india/", "");
  } else if (!normalized.slice(1).includes("/")) {
    aliasPath = "/india" + normalized;
  }
  const aliasMatch = configs.find((c) => c.path === aliasPath);
  if (aliasMatch) {
    return {
      ...aliasMatch,
      path: normalized,
      canonicalUrl: `https://www.globalawaaz.com${normalized}`
    };
  }

  // Prefix matching for dynamic section/article pages
  if (normalized.startsWith("/article/")) {
    return {
      path: normalized,
      pageName: "Article Reading Page",
      metaTitle: "Exclusive News Story — Global Awaaz",
      metaDescription: "Read in-depth breaking coverage, expert analysis, and updates on Global Awaaz.",
      keywords: "Article, News Story, Breaking News, Live Updates, Editorial Report",
      canonicalUrl: `https://www.globalawaaz.com${normalized}`,
      ogTitle: "Exclusive Coverage — Global Awaaz",
      ogDescription: "In-depth investigative report and analytical news coverage.",
      ogImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80",
      ogType: "article",
      twitterCard: "summary_large_image",
      robots: "index, follow",
      jsonLdType: "NewsArticle"
    };
  }

  // Dynamic fallback for any category / state / section route (e.g. /jharkhand, /bihar, /up, /news, etc.)
  const rawName = normalized.slice(1).split("/").pop() || "News";
  const sectionName = rawName.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  
  return {
    path: normalized,
    pageName: `${sectionName} News`,
    metaTitle: `${sectionName} News (मुख्य समाचार) | Global Awaaz`,
    metaDescription: `${sectionName} से जुड़ी ताज़ा ख़बरें, मुख्य अपडेट्स और विश्लेषणात्मक रिपोर्ट पढ़ें ग्लोबल आवाज़ पर।`,
    keywords: `${sectionName}, ${sectionName} news, Breaking News, Global Awaaz`,
    canonicalUrl: `https://www.globalawaaz.com${normalized}`,
    ogTitle: `${sectionName} — ताज़ा समाचार व लाइव अपडेट्स | Global Awaaz`,
    ogDescription: `${sectionName} क्षेत्र की हर छोटी-बड़ी खबर सबसे पहले और सबसे सटीक अंदाज में पढ़ें।`,
    ogImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots: "index, follow",
    jsonLdType: "CollectionPage"
  };
}

export function calculateSeoScore(config: SeoPageConfig): { score: number; label: string; tips: string[] } {
  let score = 0;
  const tips: string[] = [];

  // 1. Meta Title (Max 25 pts)
  const titleLen = config.metaTitle ? config.metaTitle.length : 0;
  if (titleLen >= 45 && titleLen <= 65) {
    score += 25;
  } else if (titleLen > 0 && titleLen < 45) {
    score += 15;
    tips.push("Meta title is too short (recommended 45–65 characters).");
  } else if (titleLen > 65) {
    score += 18;
    tips.push("Meta title exceeds 65 characters and may get truncated on Google SERP.");
  } else {
    tips.push("Meta title is missing.");
  }

  // 2. Meta Description (Max 25 pts)
  const descLen = config.metaDescription ? config.metaDescription.length : 0;
  if (descLen >= 120 && descLen <= 165) {
    score += 25;
  } else if (descLen > 0 && descLen < 120) {
    score += 15;
    tips.push("Meta description is too brief (recommended 120–165 characters).");
  } else if (descLen > 165) {
    score += 18;
    tips.push("Meta description exceeds 165 characters.");
  } else {
    tips.push("Meta description is missing.");
  }

  // 3. Keywords & Canonical (Max 20 pts)
  if (config.keywords && config.keywords.split(",").length >= 3) {
    score += 10;
  } else {
    tips.push("Add at least 3 relevant comma-separated target keywords.");
  }

  if (config.canonicalUrl && config.canonicalUrl.startsWith("http")) {
    score += 10;
  } else {
    tips.push("Canonical URL is missing or invalid.");
  }

  // 4. Open Graph Image & Title (Max 20 pts)
  if (config.ogImage && config.ogImage.length > 5) {
    score += 10;
  } else {
    tips.push("Social Share (OG) Image URL is missing.");
  }

  if (config.ogTitle && config.ogTitle.length > 10) {
    score += 10;
  } else {
    tips.push("Social Share (OG) Title is missing.");
  }

  // 5. Robots & Schema (Max 10 pts)
  if (config.robots) score += 5;
  if (config.jsonLdType) score += 5;

  let label = "Needs Work";
  if (score >= 90) label = "Optimal SEO (A+)";
  else if (score >= 75) label = "Good SEO (B)";
  else if (score >= 50) label = "Average (C)";

  return { score, label, tips };
}

export async function saveSeoConfigs(list: SeoPageConfig[]): Promise<boolean> {
  try {
    const cleanList = list.map((item) => ({
      path: item.path,
      pageName: item.pageName,
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
      keywords: item.keywords || "",
      canonicalUrl: item.canonicalUrl || "",
      ogTitle: item.ogTitle || "",
      ogDescription: item.ogDescription || "",
      ogImage: item.ogImage || "",
      ogType: item.ogType || "website",
      twitterCard: item.twitterCard || "summary_large_image",
      robots: item.robots || "index, follow",
      jsonLdType: item.jsonLdType || "WebPage",
      isSubTab: !!item.isSubTab,
      isState: !!item.isState,
      parentCategory: item.parentCategory || ""
    }));

    const res = await fetch("/api/v1/seo-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanList)
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("ga_seo_updated"));
        }
        return true;
      }
    }
  } catch (e) {
    console.error("Failed saving SEO configs:", e);
  }
  return false;
}
