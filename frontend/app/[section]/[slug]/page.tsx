import { Metadata } from "next";
import ArticleClientContent, { ArticleDetail } from "@/components/ArticleClientContent";
import SectionClientContent from "@/components/SectionClientContent";
import { findDefaultArticle, stripHtml } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { cleanMediaUrl } from "@/lib/mediaUpload";
import { generateNewsArticleSchema, generateBreadcrumbSchema } from "@/lib/schema";
import { MASTER_SUB_CATEGORIES } from "@/lib/subCategories";
import { INDIAN_STATES } from "@/lib/states";

// Build a reverse map: sub-slug -> { category, subName }
function buildSubCategorySlugMap(): Map<string, { category: string; subName: string }> {
  const map = new Map<string, { category: string; subName: string }>();
  for (const [category, subs] of Object.entries(MASTER_SUB_CATEGORIES)) {
    for (const sub of subs) {
      const enSlug = sub.en.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const hiSlug = sub.hi.toLowerCase().trim().replace(/[^a-z0-9\u0900-\u097F]+/g, "-").replace(/^-+|-+$/g, "");
      map.set(`${category}/${enSlug}`, { category, subName: sub.en });
      if (hiSlug) map.set(`${category}/${hiSlug}`, { category, subName: sub.en });
    }
  }
  return map;
}

const SUB_CATEGORY_SLUG_MAP = buildSubCategorySlugMap();

function isSubCategoryRoute(section: string, slug: string): string | null {
  const secLower = section.toLowerCase();
  const slugLower = slug.toLowerCase();
  const key = `${secLower}/${slugLower}`;

  const match = SUB_CATEGORY_SLUG_MAP.get(key);
  if (match) return match.subName;

  // Search across all MASTER_SUB_CATEGORIES for matching subcategory slug
  for (const [category, subs] of Object.entries(MASTER_SUB_CATEGORIES)) {
    if (secLower.includes(category) || category.includes(secLower)) {
      for (const sub of subs) {
        const enSlug = sub.en.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        if (enSlug === slugLower || sub.en.toLowerCase() === slugLower) {
          return sub.en;
        }
      }
    }
  }

  return null;
}

function isStateRoute(slug: string): boolean {
  const lower = slug.toLowerCase();
  return !!INDIAN_STATES.find(
    (st) =>
      st.slug === lower ||
      st.code.toLowerCase() === lower ||
      st.nameEn.toLowerCase() === lower
  );
}

import { getArticleBySlug } from "@/lib/services/articles";

async function getArticleData(slug: string): Promise<ArticleDetail | null> {
  const targetSlug = decodeURIComponent(slug).trim().toLowerCase();

  // 1. Direct Server-Side DB query for fast, reliable SSR & Social Media metadata
  try {
    const dbArticle = await getArticleBySlug(targetSlug);
    if (dbArticle) {
      return dbArticle as unknown as ArticleDetail;
    }
  } catch (err) {
    console.error("Direct DB fetch error in getArticleData:", err);
  }

  // 2. Try backend API with absolute URL for SSR fallback
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.globalawaaz.com").replace(/\/$/, "");
    const fetchUrl = `${baseUrl}/api/v1/articles/${encodeURIComponent(targetSlug)}`;
    const res = await fetch(fetchUrl, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      if (json?.data) return json.data;
    }
  } catch (err) {
    // API network fetch fallback
  }

  // 3. Fall back to default articles
  const defaultFound = findDefaultArticle(targetSlug);
  if (defaultFound) {
    return defaultFound as ArticleDetail;
  }

  return null;
}

