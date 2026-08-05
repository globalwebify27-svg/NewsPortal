"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bookmark, Mail, Zap, Play, ChevronLeft, ChevronRight, X, ExternalLink, Clock, Calendar, ChevronRight as ArrowRight, Share2, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getStoredVideos, YouTubeVideoItem } from "@/lib/youtube";
import SocialShareButtons from "@/components/SocialShareButtons";

import { defaultEnglishArticles, defaultHindiArticles, stripHtml, getArticleImage } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  featuredImage: string;
  category?: { name: string; slug: string; color: string };
  author?: { name: string };
  readTime: string;
  isPinned?: boolean;
  isHero?: boolean;
  status?: string;
  language?: "EN" | "HI";
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
}

export default function Home() {
  const { lang, t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoModal, setActiveVideoModal] = useState<YouTubeVideoItem | null>(null);
  const [trendingVideos, setTrendingVideos] = useState<YouTubeVideoItem[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const carouselWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateVideos = () => {
      setTrendingVideos(getStoredVideos());
    };
    updateVideos();
    window.addEventListener("storage", updateVideos);
    return () => window.removeEventListener("storage", updateVideos);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideoModal(null);
    };
    if (activeVideoModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideoModal]);

  useEffect(() => {
    async function fetchArticles() {
      let apiList: Article[] = [];
      try {
        const res = await fetch(API_ENDPOINTS.articles);
        const json = await res.json();
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          apiList = json.data;
        }
      } catch (err) {
        console.warn("Using fallback articles data:", err);
      }

      try {
        const local = localStorage.getItem("ga_custom_articles");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const customMap = new Map(parsed.map((a: Article) => [a.id, a]));
            const validCustom = parsed.filter((a: Article) => a.status !== "DRAFT");
            const nonCustomApi = apiList.filter((a) => !customMap.has(a.id));
            apiList = [...validCustom, ...nonCustomApi];
          }
        }
      } catch (e) {}

      setArticles(apiList);
      setLoading(false);
    }

    fetchArticles();
    window.addEventListener("storage", fetchArticles);
    window.addEventListener("ga_articles_updated", fetchArticles);
    window.addEventListener("ga_epaper_updated", fetchArticles);
    return () => {
      window.removeEventListener("storage", fetchArticles);
      window.removeEventListener("ga_articles_updated", fetchArticles);
      window.removeEventListener("ga_epaper_updated", fetchArticles);
    };
  }, []);

  const handleScrollLeft = () => {
    if (carouselWrapperRef.current) {
      carouselWrapperRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (carouselWrapperRef.current) {
      carouselWrapperRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const handleCarouselWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Convert vertical mouse wheel to horizontal scroll
    if (carouselWrapperRef.current) {
      e.preventDefault();
      carouselWrapperRef.current.scrollBy({ left: e.deltaY * 1.5, behavior: "smooth" });
    }
  };

  // Show articles that match the current language OR have no language set (admin default)
  // This ensures admin-added articles always appear regardless of language toggle
  const langFiltered = articles.filter((a) => {
    if (!a.language) return true; // No language set → always show
    if (lang === "HI") return a.language === "HI" || a.language === "EN"; // In Hindi mode, show all
    return a.language === "EN" || a.language === "HI"; // In English mode, show all
  });

  const activeArticles = langFiltered.length > 0 ? langFiltered : articles;
  const displayList = activeArticles;

  const explicitHero = articles.find((a) => a.isHero && a.status !== "DRAFT") || displayList.find((a) => a.isHero);
  const mainHero = explicitHero || displayList[0];
  const secondaryHero = displayList.filter((a) => a.id !== mainHero?.id).slice(0, 4);
  const topStories = displayList.filter((a) => a.id !== mainHero?.id).slice(0, 6);
  const stateArticles = displayList.filter((a) => a.id !== mainHero?.id).slice(0, 4);
  const todaysTopStories = displayList;

  const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div style={{
        minHeight: "65vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center",
        margin: "20px 0"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "rgba(229, 9, 20, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "18px"
        }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#e50914" }} />
        </div>
        <h3 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 8px", color: "var(--color-text, #0f172a)" }}>
          {lang === "HI" ? "ताज़ा ख़बरे लोड हो रही हैं..." : "Loading Latest Stories..."}
        </h3>
        <p style={{ color: "var(--color-secondary, #64748b)", fontSize: "0.9rem", margin: 0, maxWidth: "400px" }}>
          {lang === "HI" ? "कृपया प्रतीक्षा करें, लाइव समाचार अपडेट प्राप्त हो रहे हैं।" : "Please wait while Global Awaaz fetches live articles."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ===========================
          DESKTOP HERO LAYOUT
          =========================== */}
      <section className="hero-section desktop-hero-section" style={{ marginTop: "0px" }}>
        <div className="hero-grid">
          {/* Primary Lead Story */}
          {mainHero ? (
            <article className="hero-main-card">
              <Link href={`/article/${mainHero.slug && mainHero.slug.length > 1 ? mainHero.slug : mainHero.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="hero-img-wrap" style={{ position: "relative", overflow: "hidden", background: "#0a0f1d", ...(mainHero.imageHeight && mainHero.imageHeight !== "auto" ? { height: mainHero.imageHeight } : {}) }}>
                  {getArticleImage(mainHero, 0) ? (
                    <>
                      <img
                        src={getArticleImage(mainHero, 0)}
                        alt=""
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: "blur(24px) brightness(0.65)",
                          transform: "scale(1.15)",
                          pointerEvents: "none",
                          zIndex: 1
                        }}
                      />
                      <img
                        src={getArticleImage(mainHero, 0)}
                        alt={mainHero.title}
                        style={{
                          position: "relative",
                          zIndex: 2,
                          width: "100%",
                          height: "100%",
                          objectFit: mainHero.imageFit || "contain",
                          objectPosition: "center center"
                        }}
                      />
                    </>
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#94a3b8", fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.05em" }}>GLOBAL AWAAZ</span>
                    </div>
                  )}
                  <span className="badge badge-accent" style={{ background: mainHero.category?.color || "#e50914" }}>
                    {mainHero.category?.name || (lang === "HI" ? "विदेश" : "WORLD")}
                  </span>
                  <span className="read-time-tag">{mainHero.readTime || (lang === "HI" ? "5 मिनट पढ़ें" : "5 min read")}</span>
                </div>
                <div className="hero-content">
                  <h1 className="hero-title">{mainHero.title}</h1>
                  <div className="card-meta-row" style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.78rem", color: "var(--color-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
                      <Clock size={13} />
                      {timeStr}
                    </span>
                    <span style={{ color: "var(--color-border)" }}>|</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
                      <Calendar size={13} />
                      {dateStr}
                    </span>
                  </div>
                  <p className="hero-summary">{stripHtml(mainHero.summary)}</p>
                  <div className="author-byline" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
                    <div>
                      <span>{t("by")} {mainHero.author?.name || "Global Awaaz Staff"}</span>
                      <span className="bullet">•</span>
                      <span>{lang === "HI" ? "12 मिनट पहले" : "12m ago"}</span>
                    </div>
                    <SocialShareButtons title={mainHero.title} slug={mainHero.slug} image={mainHero.featuredImage} summary={mainHero.summary} size="md" />
                  </div>
                </div>
              </Link>
            </article>
          ) : (
            <div style={{ padding: "60px 20px", textAlign: "center", background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e5e5" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 8px" }}>No Articles Published Yet</h2>
              <p style={{ color: "#6b6b6b", fontSize: "0.9rem" }}>Publish stories in the CMS Admin Portal (/admin) to display live articles on the homepage.</p>
            </div>
          )}

          {/* Secondary Story Grid */}
          <div className="hero-side-grid">
            {secondaryHero.map((item, idx) => (
              <article key={item.id} className="side-card">
                <Link href={`/article/${item.slug && item.slug.length > 1 ? item.slug : item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="side-img-wrap" style={item.imageHeight && item.imageHeight !== "auto" ? { height: item.imageHeight } : undefined}>
                    {getArticleImage(item, idx + 1) ? (
                      <img
                        src={getArticleImage(item, idx + 1)}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: item.imageFit || "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }} />
                    )}
                    <span className="badge badge-outline" style={{ color: item.category?.color || "#e50914" }}>
                      {item.category?.name || (lang === "HI" ? "समाचार" : "NEWS")}
                    </span>
                  </div>
                  <div className="side-content">
                    <h3 className="side-title">{item.title}</h3>
                    <div className="card-meta-row" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.74rem", color: "var(--color-secondary)", marginTop: "4px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontWeight: 500 }}>
                        <Clock size={12} />
                        {timeStr}
                      </span>
                      <span style={{ color: "var(--color-border)" }}>|</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontWeight: 500 }}>
                        <Calendar size={12} />
                        {dateStr}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      <span className="read-time">{item.readTime || (lang === "HI" ? "4 मिनट पढ़ें" : "4 min read")}</span>
                      <SocialShareButtons title={item.title} slug={item.slug} image={item.featuredImage} summary={item.summary} size="sm" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===========================
          MOBILE HERO CARD
          =========================== */}
      {/* ===========================
          MOBILE HERO CARD + 5 LIST CARDS
          =========================== */}
      <section className="mobile-hero-section">
        {mainHero ? (
          <>
            {/* 1 Main Hero Card */}
            <article className="mobile-hero-card">
              {/* Full-width image */}
              <Link href={`/article/${mainHero.slug && mainHero.slug.length > 1 ? mainHero.slug : mainHero.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <div className="mobile-hero-img-wrap" style={{ position: "relative", overflow: "hidden", background: "#0a0f1d" }}>
                  {getArticleImage(mainHero, 0) ? (
                    <>
                      <img
                        src={getArticleImage(mainHero, 0)}
                        alt=""
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: "blur(24px) brightness(0.65)",
                          transform: "scale(1.15)",
                          pointerEvents: "none",
                          zIndex: 1
                        }}
                      />
                      <img
                        src={getArticleImage(mainHero, 0)}
                        alt={mainHero.title}
                        className="mobile-hero-img"
                        style={{
                          position: "relative",
                          zIndex: 2,
                          width: "100%",
                          height: "100%",
                          objectFit: mainHero.imageFit || "contain",
                          objectPosition: "center center"
                        }}
                      />
                    </>
                  ) : (
                    <div className="mobile-hero-img-placeholder">
                      <span>GLOBAL AWAAZ</span>
                    </div>
                  )}
                  {/* Category badge top-left */}
                  <span className="mobile-cat-badge" style={{ background: mainHero.category?.color || "#e50914" }}>
                    {mainHero.category?.name || (lang === "HI" ? "विदेश" : "WORLD")}
                  </span>
                  {/* Time badge top-right */}
                  <span className="mobile-time-badge">
                    {lang === "HI" ? "5 मिनट पहले" : "5 min ago"}
                  </span>
                </div>

                {/* Content below image */}
                <div className="mobile-hero-content">
                  <h1 className="mobile-hero-title">{mainHero.title}</h1>
                  {/* Meta: time, date, read time */}
                  <div className="mobile-hero-meta">
                    <span className="mobile-meta-item">
                      <Clock size={12} />
                      {timeStr}
                    </span>
                    <span className="mobile-meta-sep">|</span>
                    <span className="mobile-meta-item">
                      <Calendar size={12} />
                      {dateStr}
                    </span>
                    <span className="mobile-meta-sep">•</span>
                    <span className="mobile-meta-readtime">{mainHero.readTime || (lang === "HI" ? "4 मिनट पढ़ें" : "4 min read")}</span>
                  </div>
                  <p className="mobile-hero-summary">{stripHtml(mainHero.summary)?.slice(0, 120)}{stripHtml(mainHero.summary)?.length > 120 ? "..." : ""}</p>
                </div>
              </Link>

              {/* Action row: Save + social share */}
              <div className="mobile-hero-actions">
                <button className="mobile-save-btn">
                  <Bookmark size={16} />
                  <span>{lang === "HI" ? "सेव करें" : "Save"}</span>
                </button>
                <SocialShareButtons title={mainHero.title} slug={mainHero.slug} image={mainHero.featuredImage} summary={mainHero.summary} size="md" />
              </div>
            </article>

            {/* 3 List View Cards */}
            <div className="mobile-sub-stories-list">
              <div className="mobile-section-header" style={{ marginTop: "6px", marginBottom: "8px" }}>
                <h2 className="mobile-section-title">{lang === "HI" ? "मुख्य समाचार" : "Top Stories"}</h2>
                <Link href="/latest" className="mobile-see-all">{lang === "HI" ? "सभी देखें" : "See All"}</Link>
              </div>
              {displayList.filter((a) => a.id !== mainHero?.id).slice(0, 3).map((item, idx) => (
                <article key={item.id} className="mobile-list-card">
                  <Link href={`/article/${item.slug && item.slug.length > 1 ? item.slug : item.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                    <div className="mobile-list-thumb">
                      {getArticleImage(item, idx + 1) ? (
                        <img src={getArticleImage(item, idx + 1)} alt={item.title} />
                      ) : (
                        <div className="mobile-list-thumb-placeholder" />
                      )}
                    </div>
                    <div className="mobile-list-info">
                      <span className="mobile-list-cat" style={{ color: item.category?.color || "#e50914" }}>
                        {item.category?.name || (lang === "HI" ? "समाचार" : "NEWS")}
                      </span>
                      <h3 className="mobile-list-title">{item.title}</h3>
                      <div className="mobile-list-meta">
                        <span><Clock size={11} /> {timeStr}</span>
                        <span>•</span>
                        <span>{item.readTime || (lang === "HI" ? "3 मिनट" : "3 min")}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="mobile-no-articles">
            <h2>कोई समाचार नहीं</h2>
            <p>Admin से लेख प्रकाशित करें।</p>
          </div>
        )}
      </section>

      {/* ===========================
          MOBILE: TOP STORIES 2-COL GRID
          =========================== */}
      <section className="mobile-top-stories-section">
        <div className="mobile-section-header">
          <h2 className="mobile-section-title">{lang === "HI" ? "टॉप स्टोरीज़" : "Top Stories"}</h2>
          <Link href="/latest" className="mobile-see-all">{lang === "HI" ? "सभी देखें" : "See All"}</Link>
        </div>
        <div className="mobile-top-stories-grid">
          {topStories.slice(0, 4).map((item, idx) => (
            <article key={item.id} className="mobile-story-card">
              <Link href={`/article/${item.slug && item.slug.length > 1 ? item.slug : item.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
                <div className="mobile-story-img-wrap">
                  {getArticleImage(item, idx + 2) ? (
                    <img src={getArticleImage(item, idx + 2)} alt={item.title} className="mobile-story-img" />
                  ) : (
                    <div className="mobile-story-img-placeholder" />
                  )}
                  <span className="mobile-story-cat-badge" style={{ background: item.category?.color || "#e50914" }}>
                    {item.category?.name || (lang === "HI" ? "समाचार" : "NEWS")}
                  </span>
                </div>
                <h3 className="mobile-story-title">{item.title}</h3>
                <div className="mobile-story-footer" style={{ marginTop: "auto" }}>
                  <span className="mobile-story-time"><Clock size={11} /> {timeStr}</span>
                  <span className="mobile-story-readtime">{item.readTime || (lang === "HI" ? "4 मिनट" : "4 min")}</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ===========================
          MOBILE: STATE NEWS LIST SECTION
          =========================== */}
      <section className="mobile-state-section">
        <div className="mobile-section-header">
          <h2 className="mobile-section-title">{lang === "HI" ? "झारखंड" : "Jharkhand"}</h2>
          <Link href="/india" className="mobile-see-all">{lang === "HI" ? "सभी देखें" : "See All"}</Link>
        </div>
        <div className="mobile-state-list">
          {stateArticles.map((item, idx) => (
            <article key={item.id} className="mobile-state-item">
              <Link href={`/article/${item.slug && item.slug.length > 1 ? item.slug : item.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="mobile-state-thumb">
                  {getArticleImage(item, idx + 6) ? (
                    <img src={getArticleImage(item, idx + 6)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1e293b, #0f172a)", borderRadius: "10px" }} />
                  )}
                </div>
                <div className="mobile-state-content">
                  <h3 className="mobile-state-title">{item.title}</h3>
                  <div className="mobile-state-meta">
                    <span><Clock size={11} /> {timeStr}</span>
                    <span><Calendar size={11} /> {dateStr}</span>
                  </div>
                </div>
                <button className="mobile-state-bookmark" onClick={(e) => e.preventDefault()}>
                  <Bookmark size={18} />
                </button>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ===========================
          DESKTOP: Today's Top Stories Horizontal Carousel
          =========================== */}
      <section className="todays-top-stories-section desktop-top-stories" style={{ marginTop: "0px", marginBottom: "0px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <div>
            <h2 className="section-title" style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, textTransform: "uppercase", letterSpacing: "0.02em" }}>
              {t("todaysTopStories")}
            </h2>
            <span style={{ fontSize: "0.85rem", color: "var(--color-secondary)", marginTop: "4px", display: "block" }}>
              {lang === "HI" ? "दुनिया भर से संपादकीय मुख्य समाचारों की निरंतर धारा" : "Continuous real-time stream of editorial highlights from around the globe"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleScrollLeft} className="icon-btn-scroll" title="Scroll Left"><ChevronLeft size={20} /></button>
            <button onClick={handleScrollRight} className="icon-btn-scroll" title="Scroll Right"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div
          ref={carouselWrapperRef}
          className="top-stories-carousel-wrapper"
          onWheel={handleCarouselWheel}
        >
          <div
            ref={containerRef}
            className="top-stories-horizontal-grid"
          >
            {todaysTopStories.map((item, index) => (
              <article key={`${item.id}-${index}`} className="top-story-item">
                <Link href={`/article/${item.slug && item.slug.length > 1 ? item.slug : item.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div className="story-image-box">
                    {getArticleImage(item, index + 3) ? (
                      <img src={getArticleImage(item, index + 3)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }} />
                    )}
                    <span className="badge badge-accent" style={{ background: item.category?.color || "#e50914" }}>
                      {item.category?.name || (lang === "HI" ? "समाचार" : "NEWS")}
                    </span>
                    <span className="story-time-chip">{item.readTime || (lang === "HI" ? "4 मिनट पढ़ें" : "4 min read")}</span>
                  </div>
                  <div className="story-info-box">
                    <h3 className="story-heading">{item.title}</h3>
                    <div className="card-meta-row" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.74rem", color: "var(--color-secondary)", marginTop: "2px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontWeight: 500 }}>
                        <Clock size={12} />
                        {timeStr}
                      </span>
                      <span style={{ color: "var(--color-border)" }}>|</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontWeight: 500 }}>
                        <Calendar size={12} />
                        {dateStr}
                      </span>
                    </div>
                    <p className="story-brief">{stripHtml(item.summary)}</p>
                    <div className="story-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "8px" }}>
                      <span className="author-name">{t("by")} {item.author?.name || "Global Awaaz Admin"}</span>
                      <SocialShareButtons title={item.title} slug={item.slug} image={item.featuredImage} summary={item.summary} size="sm" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===========================
          Trending Videos Section
          =========================== */}
      <section className="trending-videos-section" style={{ marginTop: "-12px", marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <Link href="/videos" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "4px", height: "22px", background: "#e50914", borderRadius: "2px", display: "inline-block" }} />
              <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "6px", fontFamily: lang === "HI" ? "var(--font-hindi-heading, sans-serif)" : "inherit" }}>
                | {t("trendingVideos")}
                <ArrowRight size={22} style={{ color: "var(--color-text)", strokeWidth: 2.8 }} />
              </h2>
            </div>
          </Link>
          <Link href="/videos" style={{ color: "#e50914", textDecoration: "none", fontWeight: 800, fontSize: "0.88rem" }}>
            {t("seeAllVideos")}
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "20px 18px" }}>
          {trendingVideos.map((video) => (
            <Link
              key={video.id}
              href={`/videos?v=${video.youtubeId}`}
              style={{ textDecoration: "none", color: "inherit", cursor: "pointer", transition: "transform 0.2s ease" }}
            >
              <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#111", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)", transition: "background 0.2s ease" }} />
                <div style={{ position: "absolute", bottom: "8px", left: "8px", background: "rgba(0,0,0,0.85)", color: "#ffffff", padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <Play size={10} style={{ fill: "#ffffff", color: "#ffffff" }} />
                  <span>{video.duration || "01:08"}</span>
                </div>
              </div>
              <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--color-text)", marginTop: "10px", marginBottom: "0", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {video.title}
              </h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--color-secondary)", fontWeight: 600 }}>YouTube Video</span>
                <SocialShareButtons title={video.title} slug={`videos?v=${video.youtubeId}`} image={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Embedded YouTube Video Modal */}
      {activeVideoModal && (
        <div
          onClick={() => setActiveVideoModal(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "16px", width: "100%", maxWidth: "580px", overflow: "hidden", boxShadow: "0 25px 60px -10px rgba(0,0,0,0.85)", color: "#ffffff", display: "flex", flexDirection: "column" }}
          >
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #22222a", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                <span style={{ background: "#e50914", color: "#fff", padding: "3px 8px", borderRadius: "5px", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase" }}>
                  {activeVideoModal.category}
                </span>
                <h3 style={{ fontSize: "0.92rem", fontWeight: 700, margin: 0, color: "#fff", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {activeVideoModal.title}
                </h3>
              </div>
              <button onClick={() => setActiveVideoModal(null)} style={{ background: "#22222a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000" }}>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoModal.youtubeId}?autoplay=1&rel=0&enablejsapi=1`}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
            <div style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0a0c", borderTop: "1px solid #1a1a20", flexWrap: "wrap", gap: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={13} style={{ color: "#e50914" }} /> {t("duration")}: <strong>{activeVideoModal.duration || "01:08"}</strong>
              </span>
              <Link href="/videos" onClick={() => setActiveVideoModal(null)} style={{ color: "#e50914", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                {t("openVideoPortal")} <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Subscription Bar */}
      <section className="home-newsletter-section" style={{ background: "linear-gradient(135deg, #09090b 0%, #1c1917 100%)", color: "#ffffff", padding: "36px 24px", borderRadius: "20px", marginTop: "16px", marginBottom: "16px", boxShadow: "var(--shadow-md)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
          <Mail size={36} style={{ color: "#e50914", marginBottom: "12px" }} />
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px 0" }}>{t("newsletterTitle")}</h2>
          <p style={{ color: "#a1a1aa", fontSize: "0.95rem", margin: "0 0 24px 0", lineHeight: 1.5 }}>
            {t("newsletterDesc")}
          </p>
          <div className="form-wrap" style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <input
              type="email"
              placeholder="Enter your email address..."
              style={{ padding: "12px 18px", borderRadius: "10px", border: "none", fontSize: "0.95rem", minWidth: "280px", background: "#ffffff", color: "#09090b" }}
            />
            <button style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
              Subscribe Free
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
