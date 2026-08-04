"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import { Home, Video, Newspaper, Clapperboard, LayoutGrid } from "lucide-react";

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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="bottom-nav-bar" id="mobileBottomNav">
        <Link href="/" className={`bottom-nav-item${pathname === "/" ? " active" : ""}`}>
          <Home size={22} />
          <span>होम</span>
        </Link>
        <Link href="/videos" className={`bottom-nav-item${pathname?.startsWith("/videos") ? " active" : ""}`}>
          <Video size={22} />
          <span>वीडियो</span>
        </Link>
        {/* Center ई-पेपर raised button */}
        <Link href="/epaper" className="bottom-nav-item bottom-nav-center-btn">
          <div className="bottom-nav-epaper-circle">
            <Newspaper size={24} />
          </div>
          <span>ई-पेपर</span>
        </Link>
        <Link href="/shorts" className={`bottom-nav-item${pathname?.startsWith("/shorts") ? " active" : ""}`}>
          <Clapperboard size={22} />
          <span>शॉर्ट्स</span>
        </Link>
        <button className="bottom-nav-item" onClick={() => { const el = document.getElementById("mobileMenuBtn"); if (el) el.click(); }}>
          <LayoutGrid size={22} />
          <span>मेन्यू</span>
        </button>
      </nav>
    </LanguageProvider>
  );
}

