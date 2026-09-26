import React from "react";
import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari, Mukta } from "next/font/google";
import "./styles.css";
import "./globals.css";
import Script from "next/script";
import LayoutProvider from "@/components/LayoutProvider";
import { generateNewsOrganizationSchema, generateWebSiteSchema } from "@/lib/schema";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "600", "700"],
  preload: true,
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  display: "swap",
  variable: "--font-noto-devanagari",
  weight: ["400", "600", "700"],
  preload: true,
});

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  display: "swap",
  variable: "--font-mukta",
  weight: ["400", "600", "700"],
  preload: false,
});

const isNoIndex = process.env.NEXT_PUBLIC_ROBOTS_NOINDEX === "true";

import { getSeoConfigForPath } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSeoConfigForPath("/");

  const siteTitle =
    config?.metaTitle ||
    "GLOBAL AWAAZ - LOCAL से GLOBAL तक | Breaking Hindi & English News";
  const siteDesc =
    config?.metaDescription ||
    "GLOBAL AWAAZ (ग्लोबल आवाज़) — LOCAL से GLOBAL तक। देश-दुनिया, झारखंड, राजनीति, व्यापार, खेल, मनोरंजन, स्वास्थ्य और तकनीक की ताज़ा ब्रेकिंग खबरें व विस्तृत संपादकीय विश्लेषण।";

  const keywordsList = config?.keywords
    ? config.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [
        "GLOBAL AWAAZ",
        "ग्लोबल आवाज़",
        "LOCAL से GLOBAL तक",
        "Breaking Hindi News",
        "Jharkhand News",
        "India News Hindi",
        "World News Hindi",
        "Latest News Portal",
        "Hindi News Channel",
        "Digital e-Paper",
      ];

  const ogTitle = config?.ogTitle || siteTitle;
  const ogDesc = config?.ogDescription || siteDesc;
  const ogImg = config?.ogImage || "https://www.globalawaaz.com/logo.png";
  const canonicalUrl = config?.canonicalUrl || "https://www.globalawaaz.com/";

  return {
    metadataBase: new URL("https://www.globalawaaz.com"),
    title: {
      default: siteTitle,
      template: "%s",
    },
    description: siteDesc,
    keywords: keywordsList,
    authors: [{ name: "GLOBAL AWAAZ" }],
    creator: "GLOBAL AWAAZ",
    publisher: "GLOBAL AWAAZ",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "hi-IN": "https://www.globalawaaz.com/",
        "en-IN": "https://www.globalawaaz.com/",
      },
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
      type: "website",
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDesc,
      site: "@globalawaaz",
      creator: "@globalawaaz",
      images: [ogImg],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/logo.png", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    verification: {
      google: "XfHMvnanRRb4BCQfIflKveJH7FLoTwRtDO3FXvnBGHA",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = generateNewsOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="hi" data-theme="light" className={`${inter.variable} ${notoDevanagari.variable} ${mukta.variable}`} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="XfHMvnanRRb4BCQfIflKveJH7FLoTwRtDO3FXvnBGHA" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://yellowgreen-rook-384455.hostingersite.com" />
        <link rel="alternate" type="application/rss+xml" title="GLOBAL AWAAZ RSS Feed" href="https://globalawaaz.com/feed.xml" />
        <script
          id="jsonld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema, null, 2) }}
        />
        <script
          id="jsonld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema, null, 2) }}
        />
      </head>
      <body suppressHydrationWarning>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-R6RP9RSLML" strategy="lazyOnload" />
        <Script id="google-analytics-gtag" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R6RP9RSLML');
          `}
        </Script>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
