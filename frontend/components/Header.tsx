"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Twitter,
  Youtube,
  Instagram,
  Menu,
  CloudSun,
  Globe,
  Search,
  Bell,
  Sun,
  Moon,
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
  LogIn,
  X
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { getStoredVideos } from "@/lib/youtube";

export default function Header() {
  let pathname = "";
  try {
    const p = usePathname();
    if (p) pathname = p;
  } catch (e) {
    pathname = "";
  }
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { lang, toggleLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  // Interactive Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

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
    // Format date based on language
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

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <>
      {/* Top Utility Bar */}
      <div className="top-utility-bar" id="topUtilityBar">
        <div className="container">
          <div className="top-bar-left">
            <div className="top-bar-date">
              <Calendar size={13} />
              <span>{currentDate || (lang === "HI" ? "शनिवार, 26 जुलाई 2026" : "Saturday, 26 July 2026")}</span>
            </div>
            <span className="top-bar-edition">{t("globalEdition")}</span>
          </div>
          <div className="top-bar-right">
            <div className="top-bar-social">
              <a href="#" aria-label="Twitter"><Twitter size={14} /></a>
              <a href="#" aria-label="YouTube"><Youtube size={14} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={14} /></a>
            </div>
            <a href="#" className="top-bar-subscribe">{t("subscribe")}</a>
          </div>
        </div>
      </div>

      {/* Sticky Header */}
      <header className="sticky-header">
        <div className="header-top container">
          {/* Left Side: Weather and Live Ticker */}
          <div className="header-left">
            <button
              className="icon-btn mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              <Menu size={20} />
            </button>
            <div className="weather-widget">
              <CloudSun size={18} className="weather-icon" />
              <span>London, 19°C</span>
            </div>
            <div className="live-indicator-pill">
              <span className="live-pulse"></span>
              <span className="live-badge-text">{t("live")}</span>
            </div>
          </div>

          {/* Center: Site Logo */}
          <div className="header-logo-container">
            <Link href="/" className="site-logo">
              GLOBAL AWAAZ
            </Link>
          </div>

          {/* Right Side: Utilities */}
          <div className="header-right">
            <button className="lang-toggle-btn" onClick={toggleLang} title={lang === "EN" ? "Switch to Hindi" : "Switch to English"}>
              <Globe size={15} />
              <span className="lang-text-desktop">{lang === "EN" ? "हिंदी" : "English"}</span>
              <span className="lang-text-mobile">{lang === "EN" ? "HI" : "EN"}</span>
            </button>
            <button
              className="icon-btn search-trigger"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title={lang === "HI" ? "समाचार खोजें" : "Search News"}
            >
              <Search size={18} />
            </button>
            <button className="icon-btn notification-btn">
              <Bell size={18} />
              <span className="notification-badge"></span>
            </button>
            <button className="icon-btn theme-toggle" onClick={toggleTheme}>
              {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
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

      {/* Mega Menu Navigation — Sticky Bar */}
      <nav className={`mega-menu-nav ${isSticky ? "is-sticky" : ""}`}>
          <div className="container menu-wrapper">
            <ul className="nav-links">
              <li><Link href="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>{t("home")}</Link></li>
              <li><Link href="/latest" className={`nav-link ${isActive("/latest") ? "active" : ""}`}>{t("latest")}</Link></li>
              <li>
                <Link href="/world" className={`nav-link ${isActive("/world") ? "active" : ""}`}>{t("world")}</Link>
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
                <Link href="/india" className={`nav-link ${isActive("/india") ? "active" : ""}`}>{t("india")}</Link>
                <div className="mega-dropdown">
                  <Link href="/india"><MapPin size={14} />{t("national")}</Link>
                  <Link href="/india"><Building2 size={14} />{t("politics")}</Link>
                  <Link href="/india"><Users size={14} />{t("society")}</Link>
                  <Link href="/india"><BookOpen size={14} />{t("education")}</Link>
                  <div className="dropdown-divider"></div>
                  <Link href="/india" className="see-all-dropdown"><ArrowRight size={14} />{t("seeAll")} {t("india")}</Link>
                </div>
              </li>
              <li>
                <Link href="/business" className={`nav-link ${isActive("/business") ? "active" : ""}`}>{t("business")}</Link>
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
                <Link href="/technology" className={`nav-link ${isActive("/technology") ? "active" : ""}`}>{t("technology")}</Link>
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
                <Link href="/sports" className={`nav-link ${isActive("/sports") ? "active" : ""}`}>{t("sports")}</Link>
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
                <Link href="/entertainment" className={`nav-link ${isActive("/entertainment") ? "active" : ""}`}>{t("entertainment")}</Link>
                <div className="mega-dropdown">
                  <Link href="/entertainment"><Film size={14} />{t("movies")}</Link>
                  <Link href="/entertainment"><Tv2 size={14} />{t("tvSeries")}</Link>
                  <Link href="/entertainment"><Music size={14} />{t("music")}</Link>
                  <Link href="/entertainment"><Star size={14} />{t("celebrity")}</Link>
                  <div className="dropdown-divider"></div>
                  <Link href="/entertainment" className="see-all-dropdown"><ArrowRight size={14} />{t("seeAll")} {t("entertainment")}</Link>
                </div>
              </li>
              <li><Link href="/science" className={`nav-link ${isActive("/science") ? "active" : ""}`}>{t("science")}</Link></li>
              <li><Link href="/health" className={`nav-link ${isActive("/health") ? "active" : ""}`}>{t("health")}</Link></li>
              <li><Link href="/opinion" className={`nav-link ${isActive("/opinion") ? "active" : ""}`}>{t("opinion")}</Link></li>
              <li><Link href="/videos" className={`nav-link ${isActive("/videos") ? "active" : ""}`}>{t("videos")}</Link></li>
            </ul>
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
    </>
  );
}
