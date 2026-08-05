import { Metadata } from "next";
import ArticleClientContent, { ArticleDetail } from "@/components/ArticleClientContent";
import { findDefaultArticle, stripHtml } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";

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
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const rawParam = resolvedParams?.slug ? (Array.isArray(resolvedParams.slug) ? resolvedParams.slug[0] : resolvedParams.slug) : "article";
  const slug = decodeURIComponent(rawParam).trim().toLowerCase();
  const article = await getArticleData(slug);

  if (!article) {
    return {
      title: "Article Not Found | Global Awaaz",
      description: "The requested article was not found on Global Awaaz.",
    };
  }

  const title = article.title;
  const description = stripHtml(article.summary || article.body?.substring(0, 160) || "");
  const imageUrl = article.featuredImage || "https://globalawaaz.com/logo.png";
  const canonicalUrl = `https://globalawaaz.com/article/${slug}`;

  return {
    title: `${title} | Global Awaaz`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: canonicalUrl,
      siteName: "Global Awaaz",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await params;
  const rawParam = resolvedParams?.slug ? (Array.isArray(resolvedParams.slug) ? resolvedParams.slug[0] : resolvedParams.slug) : "article";
  const slug = decodeURIComponent(rawParam).trim().toLowerCase();
  const article = await getArticleData(slug);

  return <ArticleClientContent slug={slug} initialArticle={article} />;
}
