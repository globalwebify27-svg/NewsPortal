"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Menu,
  CloudSun,
  Sun,
  Globe,
  Search,
  Bell,
  TrendingUp,
  Landmark,
  Shield,
  Handshake,
  MapPin,
  Building2,
  Users,
  BookOpen,
  Building,
  Coins,
  BarChart2,
  Bitcoin,
  Cpu,
  Smartphone,
  Cloud,
  Rocket,
  ShieldCheck,
  Trophy,
  CircleDot,
  Flag,
  Medal,
  Film,
  Tv2,
  Music,
  Star,
  ArrowRight,
  X,
  Home,
  Zap,
  Atom,
  HeartPulse,
  MessageSquare,
  Tv,
  ChevronDown,
  Filter
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { getStoredVideos } from "@/lib/youtube";
import { INDIAN_STATES, IndianState } from "@/lib/states";

export default function Header() {
  let pathname = "";
  try {
    const p = usePathname();
    if (p) pathname = p;
  } catch (e) {
    pathname = "";
  }

  const { lang, toggleLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  // Interactive State Selector States
  const [selectedState, setSelectedState] = useState<IndianState>(INDIAN_STATES[0]);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState("");

  // Interactive Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Custom Admin Logo State
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [customLogoSize, setCustomLogoSize] = useState<number>(56);
  const [customLogoMarginLeft, setCustomLogoMarginLeft] = useState<number>(75);

  useEffect(() => {
    const loadState = () => {
      try {
        const stored = localStorage.getItem("ga_selected_state");
        if (stored) {
          const found = INDIAN_STATES.find(s => s.code === stored || s.slug === stored || s.nameEn.toLowerCase() === stored.toLowerCase());
          if (found) setSelectedState(found);
        } else {
          // Default website state to Jharkhand
          const jharkhand = INDIAN_STATES.find(s => s.code === "JH") || INDIAN_STATES[0];
          setSelectedState(jharkhand);
          localStorage.setItem("ga_selected_state", jharkhand.code);
        }
      } catch (e) {}
    };
    loadState();
    window.addEventListener("storage", loadState);
    window.addEventListener("ga_state_changed", loadState);
    return () => {
      window.removeEventListener("storage", loadState);
      window.removeEventListener("ga_state_changed", loadState);
    };
  }, []);

  const handleSelectState = (st: IndianState) => {
    setSelectedState(st);
    localStorage.setItem("ga_selected_state", st.code);
    window.dispatchEvent(new Event("ga_state_changed"));
    setIsStateModalOpen(false);
  };

  useEffect(() => {
    const loadLogo = () => {
      try {
        const stored = localStorage.getItem("ga_custom_site_logo");
        if (stored) setCustomLogoUrl(stored);
        else setCustomLogoUrl(null);

        const storedSize = localStorage.getItem("ga_custom_logo_size");
        if (storedSize) setCustomLogoSize(parseInt(storedSize, 10) || 56);

        const storedMargin = localStorage.getItem("ga_custom_logo_margin");
        if (storedMargin) setCustomLogoMarginLeft(parseInt(storedMargin, 10) || 75);
      } catch (e) {}
    };
    loadLogo();
    window.addEventListener("storage", loadLogo);
    window.addEventListener("ga_logo_updated", loadLogo);
    return () => {
      window.removeEventListener("storage", loadLogo);
      window.removeEventListener("ga_logo_updated", loadLogo);
    };
  }, []);

  // Custom Social Links State
  const [socialLinks, setSocialLinks] = useState({
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
    instagram: "https://instagram.com"
  });

  useEffect(() => {
    const loadSocialLinks = () => {
      try {
        const stored = localStorage.getItem("ga_social_links");
        if (stored) {
          const parsed = JSON.parse(stored);
          setSocialLinks((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {}
    };
    loadSocialLinks();
    window.addEventListener("storage", loadSocialLinks);
    window.addEventListener("ga_social_links_changed", loadSocialLinks);
    return () => {
      window.removeEventListener("storage", loadSocialLinks);
      window.removeEventListener("ga_social_links_changed", loadSocialLinks);
    };
  }, []);

  // Sticky Nav Scroll Handler
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 110) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    let localArticles: any[] = [];

    try {
      const local = localStorage.getItem("ga_custom_articles");
      if (local) {
        localArticles = JSON.parse(local);
      }
    } catch (e) {}

    const storedVideos = getStoredVideos();

    const matchedArticles = localArticles
      .filter((a: any) => a.title?.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q))
      .map((a: any) => ({ ...a, resultType: "article" }));

    const matchedVideos = storedVideos
      .filter((v: any) => v.title?.toLowerCase().includes(q) || v.category?.toLowerCase().includes(q))
      .map((v: any) => ({ ...v, resultType: "video" }));

    setSearchResults([...matchedArticles, ...matchedVideos].slice(0, 6));
  }, [searchQuery]);

  const isActive = (path: string) => {
    if (!pathname || typeof pathname !== "string") return false;
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  useEffect(() => {
    const now = new Date();
    const locale = lang === "HI" ? "hi-IN" : "en-US";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    };
    setCurrentDate(now.toLocaleDateString(locale, options));
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  return (
    <>
      {/* Top Utility Bar */}
      <div className="top-utility-bar" id="topUtilityBar">
        <div className="container top-bar-inner">
          <div className="top-bar-left">
            <span className="top-bar-date-text">
              {currentDate || (lang === "HI" ? "शनिवार, 03 मई 2025" : "Saturday, 03 May 2025")}
            </span>
            <span className="top-bar-vdivider">|</span>
            <div className="top-bar-weather-text">
              <span>{lang === "HI" ? "राँची, झारखंड" : "Ranchi, Jharkhand"}</span>
              <Sun size={14} className="top-bar-sun-icon" />
              <span>28°C</span>
            </div>
          </div>
          <div className="top-bar-right">
            <nav className="top-bar-links">
              <a href="#">{lang === "HI" ? "हमारे बारे में" : "About Us"}</a>
              <a href="#">{lang === "HI" ? "करियर" : "Careers"}</a>
              <a href="#">{lang === "HI" ? "विज्ञापन दें" : "Advertise"}</a>
              <a href="#">{lang === "HI" ? "संपर्क करें" : "Contact Us"}</a>
            </nav>
            <span className="top-bar-vdivider">|</span>
            <div className="top-bar-social-icons">
              <a href={socialLinks.facebook || "#"} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={14} /></a>
              <a href={socialLinks.twitter || "#"} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter size={14} /></a>
              <a href={socialLinks.youtube || "#"} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={14} /></a>
              <a href={socialLinks.instagram || "#"} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={14} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Header */}
      <header className="sticky-header">
        <div className="header-top container">
          {/* Left Side: Logo Emblem + Weather + Live Badge */}
          <div className="header-left">
            <button
              className="icon-btn mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              <Menu size={22} />
            </button>

            {/* Custom Admin Logo Image on Left */}
            <Link href="/" className="header-left-logo-wrap" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", marginLeft: `${customLogoMarginLeft}px`, transition: "margin-left 0.2s ease" }}>
              <div className="site-logo-emblem-left" style={{ width: `${customLogoSize}px`, height: `${customLogoSize}px`, flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", transition: "width 0.2s ease, height 0.2s ease" }}>
                {customLogoUrl ? (
                  <img src={customLogoUrl} alt="Global Awaaz Custom Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    {/* Red & Green Orbital Arc Ring */}
                    <path d="M 50 5 A 45 45 0 0 0 10 76" fill="none" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 90 24 A 45 45 0 0 1 50 95" fill="none" stroke="#15803d" strokeWidth="5" strokeLinecap="round" />
                    
                    {/* Central Globe Circle */}
                    <circle cx="50" cy="50" r="37" fill="#ffffff" stroke="#15803d" strokeWidth="2.5" />
                    
                    {/* Globe Grid Lines */}
                    <ellipse cx="50" cy="50" rx="37" ry="18" fill="none" stroke="#15803d" strokeWidth="1.2" opacity="0.4" />
                    <ellipse cx="50" cy="50" rx="18" ry="37" fill="none" stroke="#15803d" strokeWidth="1.2" opacity="0.4" />
                    <line x1="50" y1="13" x2="50" y2="87" stroke="#15803d" strokeWidth="1.2" opacity="0.4" />
                    <line x1="13" y1="50" x2="87" y2="50" stroke="#15803d" strokeWidth="1.2" opacity="0.4" />
                    
                    {/* Green Continents Paths */}
                    <g fill="#15803d">
                      <path d="M 30 22 C 38 24 38 32 32 40 C 26 48 34 58 32 72 C 24 64 22 48 24 34 Z" />
                      <path d="M 54 20 C 72 22 76 34 68 44 C 60 54 74 66 64 80 C 50 78 48 62 52 46 Z" />
                    </g>
                  </svg>
                )}
              </div>
            </Link>
          </div>

          {/* Center: Site Logo Title and Tagline */}
          <div className="header-logo-container">
            <Link href="/" className="site-logo-wrap" style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center", gap: "14px" }}>
              {/* Title and Dual-Color Accent Tagline */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span className="site-logo">GLOBAL <span style={{ color: "#e50914" }}>AWAAZ</span></span>
                <div className="site-tagline-wrap" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                  <span style={{ width: "28px", height: "3px", background: "#15803d", borderRadius: "2px" }}></span>
                  <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    LOCAL <span style={{ color: "#f59e0b", fontWeight: 900 }}>से</span> GLOBAL <span style={{ color: "#e50914", fontWeight: 900 }}>तक</span>
                  </span>
                  <span style={{ width: "28px", height: "3px", background: "#dc2626", borderRadius: "2px" }}></span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right Side: Utilities */}
          <div className="header-right">
            <button className="lang-toggle-btn" onClick={toggleLang} title={lang === "EN" ? "Switch to Hindi" : "Switch to English"}>
              <Globe size={15} />
              <span className="lang-text-desktop">{lang === "EN" ? "हिंदी" : "English"}</span>
              <span className="lang-text-mobile">{lang === "EN" ? "हि" : "EN"}</span>
            </button>
            <button
              className="icon-btn search-trigger"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title={lang === "HI" ? "समाचार खोजें" : "Search News"}
            >
              <Search size={20} />
            </button>
            <button className="icon-btn notification-btn">
              <Bell size={18} />
              <span className="notification-badge"></span>
            </button>
          </div>
        </div>

        {/* Expanded Interactive Search Bar */}
        {isSearchOpen && (
          <div style={{
            background: "var(--color-card-bg, #111)",
            borderBottom: "1px solid var(--color-border, #222)",
            padding: "12px 0",
            position: "relative",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            zIndex: 100
          }}>
            <div className="container" style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
              <Search size={18} style={{ color: "var(--color-secondary)" }} />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "1rem",
                  color: "var(--color-text, #fff)",
                  fontWeight: 600
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ background: "none", border: "none", color: "var(--color-secondary)", cursor: "pointer", padding: "4px" }}
                >
                  <X size={16} />
                </button>
              )}
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                style={{
                  background: "#e50914",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer"
                }}
              >
                {lang === "HI" ? "बंद करें" : "Close"}
              </button>
            </div>

            {/* Live Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="container" style={{ marginTop: "12px" }}>
                <div style={{
                  background: "var(--color-card-bg, #18181c)",
                  border: "1px solid var(--color-border, #27272a)",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
                }}>
                  {searchResults.length === 0 ? (
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--color-secondary)", textAlign: "center" }}>
                      {lang === "HI" ? `"${searchQuery}" के लिए कोई परिणाम नहीं मिला` : `No results found for "${searchQuery}"`}
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#e50914", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {lang === "HI" ? `परिणाम (${searchResults.length})` : `Results (${searchResults.length})`}
                      </span>
                      {searchResults.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.resultType === "video" ? "/videos" : `/article/${item.slug}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            color: "inherit",
                            background: "rgba(255,255,255,0.03)",
                            transition: "background 0.15s ease"
                          }}
                        >
                          {item.youtubeId ? (
                            <img
                              src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                              alt={item.title}
                              style={{ width: "48px", height: "32px", objectFit: "cover", borderRadius: "4px", flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "#e50914", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", flexShrink: 0 }}>
                              NEWS
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.title}
                            </h4>
                            <span style={{ fontSize: "0.72rem", color: "var(--color-secondary)" }}>
                              {item.category || item.category?.name || "General"}
                            </span>
                          </div>
                          <ArrowRight size={14} style={{ color: "var(--color-secondary)" }} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mega Menu Navigation — Rounded Capsule Pill Bar */}
      <nav className={`mega-menu-nav ${isSticky ? "is-sticky" : ""}`}>
        <div className="container menu-wrapper-pill">
          <div className="pill-nav-container">
            {/* State Location Selector Pill */}
            <button
              onClick={() => setIsStateModalOpen(true)}
              className="location-pill-btn"
              style={{
                background: "#ffffff",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                borderRadius: "20px",
                padding: "6px 14px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 800,
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
              }}
              title="Click to select Indian State / राज्य चुनें"
            >
              <MapPin size={14} style={{ color: "#16a34a" }} />
              <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.85rem" }}>
                {lang === "HI" ? selectedState.nameHi : selectedState.nameEn}
              </span>
              <ChevronDown size={14} style={{ color: "#64748b" }} />
            </button>

            <span className="location-pill-divider"></span>

            <ul className="nav-links pill-nav-links">
              <li>
                <Link href="/" className={`nav-link pill-nav-link ${isActive("/") ? "active" : ""}`}>
                  <Home size={15} />
                  <span>{t("home")}</span>
                  {isActive("/") && <span className="active-pill-bar"></span>}
                </Link>
              </li>
              <li>
                <Link href="/latest" className={`nav-link pill-nav-link ${isActive("/latest") ? "active" : ""}`}>
                  <Zap size={15} />
                  <span>{t("latest")}</span>
                  {isActive("/latest") && <span className="active-pill-bar"></span>}
                </Link>
              </li>
              <li>
                <Link href="/world" className={`nav-link pill-nav-link ${isActive("/world") ? "active" : ""}`}>
                  <Globe size={15} />
                  <span>{t("world")}</span>
                  {isActive("/world") && <span className="active-pill-bar"></span>}
                </Link>
                <div className="mega-dropdown">
                  <Link href="/world"><Globe size={14} />{t("world")}</Link>
                  <Link href="/world"><Landmark size={14} />{t("politics")}</Link>
                  <Link href="/world"><Shield size={14} />{t("defence")}</Link>
                  <Link href="/world"><Handshake size={14} />{t("diplomacy")}</Link>
                  <div className="dropdown-divider"></div>
                  <Link href="/world" className="see-all-dropdown"><ArrowRight size={14} />{t("seeAll")} {t("world")}</Link>
                </div>
              </li>
              <li>
                <Link href="/india" className={`nav-link pill-nav-link ${isActive("/india") ? "active" : ""}`}>
                  <MapPin size={15} />
                  <span>{t("india")}</span>
                  {isActive("/india") && <span className="active-pill-bar"></span>}
                </Link>
                {/* INDIA TAB MEGA DROPDOWN WITH ALL STATES SUB-TABS */}
                <div className="mega-dropdown" style={{ minWidth: "480px", padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#e50914", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={14} /> {lang === "HI" ? "भारत के सभी राज्य (All States of India)" : "All States of India"}
                    </span>
                    <button onClick={() => setIsStateModalOpen(true)} style={{ background: "transparent", border: "none", color: "#e50914", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}>
                      {lang === "HI" ? "सभी राज्य देखें →" : "View All States →"}
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px 10px", maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
                    {INDIAN_STATES.map((st) => (
                      <Link
                        key={st.code}
                        href={`/india?state=${st.slug}`}
                        onClick={() => handleSelectState(st)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "0.82rem",
                          fontWeight: selectedState.code === st.code ? 800 : 500,
                          color: selectedState.code === st.code ? "#ffffff" : "var(--color-text)",
                          background: selectedState.code === st.code ? "#e50914" : "rgba(0,0,0,0.03)",
                          textDecoration: "none",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <span style={{ fontSize: "0.75rem" }}>📍</span>
                        <span>{lang === "HI" ? st.nameHi : st.nameEn}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
              <li>
                <Link href="/business" className={`nav-link pill-nav-link ${isActive("/business") ? "active" : ""}`}>
                  <TrendingUp size={15} />
                  <span>{t("business")}</span>
                  {isActive("/business") && <span className="active-pill-bar"></span>}
                </Link>
                <div className="mega-dropdown">
                  <Link href="/business"><TrendingUp size={14} />{t("markets")}</Link>
                  <Link href="/business"><Building size={14} />{t("companies")}</Link>
                  <Link href="/business"><Coins size={14} />{t("finance")}</Link>
                  <Link href="/business"><BarChart2 size={14} />{t("economy")}</Link>
                  <Link href="/business"><Bitcoin size={14} />{t("crypto")}</Link>
                  <div className="dropdown-divider"></div>
                  <Link href="/business" className="see-all-dropdown"><ArrowRight size={14} />{t("seeAll")} {t("business")}</Link>
                </div>
              </li>
              <li>
                <Link href="/technology" className={`nav-link pill-nav-link ${isActive("/technology") ? "active" : ""}`}>
                  <Cpu size={15} />
                  <span>{t("technology")}</span>
                  {isActive("/technology") && <span className="active-pill-bar"></span>}
                </Link>
                <div className="mega-dropdown">
                  <Link href="/technology"><Cpu size={14} />{t("aiMl")}</Link>
                  <Link href="/technology"><Smartphone size={14} />{t("gadgets")}</Link>
                  <Link href="/technology"><Cloud size={14} />{t("cloudSoftware")}</Link>
                  <Link href="/technology"><Rocket size={14} />{t("spaceTech")}</Link>
                  <Link href="/technology"><ShieldCheck size={14} />{t("cybersecurity")}</Link>
                  <div className="dropdown-divider"></div>
                  <Link href="/technology" className="see-all-dropdown"><ArrowRight size={14} />{t("seeAll")} {t("technology")}</Link>
                </div>
              </li>
              <li>
                <Link href="/sports" className={`nav-link pill-nav-link ${isActive("/sports") ? "active" : ""}`}>
                  <Trophy size={15} />
                  <span>{t("sports")}</span>
                  {isActive("/sports") && <span className="active-pill-bar"></span>}
                </Link>
                <div className="mega-dropdown">
                  <Link href="/sports"><Trophy size={14} />{t("cricket")}</Link>
                  <Link href="/sports"><CircleDot size={14} />{t("football")}</Link>
                  <Link href="/sports"><Flag size={14} />{t("formula1")}</Link>
                  <Link href="/sports"><Medal size={14} />{t("olympics")}</Link>
                  <div className="dropdown-divider"></div>
                  <Link href="/sports" className="see-all-dropdown"><ArrowRight size={14} />{t("seeAll")} {t("sports")}</Link>
                </div>
              </li>
              <li>
                <Link href="/entertainment" className={`nav-link pill-nav-link ${isActive("/entertainment") ? "active" : ""}`}>
                  <Film size={15} />
                  <span>{t("entertainment")}</span>
                  {isActive("/entertainment") && <span className="active-pill-bar"></span>}
                </Link>
                <div className="mega-dropdown">
                  <Link href="/entertainment"><Film size={14} />{t("movies")}</Link>
                  <Link href="/entertainment"><Tv2 size={14} />{t("tvSeries")}</Link>
                  <Link href="/entertainment"><Music size={14} />{t("music")}</Link>
                  <Link href="/entertainment"><Star size={14} />{t("celebrity")}</Link>
                  <div className="dropdown-divider"></div>
                  <Link href="/entertainment" className="see-all-dropdown"><ArrowRight size={14} />{t("seeAll")} {t("entertainment")}</Link>
                </div>
              </li>
              <li>
                <Link href="/science" className={`nav-link pill-nav-link ${isActive("/science") ? "active" : ""}`}>
                  <Atom size={15} />
                  <span>{t("science")}</span>
                  {isActive("/science") && <span className="active-pill-bar"></span>}
                </Link>
              </li>
              <li>
                <Link href="/health" className={`nav-link pill-nav-link ${isActive("/health") ? "active" : ""}`}>
                  <HeartPulse size={15} />
                  <span>{t("health")}</span>
                  {isActive("/health") && <span className="active-pill-bar"></span>}
                </Link>
              </li>
              <li>
                <Link href="/opinion" className={`nav-link pill-nav-link ${isActive("/opinion") ? "active" : ""}`}>
                  <MessageSquare size={15} />
                  <span>{t("opinion")}</span>
                  {isActive("/opinion") && <span className="active-pill-bar"></span>}
                </Link>
              </li>
              <li>
                <Link href="/videos" className={`nav-link pill-nav-link ${isActive("/videos") ? "active" : ""}`}>
                  <Tv size={15} />
                  <span>{t("videos")}</span>
                  {isActive("/videos") && <span className="active-pill-bar"></span>}
                </Link>
              </li>
            </ul>

            <div className="filter-pill-btn">
              <Filter size={13} />
              <span>{lang === "HI" ? "फ़िल्टर" : "Filter"}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Breaking News Ticker Banner */}
      <div className="live-news-banner">
        <div className="container banner-inner">
          <Link href="/breaking" className="breaking-badge">{t("breakingNews")}</Link>
          <div className="ticker-wrap">
            <div className="ticker-items">
              {lang === "HI" ? (
                <>
                  <span>वैश्विक बाजार सूचकांक तकनीकी विस्तार के बीच रिकॉर्ड स्तर पर पहुंचा।</span>
                  <span>मंगल ग्रह रोवर ने प्राचीन झील के तल में कार्बनिक यौगिकों की खोज की।</span>
                  <span>चैम्पियनशिप फाइनल रोमांचक मुकाबले में पेनाल्टी शूटआउट तक पहुंचा।</span>
                  <span>प्रमुख एआई शोध गठबंधन ने नैतिक नियमों की घोषणा की।</span>
                </>
              ) : (
                <>
                  <span>Global Market Index hits record high amid technological expansion.</span>
                  <span>Mars mission rover discovers organic compounds in ancient lakebed.</span>
                  <span>Championship final goes to penalty shootout in thrilling sports decider.</span>
                  <span>Leading AI research coalition announces framework for ethical alignment.</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay active">
          <div className="mobile-drawer-content">
            <div className="mobile-drawer-header">
              <Link href="/" className="mobile-drawer-logo">GLOBAL AWAAZ</Link>
              <button className="icon-btn close-drawer-btn" onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <ul className="mobile-drawer-nav">
              <li><Link href="/" onClick={() => setMobileMenuOpen(false)}>{t("home")}</Link></li>
              <li><Link href="/latest" onClick={() => setMobileMenuOpen(false)}>{t("latest")}</Link></li>
              <li><Link href="/world" onClick={() => setMobileMenuOpen(false)}>{t("world")}</Link></li>
              <li><Link href="/india" onClick={() => setMobileMenuOpen(false)}>{t("india")}</Link></li>
              <li><Link href="/business" onClick={() => setMobileMenuOpen(false)}>{t("business")}</Link></li>
              <li><Link href="/technology" onClick={() => setMobileMenuOpen(false)}>{t("technology")}</Link></li>
              <li><Link href="/sports" onClick={() => setMobileMenuOpen(false)}>{t("sports")}</Link></li>
              <li><Link href="/entertainment" onClick={() => setMobileMenuOpen(false)}>{t("entertainment")}</Link></li>
              <li><Link href="/science" onClick={() => setMobileMenuOpen(false)}>{t("science")}</Link></li>
              <li><Link href="/health" onClick={() => setMobileMenuOpen(false)}>{t("health")}</Link></li>
              <li><Link href="/opinion" onClick={() => setMobileMenuOpen(false)}>{t("opinion")}</Link></li>
              <li><Link href="/videos" onClick={() => setMobileMenuOpen(false)}>{t("videos")}</Link></li>
            </ul>
          </div>
        </div>
      )}

      {/* Indian States Selector Modal */}
      {isStateModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "20px" }}>
          <div style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderTop: "4px solid #e50914", borderRadius: "16px", width: "100%", maxWidth: "680px", padding: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", color: "#0f172a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  🇮🇳 {lang === "HI" ? "भारत के राज्य चुनें (Select State)" : "Select Indian State"}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px", display: "block" }}>
                  {lang === "HI" ? "अपने राज्य की ताज़ा खबरें देखने के लिए अपना राज्य चुनें" : "Select your state to filter local news highlights"}
                </span>
              </div>
              <button onClick={() => setIsStateModalOpen(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer", color: "#0f172a", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} />
              </button>
            </div>

            {/* State Search Filter */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder={lang === "HI" ? "राज्य खोजें... (Search state e.g. Bihar, UP, Delhi)" : "Search state e.g. Bihar, UP, Delhi..."}
                value={stateSearchQuery}
                onChange={(e) => setStateSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.9rem", color: "#0f172a", background: "#f8fafc" }}
              />
            </div>

            {/* State Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))", gap: "10px", maxHeight: "360px", overflowY: "auto", paddingRight: "4px" }}>
              {INDIAN_STATES.filter(s =>
                s.nameEn.toLowerCase().includes(stateSearchQuery.toLowerCase()) ||
                s.nameHi.includes(stateSearchQuery) ||
                s.code.toLowerCase().includes(stateSearchQuery.toLowerCase())
              ).map((st) => {
                const isSelected = selectedState.code === st.code;
                return (
                  <button
                    key={st.code}
                    onClick={() => handleSelectState(st)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: isSelected ? "2px solid #e50914" : "1.5px solid #e2e8f0",
                      background: isSelected ? "#e50914" : "#ffffff",
                      color: isSelected ? "#ffffff" : "#0f172a",
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? "0 4px 12px rgba(229,9,20,0.25)" : "none"
                    }}
                  >
                    <MapPin size={13} style={{ color: isSelected ? "#ffffff" : "#e50914", flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lang === "HI" ? st.nameHi : st.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
