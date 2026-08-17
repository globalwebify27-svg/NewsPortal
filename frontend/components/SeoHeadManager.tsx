"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSeoConfigForPath, SeoPageConfig } from "@/lib/seo";

export default function SeoHeadManager() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    // Helper to create or update meta tag
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      if (!content) return;
      let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Always enforce index, follow across client DOM
    setMetaTag("name", "robots", "index, follow");

    const pathSegments = pathname.split("/").filter(Boolean);
    const nonArticlePrefixes = [
      "admin", "api", "login", "categories", "epaper", "about", "contact",
      "india", "world", "education", "business", "technology", "sports",
      "entertainment", "science", "health", "opinion", "videos", "careers", "advertise", "top-news"
    ];
    
    const isArticleRoute = pathname.startsWith("/article/") || 
      (pathSegments.length >= 2 && !nonArticlePrefixes.includes(pathSegments[0]) && pathSegments[1].length > 35);

    if (isArticleRoute) {
      return;
    }

    async function applySeoMetadata() {
      const config: SeoPageConfig = await getSeoConfigForPath(pathname);

      // 1. Update Title
      if (config.metaTitle) {
        document.title = config.metaTitle;
      }

      // Helper helper to create or update meta tag
      const setMetaTag = (attrName: string, attrValue: string, content: string) => {
        if (!content) return;
        let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
        if (!element) {
          element = document.createElement("meta");
          element.setAttribute(attrName, attrValue);
          document.head.appendChild(element);
        }
        element.setAttribute("content", content);
      };

      // Helper for link tags (Canonical)
      const setLinkTag = (rel: string, href: string) => {
        if (!href) return;
        let element = document.head.querySelector(`link[rel="${rel}"]`);
        if (!element) {
          element = document.createElement("link");
          element.setAttribute("rel", rel);
          document.head.appendChild(element);
        }
        element.setAttribute("href", href);
      };

      // 2. Standard Meta Tags
      setMetaTag("name", "description", config.metaDescription);
      setMetaTag("name", "keywords", config.keywords);
      setMetaTag("name", "author", "GLOBAL AWAAZ");
      setMetaTag("name", "publisher", "GLOBAL AWAAZ");
      setMetaTag("name", "robots", config.robots || "index, follow");

      // Remove any link rel="author" to prevent browser extensions from showing URL instead of text name
      const oldAuthorLink = document.head.querySelector('link[rel="author"]');
      if (oldAuthorLink) oldAuthorLink.remove();
      
      // Ensure canonicalUrl always matches the exact current page URL and has www prefix
      let canonicalUrl = config.canonicalUrl || `https://www.globalawaaz.com${pathname}`;

      // If page is not homepage ("/") but canonicalUrl points to homepage root ("https://www.globalawaaz.com" or "https://www.globalawaaz.com/"), correct it to exact page URL
      if (pathname !== "/" && (canonicalUrl === "https://www.globalawaaz.com" || canonicalUrl === "https://www.globalawaaz.com/")) {
        canonicalUrl = `https://www.globalawaaz.com${pathname}`;
      }

      if (canonicalUrl.startsWith("https://globalawaaz.com")) {
        canonicalUrl = canonicalUrl.replace("https://globalawaaz.com", "https://www.globalawaaz.com");
      }
      setLinkTag("canonical", canonicalUrl);

      // 3. Open Graph Tags
      setMetaTag("property", "og:title", config.ogTitle || config.metaTitle);
      setMetaTag("property", "og:description", config.ogDescription || config.metaDescription);
      setMetaTag("property", "og:image", config.ogImage);
      setMetaTag("property", "og:url", canonicalUrl);
      setMetaTag("property", "og:type", config.ogType || "website");
      setMetaTag("property", "og:site_name", "GLOBAL AWAAZ");

      // 4. Twitter Card Tags
      setMetaTag("name", "twitter:card", config.twitterCard || "summary_large_image");
      setMetaTag("name", "twitter:title", config.ogTitle || config.metaTitle);
      setMetaTag("name", "twitter:description", config.ogDescription || config.metaDescription);
      setMetaTag("name", "twitter:image", config.ogImage);

      // 5. Dynamic JSON-LD Structured Data Schema Injection
      let schemaScript = document.head.querySelector("#ga-schema-jsonld");
      if (!schemaScript) {
        schemaScript = document.createElement("script");
        schemaScript.setAttribute("id", "ga-schema-jsonld");
        schemaScript.setAttribute("type", "application/ld+json");
        document.head.appendChild(schemaScript);
      }

      let schemaData: any = {};
      if (config.jsonLdType === "NewsMediaOrganization") {
        schemaData = {
          "@context": "https://schema.org",
          "@type": "NewsMediaOrganization",
          "name": "GLOBAL AWAAZ",
          "url": "https://www.globalawaaz.com",
          "logo": "https://www.globalawaaz.com/logo.png",
          "sameAs": [
            "https://facebook.com/globalawaaz",
            "https://twitter.com/globalawaaz",
            "https://youtube.com/@globalawaaz"
          ]
        };
      } else {
        schemaData = {
          "@context": "https://schema.org",
          "@type": config.jsonLdType || "WebPage",
          "name": config.metaTitle,
          "description": config.metaDescription,
          "url": canonicalUrl,
          "publisher": {
            "@type": "Organization",
            "name": "GLOBAL AWAAZ",
            "logo": "https://www.globalawaaz.com/logo.png"
          }
        };
      }

      schemaScript.textContent = JSON.stringify(schemaData, null, 2);
    }

    applySeoMetadata();
    window.addEventListener("ga_seo_updated", applySeoMetadata);
    return () => {
      window.removeEventListener("ga_seo_updated", applySeoMetadata);
    };
  }, [pathname]);

  return null; // Headless component
}
