// =============================================================================
// Homepage — Server Component Wrapper
// Exports generateMetadata so Next.js injects the correct <title> and
// Open Graph / Twitter tags from the Admin SEO panel DB settings.
// The actual interactive UI is rendered by HomeClient (Client Component).
// =============================================================================

import type { Metadata } from "next";
import { getSeoConfigForPath } from "@/lib/seo";
import HomeClient from "./HomeClient";

// Revalidate this page every 60 seconds at most.
// When admin saves SEO settings, revalidatePath("/") is called in the
// SEO settings API → the page cache is purged immediately on next request.
export const revalidate = 60;

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

export default function Page() {
  return <HomeClient />;
}
