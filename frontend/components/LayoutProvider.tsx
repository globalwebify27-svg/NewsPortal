"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <div className="admin-page-root">{children}</div>;
  }

  return (
    <LanguageProvider>
      <Header />
      <main className="main-content container">{children}</main>
      <Footer />
    </LanguageProvider>
  );
}

