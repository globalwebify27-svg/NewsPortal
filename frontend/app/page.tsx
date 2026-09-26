// =============================================================================
// Homepage — Server Component Wrapper
// Exports generateMetadata so Next.js injects the correct <title> and
// Open Graph / Twitter tags from the Admin SEO panel DB settings.
// The actual interactive UI is rendered by HomeClient (Client Component).
// =============================================================================

import type { Metadata } from "next";
import { getSeoConfigForPath } from "@/lib/seo";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSeoConfigForPath("/");

  const keywordsList = config.keywords
    ? config.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : ["Global Awaaz", "Breaking News Hindi", "Jharkhand News", "Hindi News Portal"];

  const pageTitle =
    config.metaTitle ||
    "GLOBAL AWAAZ - LOCAL से GLOBAL तक | Breaking Hindi & English News";
  const pageDesc =
    config.metaDescription ||
    "ग्लोबल आवाज़ पोर्टल पर पाएं भारत, झारखंड, शिक्षा, व्यापार, तकनीक, खेल, मनोरंजन और विश्व राजनीति की ताज़ा खबरें।";
  const ogTitle = config.ogTitle || pageTitle;
  const ogDesc = config.ogDescription || pageDesc;
  const ogImg = config.ogImage || "https://www.globalawaaz.com/logo.png";
  const canonicalUrl = config.canonicalUrl || "https://www.globalawaaz.com/";

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

import { getPublicArticles } from "@/lib/services/articles";
import { getAdSettings, getLogoSettings } from "@/lib/services/settings";
import { Article } from "@/types/article";

export default async function Page() {
  let initialArticles: Article[] = [];
  let initialAdSettings: Record<string, string> = {};
  let initialLogoSettings: Record<string, string> = {};

  try {
    const [articlesRes, adSettingsRes, logoSettingsRes] = await Promise.allSettled([
      getPublicArticles({ limit: 60 }),
      getAdSettings(),
      getLogoSettings(),
    ]);

    if (articlesRes.status === "fulfilled" && articlesRes.value?.articles) {
      initialArticles = JSON.parse(JSON.stringify(articlesRes.value.articles));
    }
    if (adSettingsRes.status === "fulfilled" && adSettingsRes.value) {
      initialAdSettings = JSON.parse(JSON.stringify(adSettingsRes.value));
    }
    if (logoSettingsRes.status === "fulfilled" && logoSettingsRes.value) {
      initialLogoSettings = JSON.parse(JSON.stringify(logoSettingsRes.value));
    }
  } catch (e) {
    console.warn("SSR initial articles fetch error:", e);
  }

  return (
    <HomeClient
      initialArticles={initialArticles}
      initialAdSettings={initialAdSettings}
      initialLogoSettings={initialLogoSettings}
    />
  );
}

