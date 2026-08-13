import React from "react";
import type { Metadata } from "next";
import SectionClientContent from "@/components/SectionClientContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }> | { section: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSection = resolvedParams?.section || "news";
  const section = rawSection.toLowerCase();
  const formattedTitle = section.charAt(0).toUpperCase() + section.slice(1);
  const canonicalUrl = `https://www.globalawaaz.com/${section}`;

  const sectionKeywords = [
    `${formattedTitle} News`,
    `${formattedTitle} समाचार`,
    `${formattedTitle} ख़बरें`,
    "GLOBAL AWAAZ",
    "ग्लोबल आवाज़",
    "Breaking News Hindi",
    "Latest Updates"
  ];

  return {
    title: `${formattedTitle} News - GLOBAL AWAAZ | ताज़ा ख़बरें`,
    description: `Latest ${formattedTitle} news, editorials, analysis, and updates on GLOBAL AWAAZ.`,
    keywords: sectionKeywords,
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
      title: `${formattedTitle} News | GLOBAL AWAAZ`,
      description: `Latest ${formattedTitle} news, editorials, analysis, and updates on GLOBAL AWAAZ.`,
      url: canonicalUrl,
      siteName: "GLOBAL AWAAZ",
      locale: "hi_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${formattedTitle} News | GLOBAL AWAAZ`,
      description: `Latest ${formattedTitle} news, editorials, analysis, and updates on GLOBAL AWAAZ.`,
    },
  };
}

export default function SectionPage() {
  return <SectionClientContent />;
}