function formatAbsoluteImageUrl(imgUrl?: string): string {
  if (!imgUrl || typeof imgUrl !== "string" || imgUrl.trim().length === 0 || imgUrl.startsWith("data:image")) {
    return "https://www.globalawaaz.com/logo.png";
  }

  let url = imgUrl.trim();

  // Fix malformed protocols from database (https// → https://, http// → http://)
  if (url.startsWith("https//")) url = url.replace("https//", "https://");
  if (url.startsWith("http//")) url = url.replace("http//", "http://");

  url = cleanMediaUrl(url);

  // Construct absolute image target URL
  let targetUrl = url;
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    const cleanPath = targetUrl.startsWith("/") ? targetUrl : `/${targetUrl}`;
    targetUrl = `https://www.globalawaaz.com${cleanPath}`;
  } else if (targetUrl.startsWith("https://globalawaaz.com")) {
    targetUrl = targetUrl.replace("https://globalawaaz.com", "https://www.globalawaaz.com");
  }

  // Route through dynamic JPEG converter API so WhatsApp & social platforms receive a guaranteed 1200x630 JPEG image
  return `https://www.globalawaaz.com/api/v1/og-image?img=${encodeURIComponent(targetUrl)}`;
}

function buildDualLanguageSeoTitle(article: ArticleDetail, slug: string): string {
  const mainTitle = article.title ? article.title.trim() : "";
  // Brand suffix takes 15 chars: " | GLOBAL AWAAZ"
  if (mainTitle.length <= 48) {
    return `${mainTitle} | GLOBAL AWAAZ`;
  }
  if (mainTitle.length > 64) {
    return `${mainTitle.substring(0, 61).trim()}...`;
  }
  return mainTitle;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; slug: string }> | { section: string; slug: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const section = (resolvedParams?.section || "article").toLowerCase();
  const rawParam = resolvedParams?.slug
    ? Array.isArray(resolvedParams.slug)
      ? resolvedParams.slug[0]
      : resolvedParams.slug
    : "article";
  const slug = decodeURIComponent(rawParam).trim().toLowerCase();
  const canonicalUrl = `https://www.globalawaaz.com/${section}/${slug}`;

  // If this is a sub-category URL like /education/board-exams
  const matchedSubName = isSubCategoryRoute(section, slug);
  if (matchedSubName) {
    const sectionTitle = section.charAt(0).toUpperCase() + section.slice(1);
    return {
      title: `${matchedSubName} - ${sectionTitle} News | GLOBAL AWAAZ`,
      description: `Read latest ${matchedSubName} news and updates in ${sectionTitle} on GLOBAL AWAAZ.`,
      alternates: { canonical: canonicalUrl },
      robots: { index: true, follow: true },
      openGraph: {
        title: `${matchedSubName} | GLOBAL AWAAZ`,
        description: `Latest ${matchedSubName} coverage and analysis.`,
        url: canonicalUrl,
        siteName: "GLOBAL AWAAZ",
        locale: "hi_IN",
        type: "website",
      },
    };
  }

  const article = await getArticleData(slug);

  if (!article) {
    return {
      title: "GLOBAL AWAAZ - LOCAL से GLOBAL तक | Breaking News",
      description: "देश-दुनिया और आपके अपने क्षेत्र की हर छोटी-बड़ी खबर सबसे पहले और सबसे सटीक अंदाज में पढ़ें।",
      alternates: { canonical: canonicalUrl },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
    };
  }

function extractDynamicArticleKeywords(article: any, sectionName: string): string[] {
  const keywordsSet = new Set<string>();

  // 1. Admin custom SEO keywords if present
  if (article?.seoKeywords && typeof article.seoKeywords === "string" && article.seoKeywords.trim()) {
    article.seoKeywords.split(",").map((k: string) => k.trim()).filter(Boolean).forEach((k: string) => keywordsSet.add(k));
  }

  // 2. Add Focus Keyword
  if (article?.focusKeyword && typeof article.focusKeyword === "string" && article.focusKeyword.trim()) {
    keywordsSet.add(article.focusKeyword.trim());
  }

  // 3. Extract headline entities & words
  if (article?.title) {
    const rawTitle = article.title.trim();
    keywordsSet.add(rawTitle);
    const stopWords = new Set(["और", "का", "की", "के", "में", "पर", "ने", "से", "को", "यह", "वह", "साथ", "हो", "है", "हैं", "था", "थे", "गया", "कर", "बोले", "कहा", "दिए", "रहा", "रहे", "news", "with", "from", "that", "this", "have", "said", "after"]);
    const cleanTitle = rawTitle.replace(/[^\w\s\u0900-\u097F]/gi, " ");
    const tokens = cleanTitle.split(/\s+/).filter((t: string) => t.length > 2 && !stopWords.has(t.toLowerCase()));
    tokens.forEach((t: string) => keywordsSet.add(t));
  }

  // 4. Category & Location tags
  const cat = article?.category?.name || sectionName || "Top News";
  keywordsSet.add(`${cat} समाचार`);
  if (article?.subCategory && article.subCategory !== "General") keywordsSet.add(article.subCategory);
  if (article?.state && article.state !== "National" && article.state !== "All") {
    keywordsSet.add(`${article.state} News`);
    keywordsSet.add(`${article.state} समाचार`);
  }
  if (article?.district && article.district !== "All") keywordsSet.add(`${article.district} खबर`);

  // 5. Brand tags
  keywordsSet.add("GLOBAL AWAAZ");
  keywordsSet.add("ग्लोबल आवाज़");

  return Array.from(keywordsSet).slice(0, 15);
}

  const seoTitle = buildDualLanguageSeoTitle(article, slug);
  const rawDesc = stripHtml(article.summary || article.body || article.title || "");
  let description = rawDesc;
  if (description.length > 158) {
    description = `${description.substring(0, 155).trim()}...`;
  }
  const imageUrl = formatAbsoluteImageUrl(article.featuredImage);
  const articleKeywords = extractDynamicArticleKeywords(article, section);

  return {
    title: seoTitle,
    description: description,
    keywords: articleKeywords,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: seoTitle,
      description: description,
      url: canonicalUrl,
      siteName: "GLOBAL AWAAZ",
      locale: article.language === "HI" ? "hi_IN" : "en_IN",
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: article.title,
        },
      ],
      type: "article",
      publishedTime: article.createdAt ? new Date(article.createdAt).toISOString() : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: description,
      images: [imageUrl],
      site: "@globalawaaz",
      creator: "@globalawaaz",
    },
  };
}

