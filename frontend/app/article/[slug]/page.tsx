import { Metadata } from "next";
import ArticleClientContent, { ArticleDetail } from "@/components/ArticleClientContent";
import { findDefaultArticle, stripHtml } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { generateNewsArticleSchema, generateBreadcrumbSchema } from "@/lib/schema";

async function getArticleData(slug: string): Promise<ArticleDetail | null> {
  const targetSlug = decodeURIComponent(slug).trim().toLowerCase();
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.globalawaaz.com").replace(/\/$/, "");

  // 1. Try backend API with absolute URL for SSR
  try {
    const fetchUrl = `${baseUrl}/api/v1/articles/${encodeURIComponent(targetSlug)}`;
    const res = await fetch(fetchUrl, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      if (json?.data) return json.data;
    }
  } catch (err) {
    // API network fetch fallback
  }

  // 2. Fall back to default articles
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

  const seoTitle = buildDualLanguageSeoTitle(article, slug);
  const rawDesc = stripHtml(article.summary || article.body || article.title || "");
  let description = rawDesc;
  if (description.length > 158) {
    description = `${description.substring(0, 155).trim()}...`;
  }
  const imageUrl = formatAbsoluteImageUrl(article.featuredImage);

  return {
    title: seoTitle,
    description: description,
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
