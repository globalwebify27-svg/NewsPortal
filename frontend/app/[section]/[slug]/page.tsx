import { Metadata } from "next";
import ArticleClientContent, { ArticleDetail } from "@/components/ArticleClientContent";
import SectionClientContent from "@/components/SectionClientContent";
import { findDefaultArticle, stripHtml } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { generateNewsArticleSchema, generateBreadcrumbSchema } from "@/lib/schema";
import { MASTER_SUB_CATEGORIES } from "@/lib/subCategories";
import { INDIAN_STATES } from "@/lib/states";

// Build a reverse map: sub-slug -> { category, subName }
function buildSubCategorySlugMap(): Map<string, { category: string; subName: string }> {
  const map = new Map<string, { category: string; subName: string }>();
  for (const [category, subs] of Object.entries(MASTER_SUB_CATEGORIES)) {
    for (const sub of subs) {
      const slug = sub.en.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      map.set(`${category}/${slug}`, { category, subName: sub.en });
    }
  }
  return map;
}

const SUB_CATEGORY_SLUG_MAP = buildSubCategorySlugMap();

function isSubCategoryRoute(section: string, slug: string): string | null {
  const key = `${section.toLowerCase()}/${slug.toLowerCase()}`;
  const match = SUB_CATEGORY_SLUG_MAP.get(key);
  return match ? match.subName : null;
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

function formatAbsoluteImageUrl(imgUrl?: string): string {
  if (!imgUrl) return "https://globalawaaz.com/global-awaaz-logo.jpg";
  // Rewrite Hostinger internal URLs to main domain
  if (imgUrl.includes("yellowgreen-rook-384455.hostingersite.com")) {
    const path = imgUrl.replace("https://yellowgreen-rook-384455.hostingersite.com", "");
    return `https://globalawaaz.com${path.startsWith("/") ? path : `/${path}`}`;
  }
  if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
    return imgUrl;
  }
  const cleanPath = imgUrl.startsWith("/") ? imgUrl : `/${imgUrl}`;
  return `https://globalawaaz.com${cleanPath}`;
}

function buildDualLanguageSeoTitle(article: ArticleDetail, slug: string): string {
  const mainTitle = article.title ? article.title.trim() : "";
  
  const cleanSlugWords = slug
    .replace(/-\d+$|-[a-z0-9]{6,}$/i, "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const isHindi = /[\u0900-\u097F]/.test(mainTitle);

  if (isHindi) {
    if (cleanSlugWords && cleanSlugWords.length > 3) {
      return `${mainTitle} - ${cleanSlugWords} | GLOBAL AWAAZ`;
    }
    return `${mainTitle} | GLOBAL AWAAZ`;
  } else {
    const categoryName = article.category?.name || "मुख्य समाचार";
    return `${mainTitle} - ${categoryName} | GLOBAL AWAAZ`;
  }
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
  const canonicalUrl = `https://globalawaaz.com/${section}/${slug}`;

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
      title: "Article Not Found | GLOBAL AWAAZ",
      description: "The requested article was not found on GLOBAL AWAAZ.",
      alternates: { canonical: canonicalUrl },
      robots: { index: false, follow: false },
    };
  }

  const seoTitle = buildDualLanguageSeoTitle(article, slug);
  const rawDesc = stripHtml(article.summary || article.body || "");
  const description = rawDesc.length > 160
    ? `${rawDesc.substring(0, 157).trim()}...`
    : (rawDesc || "ग्लोबल आवाज़ पर पढ़ें देश, राज्य, राजनीति, व्यापार और खेल की ताज़ा निष्पक्ष खबरें।");
  const imageUrl = formatAbsoluteImageUrl(article.featuredImage);

  return {
    title: seoTitle,
    description: description,
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
      images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
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
    return <SectionClientContent initialSubCat={matchedSubName} />;
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
