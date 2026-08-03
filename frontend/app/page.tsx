"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bookmark, Mail, ShieldCheck, Zap, Users, PlayCircle, Play, ChevronLeft, ChevronRight, X, ExternalLink, Clock, Calendar } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getStoredVideos, YouTubeVideoItem } from "@/lib/youtube";
import SocialShareButtons from "@/components/SocialShareButtons";

import { defaultEnglishArticles, defaultHindiArticles, stripHtml } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  featuredImage?: string;
  category?: { name: string; slug: string; color?: string };
  author?: { name: string };
  readTime?: string;
  views?: number;
  status?: string;
  isPinned?: boolean;
  isHero?: boolean;
  language?: "EN" | "HI";
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
}


export default function HomePage() {
  const { lang, t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [trendingVideos, setTrendingVideos] = useState<YouTubeVideoItem[]>([]);
  const [activeVideoModal, setActiveVideoModal] = useState<YouTubeVideoItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

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
    return () => {
      window.removeEventListener("storage", fetchArticles);
      window.removeEventListener("ga_articles_updated", fetchArticles);
    };
  }, []);

  const handleScrollLeft = () => {
    setScrollOffset((prev) => prev + 300);
  };

  const handleScrollRight = () => {
    setScrollOffset((prev) => prev - 300);
  };

  const langFiltered = articles.filter((a) => {
    if (lang === "HI") {
      return a.language === "HI";
    }
    return a.language !== "HI" || !a.language;
  });

  const activeArticles = langFiltered.length > 0 ? langFiltered : articles;

  const displayList = activeArticles;

  const explicitHero = articles.find((a) => a.isHero && a.status !== "DRAFT") || displayList.find((a) => a.isHero);
  const mainHero = explicitHero || displayList[0] || null;

  const secondaryCandidates = displayList.filter((a) => a.id !== mainHero?.id);
  const secondaryHero = secondaryCandidates.slice(0, 4);

  const rawTopStories = displayList;
  const todaysTopStories = rawTopStories;

  return (
    <>
      {/* Editorial Hero Spotlight */}
      <section className="hero-section" style={{ marginTop: "24px" }}>
        <div className="hero-grid">
          {/* Primary Lead Story */}
          {mainHero ? (
            <article className="hero-main-card">
              <Link href={`/article/${mainHero.slug && mainHero.slug.length > 1 ? mainHero.slug : mainHero.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="hero-img-wrap" style={mainHero.imageHeight && mainHero.imageHeight !== "auto" ? { height: mainHero.imageHeight } : undefined}>
                  <img
                    src={mainHero.featuredImage || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80"}
                    alt={mainHero.title}
                    style={{ width: "100%", height: "100%", objectFit: mainHero.imageFit || "cover" }}
                  />
                  <span className="badge badge-accent" style={{ background: mainHero.category?.color || "#e50914" }}>
                    {mainHero.category?.name || (lang === "HI" ? "विदेश" : "WORLD")}
                  </span>
                  <span className="read-time-tag">{mainHero.readTime || (lang === "HI" ? "5 मिनट पढ़ें" : "5 min read")}</span>
                </div>
                <div className="hero-content">
                  <h1 className="hero-title">{mainHero.title}</h1>
                  {/* Time + Date meta row */}
                  <div className="card-meta-row" style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.78rem", color: "var(--color-secondary)" }}>
                    <span className="meta-time" style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
                      <Clock size={13} />
                      {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                    <span style={{ color: "var(--color-border)" }}>|</span>
                    <span className="meta-date" style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
                      <Calendar size={13} />
                      {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <p className="hero-summary">{stripHtml(mainHero.summary)}</p>
                  <div className="author-byline" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
                    <div>
                      <span>{t("by")} {mainHero.author?.name || "Global Awaaz Staff"}</span>
                      <span className="bullet">•</span>
                      <span>{lang === "HI" ? "12 मिनट पहले अपडेट किया गया" : "Updated 12m ago"}</span>
                    </div>
                    <SocialShareButtons title={mainHero.title} slug={mainHero.slug} size="md" />
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
            {secondaryHero.map((item) => (
              <article key={item.id} className="side-card">
                <Link href={`/article/${item.slug && item.slug.length > 1 ? item.slug : item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="side-img-wrap" style={item.imageHeight && item.imageHeight !== "auto" ? { height: item.imageHeight } : undefined}>
                    <img
                      src={item.featuredImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80"}
                      alt={item.title}
                      style={{ width: "100%", height: "100%", objectFit: item.imageFit || "cover" }}
                    />
                    <span className="badge badge-outline" style={{ color: item.category?.color || "#e50914" }}>
                      {item.category?.name || (lang === "HI" ? "समाचार" : "NEWS")}
                    </span>
                  </div>
                  <div className="side-content">
                    <h3 className="side-title">{item.title}</h3>
                    {/* Time + Date meta row */}
                    <div className="card-meta-row" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.74rem", color: "var(--color-secondary)", marginTop: "4px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontWeight: 500 }}>
                        <Clock size={12} />
                        {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                      <span style={{ color: "var(--color-border)" }}>|</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontWeight: 500 }}>
                        <Calendar size={12} />
                        {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      <span className="read-time">{item.readTime || (lang === "HI" ? "4 मिनट पढ़ें" : "4 min read")}</span>
                      <SocialShareButtons title={item.title} slug={item.slug} size="sm" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Top Stories Section */}
      <section className="todays-top-stories-section" style={{ marginTop: "48px", marginBottom: "48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
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

        {/* MARQUEE CAROUSEL WRAPPER */}
        <div className="top-stories-carousel-wrapper">
          <div
            ref={containerRef}
            className="top-stories-horizontal-grid"
            style={{
              transform: scrollOffset !== 0 ? `translateX(calc(-50% + ${scrollOffset}px))` : undefined,
              transition: scrollOffset !== 0 ? "transform 0.4s ease" : undefined
            }}
          >
            {todaysTopStories.map((item, index) => (
              <article key={`${item.id}-${index}`} className="top-story-item">
                <Link href={`/article/${item.slug && item.slug.length > 1 ? item.slug : item.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div className="story-image-box">
                    <img
                      src={item.featuredImage || "https://images.unsplash.com/photo-1579952318891-22008f861546?auto=format&fit=crop&w=800&q=80"}
                      alt={item.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span className="badge badge-accent" style={{ background: item.category?.color || "#e50914" }}>
                      {item.category?.name || (lang === "HI" ? "समाचार" : "NEWS")}
                    </span>
                    <span className="story-time-chip">{item.readTime || (lang === "HI" ? "4 मिनट पढ़ें" : "4 min read")}</span>
                  </div>
                  <div className="story-info-box">
                    <h3 className="story-heading">{item.title}</h3>
                    {/* Time + Date meta row */}
                    <div className="card-meta-row" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.74rem", color: "var(--color-secondary)", marginTop: "2px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontWeight: 500 }}>
                        <Clock size={12} />
                        {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                      <span style={{ color: "var(--color-border)" }}>|</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontWeight: 500 }}>
                        <Calendar size={12} />
                        {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p className="story-brief">{stripHtml(item.summary)}</p>
                    <div className="story-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "8px" }}>
                      <span className="author-name">{t("by")} {item.author?.name || "Global Awaaz Admin"}</span>
                      <SocialShareButtons title={item.title} slug={item.slug} size="sm" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Videos Section */}
      <section style={{ marginBottom: "60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <Link href="/videos" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "4px", height: "22px", background: "#e50914", borderRadius: "2px", display: "inline-block" }} />
              <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "6px", fontFamily: lang === "HI" ? "var(--font-hindi-heading, sans-serif)" : "inherit" }}>
                | {t("trendingVideos")}
                <ChevronRight size={22} style={{ color: "var(--color-text)", strokeWidth: 2.8 }} />
              </h2>
            </div>
          </Link>
          <Link href="/videos" style={{ color: "#e50914", textDecoration: "none", fontWeight: 800, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "4px" }}>
            {t("seeAllVideos")}
          </Link>
        </div>

        {/* Video Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "20px 18px" }}>
          {trendingVideos.map((video) => (
            <Link
              key={video.id}
              href={`/videos?v=${video.youtubeId}`}
              style={{ textDecoration: "none", color: "inherit", cursor: "pointer", transition: "transform 0.2s ease" }}
            >
              {/* Thumbnail Container */}
              <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#111", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
                
                {/* Dark Hover Overlay */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)", transition: "background 0.2s ease" }} />

                {/* Duration Badge Bottom-Left */}
                <div style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "8px",
                  background: "rgba(0, 0, 0, 0.85)",
                  color: "#ffffff",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  letterSpacing: "0.02em",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
                }}>
                  <Play size={10} style={{ fill: "#ffffff", color: "#ffffff" }} />
                  <span>{video.duration || "01:08"}</span>
                </div>
              </div>

              {/* Video Title */}
              <h3 style={{
                fontSize: "0.92rem",
                fontWeight: 700,
                color: "var(--color-text)",
                marginTop: "10px",
                marginBottom: "0",
                lineHeight: "1.4",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontFamily: lang === "HI" ? "var(--font-hindi-body, sans-serif)" : "inherit"
              }}>
                {video.title}
              </h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--color-secondary)", fontWeight: 600 }}>YouTube Video</span>
                <SocialShareButtons title={video.title} slug={`videos?v=${video.youtubeId}`} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Embedded YouTube Video Modal Player (Compact 580px Cinema Theater) */}
      {activeVideoModal && (
        <div
          onClick={() => setActiveVideoModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111115",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "580px",
              overflow: "hidden",
              boxShadow: "0 25px 60px -10px rgba(0,0,0,0.85)",
              color: "#ffffff",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #22222a", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                <span style={{ background: "#e50914", color: "#fff", padding: "3px 8px", borderRadius: "5px", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", flexShrink: 0 }}>
                  {activeVideoModal.category}
                </span>
                <h3 style={{ fontSize: "0.92rem", fontWeight: 700, margin: 0, color: "#fff", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                style={{ background: "#22222a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#e50914"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#22222a"; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Video Player */}
            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000" }}>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoModal.youtubeId}?autoplay=1&rel=0&enablejsapi=1`}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0a0c", borderTop: "1px solid #1a1a20", flexWrap: "wrap", gap: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={13} style={{ color: "#e50914" }} /> {t("duration")}: <strong>{activeVideoModal.duration || "01:08"}</strong>
              </span>
              <Link
                href="/videos"
                onClick={() => setActiveVideoModal(null)}
                style={{ color: "#e50914", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
              >
                {t("openVideoPortal")} <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Subscription Bar */}
      <section style={{ background: "linear-gradient(135deg, #09090b 0%, #1c1917 100%)", color: "#ffffff", padding: "40px 32px", borderRadius: "20px", marginBottom: "60px", boxShadow: "var(--shadow-md)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
          <Mail size={36} style={{ color: "#e50914", marginBottom: "12px" }} />
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px 0" }}>{t("newsletterTitle")}</h2>
          <p style={{ color: "#a1a1aa", fontSize: "0.95rem", margin: "0 0 24px 0", lineHeight: 1.5 }}>
            {t("newsletterDesc")}
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
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
