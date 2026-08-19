import React from "react";
import type { Metadata } from "next";
import SectionClientContent from "@/components/SectionClientContent";
import { getSeoConfigForPath } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }> | { section: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSection = resolvedParams?.section || "news";
  const section = rawSection.toLowerCase();
  const path = `/${section}`;
  const fallbackCanonicalUrl = `https://www.globalawaaz.com${path}`;

  // Fetch dynamic/saved Admin SEO config for this section or state route
  const config = await getSeoConfigForPath(path);

  const keywordsList = config.keywords
    ? config.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [
        `${section} News`,
        `${section} समाचार`,
        "GLOBAL AWAAZ",
        "ग्लोबल आवाज़",
        "Breaking News Hindi",
      ];

  const pageTitle = config.metaTitle || `${section.charAt(0).toUpperCase() + section.slice(1)} News - GLOBAL AWAAZ | ताज़ा ख़बरें`;
  const pageDesc = config.metaDescription || `Latest ${section} news, editorials, analysis, and updates on GLOBAL AWAAZ.`;
  const ogTitle = config.ogTitle || pageTitle;
  const ogDesc = config.ogDescription || pageDesc;
  const ogImg = config.ogImage || "https://www.globalawaaz.com/logo.png";
  const canonicalUrl = config.canonicalUrl || fallbackCanonicalUrl;

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: keywordsList,
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
      title: ogTitle,
      description: ogDesc,
      url: canonicalUrl,
      siteName: "GLOBAL AWAAZ",
      locale: "hi_IN",
      type: (config.ogType as any) || "website",
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: (config.twitterCard as any) || "summary_large_image",
      title: ogTitle,
      description: ogDesc,
      images: [ogImg],
      site: "@globalawaaz",
      creator: "@globalawaaz",
    },
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }> | { section: string };
}) {
  const resolvedParams = await params;
  return <SectionClientContent section={resolvedParams?.section} />;
}
