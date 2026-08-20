"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SeoHeadManager from "@/components/SeoHeadManager";
import GlobalAutoTooltip from "@/components/GlobalAutoTooltip";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { Home, Video, Trophy, MapPin, LayoutGrid } from "lucide-react";

function MobileBottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  return (
    <nav className="bottom-nav-bar" id="mobileBottomNav">
      <Link href="/" className={`bottom-nav-item${pathname === "/" ? " active" : ""}`}>
        <Home size={22} />
        <span>{lang === "HI" ? "होम" : "Home"}</span>
      </Link>

      <Link href="/videos" className={`bottom-nav-item${pathname?.startsWith("/videos") ? " active" : ""}`}>
        <Video size={22} />
        <span>{lang === "HI" ? "वीडियो" : "Videos"}</span>
      </Link>

      {/* Center खेल (Sports) Prominent Raised Button */}
      <Link href="/sports" className={`bottom-nav-item bottom-nav-center-btn${pathname?.startsWith("/sports") ? " active" : ""}`}>
        <div className="bottom-nav-epaper-circle">
          <Trophy size={22} />
        </div>
        <span style={{ fontWeight: 800 }}>{lang === "HI" ? "खेल" : "Sports"}</span>
      </Link>

      <Link href="/india" className={`bottom-nav-item${pathname?.startsWith("/india") ? " active" : ""}`}>
        <MapPin size={22} />
        <span>{lang === "HI" ? "भारत" : "India"}</span>
      </Link>

      <button className="bottom-nav-item" onClick={() => { const el = document.getElementById("mobileMenuBtn"); if (el) el.click(); }}>
        <LayoutGrid size={22} />
        <span>{lang === "HI" ? "मेन्यू" : "Menu"}</span>
      </button>
    </nav>
  );
}

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <LanguageProvider>
        <GlobalAutoTooltip />
        <div className="admin-page-root">{children}</div>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <GlobalAutoTooltip />
      <SeoHeadManager />
      <Header />
      <main className="main-content container">{children}</main>
      <Footer />
      <MobileBottomNav />
    </LanguageProvider>
  );
}
