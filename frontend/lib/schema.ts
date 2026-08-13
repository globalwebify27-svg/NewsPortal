/**
 * Schema.org JSON-LD Generators for GLOBAL AWAAZ News Portal
 * Compliant with Google News, Google Search Rich Results, and Schema.org standards.
 */

export const SITE_URL = "https://www.globalawaaz.com";
export const SITE_NAME = "GLOBAL AWAAZ";
export const SITE_TAGLINE = "LOCAL से GLOBAL तक";
export const SITE_LOGO = "https://www.globalawaaz.com/logo.png";

export interface SchemaArticle {
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  featuredImage?: string;
  category?: { name: string; slug: string };
  author?: { name: string; role?: string };
  createdAt?: string;
  updatedAt?: string;
  language?: "HI" | "EN";
}

/**
 * Generate Organization Schema
 */
export function generateNewsOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Global Awaaz",
    "alternateName": "Global Awaaz Hindi News",
    "url": "https://www.globalawaaz.com/",
    "logo": "https://www.globalawaaz.com/uploads/logo--2-_1785996238254.png",
    "sameAs": [
      "https://www.facebook.com/GlobalAwaaz/",
      "https://www.instagram.com/global.awaaz",
      "https://www.youtube.com/@globalawaaz-q7z",
      "https://www.linkedin.com/company/global-awaaz/"
    ]
  };
}

/**
 * Generate WebSite Schema with SearchAction
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Global Awaaz",
    "alternateName": [
      "Global Awaaz News",
      "Global Awaaz Hindi News"
    ],
    "url": "https://www.globalawaaz.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.globalawaaz.com/search?search_term_string={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate NewsArticle JSON-LD Schema for individual news articles
 */
export function generateNewsArticleSchema(article: SchemaArticle) {
  const articleUrl = `${SITE_URL}/article/${article.slug}`;
  const publishDate = article.createdAt
    ? new Date(article.createdAt).toISOString()
    : new Date().toISOString();
  const modifiedDate = article.updatedAt
    ? new Date(article.updatedAt).toISOString()
    : publishDate;

  const description = article.summary || (article.body ? article.body.substring(0, 160).replace(/<[^>]*>?/gm, '') : article.title);

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "headline": article.title.length > 110 ? article.title.substring(0, 107) + "..." : article.title,
    "description": description,
    "inLanguage": article.language === "EN" ? "en-IN" : "hi-IN",
    "image": article.featuredImage
      ? [article.featuredImage]
      : [`${SITE_URL}/logo.png`],
    "datePublished": publishDate,
    "dateModified": modifiedDate,
    "author": {
      "@type": "Organization",
      "name": article.author?.name || "GLOBAL AWAAZ",
      "url": `${SITE_URL}/about`
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": SITE_NAME,
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": SITE_LOGO,
        "width": 600,
        "height": 60
      }
    },
    "isAccessibleForFree": true,
    "articleSection": article.category?.name || "News"
  };
}

/**
 * Generate BreadcrumbList JSON-LD Schema
 */
export function generateBreadcrumbSchema(
  items: { name: string; item: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((it, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": it.name,
      "item": it.item.startsWith("http") ? it.item : `${SITE_URL}${it.item}`
    }))
  };
}
