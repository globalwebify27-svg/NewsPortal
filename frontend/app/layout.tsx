import React from "react"
import "./styles.css";
import "./admin.css";
import "./globals.css";
import LayoutProvider from "@/components/LayoutProvider";

export const metadata = {
  title: "GLOBAL AWAAZ | World News, Sport, Business & Opinion",
  description: "Global Awaaz — Enterprise Editorial Platform. Breaking news, in-depth analysis, world politics, sports action, business insights, and video reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