export default async function CategoryArticlePage({
  params,
}: {
  params: Promise<{ section: string; slug: string }> | { section: string; slug: string };
}) {
  const resolvedParams = await params;
  const section = (resolvedParams?.section || "article").toLowerCase();
  const rawParam = resolvedParams?.slug
    ? Array.isArray(resolvedParams.slug)
      ? resolvedParams.slug[0]
      : resolvedParams.slug
    : "article";
  const slug = decodeURIComponent(rawParam).trim().toLowerCase();

  // If /education/board-exams or /sports/cricket → render section filter page
  const matchedSubName = isSubCategoryRoute(section, slug);
  if (matchedSubName) {
    return <SectionClientContent section={section} initialSubCat={matchedSubName} />;
  }

  const article = await getArticleData(slug);

  let newsArticleSchema = null;
  let breadcrumbSchema = null;

  if (article) {
    const catSlug = article.category?.slug ? article.category.slug.toLowerCase() : section;

    newsArticleSchema = generateNewsArticleSchema({
      title: article.title,
      slug: `${catSlug}/${slug}`,
      summary: article.summary,
      body: article.body,
      featuredImage: article.featuredImage,
      category: article.category ? { name: article.category.name, slug: catSlug } : undefined,
      author: article.author ? { name: article.author.name } : undefined,
      createdAt: article.createdAt,
      language: article.language as "HI" | "EN",
    });

    breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Home", item: "/" },
      { name: article.category?.name || section, item: `/${catSlug}` },
      { name: article.title, item: `/${catSlug}/${slug}` },
    ]);
  }

  return (
    <>
      {newsArticleSchema && (
        <script
          id={`jsonld-article-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          id={`jsonld-breadcrumb-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <ArticleClientContent slug={slug} initialArticle={article} />
    </>
  );
}
