import { Metadata } from "next";
import ArticleClientContent, { ArticleDetail } from "@/components/ArticleClientContent";
import { findDefaultArticle, stripHtml } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { generateNewsArticleSchema, generateBreadcrumbSchema } from "@/lib/schema";

async function getArticleData(slug: string): Promise<ArticleDetail | null> {
  const targetSlug = decodeURIComponent(slug).trim().toLowerCase();

  // 1. Try backend API
  try {
    const res = await fetch(API_ENDPOINTS.articleBySlug(targetSlug), { next: { revalidate: 60 } });
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; slug: string }> | { section: string; slug: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const section = resolvedParams?.section || "article";
  const rawParam = resolvedParams?.slug
    ? Array.isArray(resolvedParams.slug)
      ? resolvedParams.slug[0]
      : resolvedParams.slug
    : "article";
  const slug = decodeURIComponent(rawParam).trim().toLowerCase();
  const article = await getArticleData(slug);

  const canonicalUrl = `https://www.globalawaaz.com/${section}/${slug}`;

  if (!article) {
    return {
      title: "Article Not Found | GLOBAL AWAAZ - LOCAL से GLOBAL तक",
      description: "The requested article was not found on GLOBAL AWAAZ.",
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
        },
      },
    };
  }

  const title = article.title;
  const description = stripHtml(article.summary || article.body?.substring(0, 160) || "");
  const imageUrl = article.featuredImage || "https://www.globalawaaz.com/logo.png";

  return {
    title: `${title} | GLOBAL AWAAZ - LOCAL से GLOBAL तक`,
    description: description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title: `${title} | GLOBAL AWAAZ`,
      description: description,
      url: canonicalUrl,
      siteName: "GLOBAL AWAAZ",
      locale: article.language === "HI" ? "hi_IN" : "en_IN",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "article",
      publishedTime: article.createdAt ? new Date(article.createdAt).toISOString() : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
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
  const section = resolvedParams?.section || "article";
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
