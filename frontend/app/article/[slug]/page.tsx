import { Metadata } from "next";
import ArticleClientContent, { ArticleDetail } from "@/components/ArticleClientContent";
import { findDefaultArticle, stripHtml } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { generateNewsArticleSchema, generateBreadcrumbSchema } from "@/lib/schema";
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
  if (!imgUrl || imgUrl.startsWith("data:image")) return "https://www.globalawaaz.com/logo.png";
  // Fix malformed protocols from database (https// → https://)
  let url = imgUrl;
  if (url.startsWith("https//")) url = url.replace("https//", "https://");
  if (url.startsWith("http//")) url = url.replace("http//", "http://");
  // Rewrite Hostinger internal URLs to main domain
  if (url.includes("yellowgreen-rook-384455.hostingersite.com")) {
    const path = url.replace("https://yellowgreen-rook-384455.hostingersite.com", "");
    return `https://www.globalawaaz.com${path.startsWith("/") ? path : `/${path}`}`;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (url.startsWith("https://globalawaaz.com")) {
      return url.replace("https://globalawaaz.com", "https://www.globalawaaz.com");
    }
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `https://www.globalawaaz.com${cleanPath}`;
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
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const rawParam = resolvedParams?.slug
    ? Array.isArray(resolvedParams.slug)
      ? resolvedParams.slug[0]
      : resolvedParams.slug
    : "article";
  const slug = decodeURIComponent(rawParam).trim().toLowerCase();
  const article = await getArticleData(slug);

  const canonicalUrl = `https://www.globalawaaz.com/article/${slug}`;

  if (!article) {
    return {
      title: "GLOBAL AWAAZ - LOCAL से GLOBAL तक | Breaking News",
      description: "देश-दुनिया और आपके अपने क्षेत्र की हर छोटी-बड़ी खबर सबसे पहले और सबसे सटीक अंदाज में पढ़ें।",
      alternates: {
        canonical: canonicalUrl,
      },
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

function extractDynamicArticleKeywords(article: any): string[] {
  const keywordsSet = new Set<string>();

  if (article?.seoKeywords && typeof article.seoKeywords === "string" && article.seoKeywords.trim()) {
    article.seoKeywords.split(",").map((k: string) => k.trim()).filter(Boolean).forEach((k: string) => keywordsSet.add(k));
  }

  if (article?.focusKeyword && typeof article.focusKeyword === "string" && article.focusKeyword.trim()) {
    keywordsSet.add(article.focusKeyword.trim());
  }

  if (article?.title) {
    const rawTitle = article.title.trim();
    keywordsSet.add(rawTitle);
    const stopWords = new Set(["और", "का", "की", "के", "में", "पर", "ने", "से", "को", "यह", "वह", "साथ", "हो", "है", "हैं", "था", "थे", "गया", "कर", "बोले", "कहा", "दिए", "रहा", "रहे", "news", "with", "from", "that", "this", "have", "said", "after"]);
    const cleanTitle = rawTitle.replace(/[^\w\s\u0900-\u097F]/gi, " ");
    const tokens = cleanTitle.split(/\s+/).filter((t: string) => t.length > 2 && !stopWords.has(t.toLowerCase()));
    tokens.forEach((t: string) => keywordsSet.add(t));
  }

  const cat = article?.category?.name || "Top News";
  keywordsSet.add(`${cat} समाचार`);
  if (article?.subCategory && article.subCategory !== "General") keywordsSet.add(article.subCategory);
  if (article?.state && article.state !== "National" && article.state !== "All") {
    keywordsSet.add(`${article.state} News`);
    keywordsSet.add(`${article.state} समाचार`);
  }
  if (article?.district && article.district !== "All") keywordsSet.add(`${article.district} खबर`);

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
  const articleKeywords = extractDynamicArticleKeywords(article);

  return {
    title: seoTitle,
    description: description,
    keywords: articleKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
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
          width: 1200,
          height: 630,
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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await params;
  const rawParam = resolvedParams?.slug
    ? Array.isArray(resolvedParams.slug)
      ? resolvedParams.slug[0]
      : resolvedParams.slug
    : "article";
  const slug = decodeURIComponent(rawParam).trim().toLowerCase();
  const article = await getArticleData(slug);

  let newsArticleSchema = null;
  let breadcrumbSchema = null;

  if (article) {
    newsArticleSchema = generateNewsArticleSchema({
      title: article.title,
      slug: slug,
      summary: article.summary,
      body: article.body,
      featuredImage: article.featuredImage,
      category: article.category ? { name: article.category.name, slug: article.category.slug || "news" } : undefined,
      author: article.author ? { name: article.author.name } : undefined,
      createdAt: article.createdAt,
      language: article.language as "HI" | "EN",
    });

    breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Home", item: "/" },
      { name: article.category?.name || "News", item: `/${article.category?.slug || "india"}` },
      { name: article.title, item: `/article/${slug}` },
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
