import React from "react";
import type { Metadata } from "next";
import "./styles.css";
import "./admin.css";
import "./globals.css";
import LayoutProvider from "@/components/LayoutProvider";
import { generateNewsOrganizationSchema, generateWebSiteSchema } from "@/lib/schema";

const isNoIndex = process.env.NEXT_PUBLIC_ROBOTS_NOINDEX === "true";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.globalawaaz.com"),
  title: {
    default: "GLOBAL AWAAZ - LOCAL से GLOBAL तक | Breaking Hindi & English News",
    template: "%s | GLOBAL AWAAZ - LOCAL से GLOBAL तक",
  },
  description:
    "GLOBAL AWAAZ (ग्लोबल आवाज़) — LOCAL से GLOBAL तक। देश-दुनिया, झारखंड, राजनीति, व्यापार, खेल, मनोरंजन, स्वास्थ्य और तकनीक की ताज़ा ब्रेकिंग खबरें व विस्तृत संपादकीय विश्लेषण।",
  keywords: [
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
  ],
  authors: [{ name: "GLOBAL AWAAZ" }],
  creator: "GLOBAL AWAAZ",
  publisher: "GLOBAL AWAAZ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://www.globalawaaz.com/",
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
    title: "GLOBAL AWAAZ - LOCAL से GLOBAL तक | Breaking Hindi & English News",
    description:
      "देश-दुनिया और आपके अपने क्षेत्र की हर छोटी-बड़ी खबर सबसे पहले और सबसे सटीक अंदाज में पढ़ें।",
    url: "https://www.globalawaaz.com",
    siteName: "GLOBAL AWAAZ",
    locale: "hi_IN",
    type: "website",
    images: [
      {
        url: "https://www.globalawaaz.com/logo.png",
        width: 1200,
        height: 630,
        alt: "GLOBAL AWAAZ — LOCAL से GLOBAL तक",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GLOBAL AWAAZ - LOCAL से GLOBAL तक",
    description:
      "ग्लोबल आवाज़ — निष्पक्ष खबरें, सटीक विश्लेषण। ताज़ा हिंदी व अंग्रेज़ी समाचार।",
    site: "@globalawaaz",
    creator: "@globalawaaz",
    images: ["https://www.globalawaaz.com/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "XfHMvnanRRb4BCQfIflKveJH7FLoTwRtDO3FXvnBGHA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = generateNewsOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="hi" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="XfHMvnanRRb4BCQfIflKveJH7FLoTwRtDO3FXvnBGHA" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title="GLOBAL AWAAZ RSS Feed" href="https://globalawaaz.com/feed.xml" />
        <script
          id="jsonld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          id="jsonld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
