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
 * Generate NewsMediaOrganization Schema
 */
export function generateNewsOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${SITE_URL}/#organization`,
    "name": SITE_NAME,
    "alternateName": ["Global Awaaz News", "ग्लोबल आवाज़"],
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": SITE_LOGO,
      "width": 600,
      "height": 60
    },
    "slogan": SITE_TAGLINE,
    "sameAs": [
      "https://facebook.com/globalawaaz",
      "https://twitter.com/globalawaaz",
      "https://instagram.com/globalawaaz",
      "https://youtube.com/@globalawaaz"
    ],
    "knowsLanguage": ["hi", "en"],
    "publishingPrinciples": `${SITE_URL}/about`
  };
}

/**
 * Generate WebSite Schema with Sitelinks Searchbox
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "url": SITE_URL,
    "name": SITE_NAME,
    "alternateName": `${SITE_NAME} - ${SITE_TAGLINE}`,
    "publisher": {
      "@id": `${SITE_URL}/#organization`
    },
    "inLanguage": ["hi", "en"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/?search={search_term_string}`
      },
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
      "@type": "Person",
      "name": article.author?.name || "Global Awaaz Editorial Staff",
      "jobTitle": article.author?.role || "Journalist"
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
