"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  Heart,
  Loader2,
  ArrowLeft,
  BookOpen,
  Zap,
  Megaphone,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Share2
} from "lucide-react";

import SocialShareButtons from "@/components/SocialShareButtons";
import {
  findDefaultArticle,
  stripHtml,
  getArticleImage,
  formatArticleSlug,
  getArticleUrl,
  allDefaultArticles
} from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { extractYouTubeId } from "@/lib/youtube";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Ensures strict SEO heading hierarchy for article body content:
 * - Demotes any injected <h1> to <h2> so there is strictly ONLY ONE <h1> on the page.
 * - Fixes heading levels to ensure standard SEO compliance (H1 -> H2 -> H3 -> H4 -> H5 -> H6).
 */
function sanitizeSemanticArticleBody(html: string): string {
  if (!html) return "";
  let clean = html;
  // Replace <h1> tags with <h2> to guarantee single H1 on page
  clean = clean.replace(/<h1(\s|>)/gi, "<h2$1").replace(/<\/h1>/gi, "</h2>");
  return clean;
}

export interface ArticleAdItem {
  id: string;
  title?: string;
  subtitle?: string;
  link?: string;
  image?: string;
  badge?: string;
  placement?: "both" | "right" | "left" | "body";
}

export interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  body: string;
  featuredImage: string;
  category?: { name: string; slug: string; color?: string };
  author?: { name: string; bio?: string };
  readTime?: string;
  views?: number;
  createdAt?: string;
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
  videoUrl?: string;
  language?: "HI" | "EN";
  // Custom Article-Specific Advertisement Fields
  adTitle?: string;
  adSubtitle?: string;
  adLink?: string;
  adImage?: string;
  adBadge?: string;
  // Multiple Custom Ads Array
  customAds?: ArticleAdItem[];
}

interface Props {
  slug: string;
  initialArticle?: ArticleDetail | null;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch { return dateStr; }
}

function formatTime(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function ArticleClientContent({ slug, initialArticle }: Props) {
  const { lang } = useLanguage();
  const [article, setArticle] = useState<ArticleDetail | null>(initialArticle || null);
  const [loading, setLoading] = useState(!initialArticle);

  const [likes, setLikes] = useState(initialArticle?.views || 42);
  const [hasLiked, setHasLiked] = useState(false);

  // Left column 1fr state — Side news items grid
  const [sideNews, setSideNews] = useState<any[]>([]);

  // Right column 1fr state — Admin advertisement settings
  const [adSettings, setAdSettings] = useState<Record<string, string>>({
    ad_leaderboard_title: "GLOBAL AWAAZ SPONSORSHIP",
    ad_leaderboard_subtitle: "Reach millions of active readers with custom banner campaigns across Bihar, Jharkhand & India",
    ad_leaderboard_link: "/advertise",
    ad_leaderboard_btn_text: "Advertise With Us",
    ad_sticky_text: "📢 SPECIAL ANNOUNCEMENT: Partner with Global Awaaz Digital News Platform!",
    ad_sticky_link: "/advertise",
    ad_sticky_badge: "SPONSORED",
    ad_sticky_bg: "#000000",
    ad_left_grid_enabled: "true",
    ad_left_grid_image: "",
    ad_left_grid_title: "GLOBAL AWAAZ SPONSORSHIP",
    ad_left_grid_subtitle: "Promote your brand to millions of readers across Bihar, Jharkhand & India.",
    ad_left_grid_link: "/advertise",
    ad_left_grid_btn_text: "Advertise With Us",
    ad_left_grid_badge: "SPONSORED"
  });

  useEffect(() => {
    async function loadArticle() {
      const targetSlug = decodeURIComponent(slug).trim().toLowerCase();

      // If initialArticle was provided from server SSR, we're set
      if (initialArticle) {
        setArticle(initialArticle);
        if (initialArticle.views) setLikes(initialArticle.views);
        setLoading(false);
        return;
      }

      // 2. Fetch from backend API
      try {
        const res = await fetch(API_ENDPOINTS.articleBySlug(targetSlug));
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setArticle(json.data);
            if (json.data.views) setLikes(json.data.views);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("API fetch failed:", err);
      }

      // 3. Fall back to built-in default articles
      const defaultFound = findDefaultArticle(targetSlug);
      if (defaultFound) {
        setArticle({
          ...defaultFound,
          featuredImage: defaultFound.featuredImage
        } as ArticleDetail);
        setLoading(false);
        return;
      }

      setLoading(false);
    }

    loadArticle();
  }, [slug, initialArticle]);

  // Load Left column news grid & Right column Admin ads
  useEffect(() => {
    async function loadSideNews() {
      let pool: any[] = [];
      try {
        const res = await fetch(API_ENDPOINTS.articles);
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data)) pool = json.data;
        }
      } catch (e) {}

      // No hardcoded fallback — related articles come from DB only


      const filtered = pool.filter((a: any) => a.slug !== slug && a.id !== slug);
      setSideNews(filtered.slice(0, 5));
    }

    async function loadAds() {
      try {
        const res = await fetch("/api/v1/ad-settings");
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            setAdSettings((prev) => ({ ...prev, ...json.data }));
          }
        }
      } catch (e) {}
    }

    loadSideNews();
    loadAds();
  }, [slug]);

  // Update dynamic document head meta tags whenever article loads or changes
  useEffect(() => {
    if (!article) return;

    const titleText = `${article.title} | GLOBAL AWAAZ - LOCAL से GLOBAL तक`;
    const cleanDesc = stripHtml(article.summary || article.body?.substring(0, 160) || "");
    
    let rawImg = article.featuredImage || "";
    let imgUrl = "https://www.globalawaaz.com/logo.png";
    if (rawImg && !rawImg.startsWith("data:image")) {
      if (rawImg.startsWith("https//")) rawImg = rawImg.replace("https//", "https://");
      if (rawImg.startsWith("http//")) rawImg = rawImg.replace("http//", "http://");
      
      const hostingerOrigin = process.env.HOSTINGER_MEDIA_ORIGIN || "https://yellowgreen-rook-384455.hostingersite.com";
      if (rawImg.includes("hostingersite.com") || rawImg.startsWith("/uploads/") || rawImg.startsWith("uploads/") || rawImg.startsWith("/public/uploads/")) {
        let cleanPath = rawImg;
        if (cleanPath.includes("hostingersite.com")) {
          cleanPath = cleanPath.substring(cleanPath.indexOf("hostingersite.com") + "hostingersite.com".length);
        }
        if (!cleanPath.startsWith("/")) cleanPath = `/${cleanPath}`;
        imgUrl = `${hostingerOrigin.replace(/\/$/, "")}${cleanPath}`;
      } else if (rawImg.startsWith("http://") || rawImg.startsWith("https://")) {
        imgUrl = rawImg.startsWith("https://globalawaaz.com") ? rawImg.replace("https://globalawaaz.com", "https://www.globalawaaz.com") : rawImg;
      } else {
        const cleanPath = rawImg.startsWith("/") ? rawImg : `/${rawImg}`;
        imgUrl = `https://www.globalawaaz.com${cleanPath}`;
      }
    }

    const shareUrl = typeof window !== "undefined" ? window.location.href : `https://www.globalawaaz.com/article/${slug}`;

    document.title = titleText;

    const setMeta = (attrName: string, attrVal: string, contentVal: string) => {
      if (!contentVal) return;
      let tag = document.head.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attrName, attrVal);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", contentVal);
    };

    setMeta("name", "description", cleanDesc);
    setMeta("property", "og:title", titleText);
    setMeta("property", "og:description", cleanDesc);
    setMeta("property", "og:image", imgUrl);
    setMeta("property", "og:image:secure_url", imgUrl);
    setMeta("property", "og:url", shareUrl);
    setMeta("name", "twitter:title", titleText);
    setMeta("name", "twitter:description", cleanDesc);
    setMeta("name", "twitter:image", imgUrl);
  }, [article, slug]);

  const handleLike = () => {
    setLikes((l) => (hasLiked ? l - 1 : l + 1));
    setHasLiked((h) => !h);
  };



  // Loading State
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 0", gap: "16px" }}>
        <Loader2 size={38} style={{ animation: "spin 1s linear infinite", color: "#e50914" }} />
        <p style={{ color: "var(--color-secondary)", fontSize: "0.9rem" }}>Loading article…</p>
      </div>
    );
  }

  // Not Found State
  if (!article) {
    return (
      <div style={{ maxWidth: "800px", margin: "80px auto", padding: "40px", textAlign: "center", background: "var(--color-card-bg)", borderRadius: "16px", border: "1px solid var(--color-border)" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "12px", color: "var(--color-primary)" }}>Article Not Found</h2>
        <p style={{ color: "var(--color-secondary)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "28px" }}>
          The article you&apos;re looking for is not available. It may have been removed or the URL may be incorrect.
        </p>
        <Link href="/" style={{ background: "#e50914", color: "#fff", padding: "12px 28px", borderRadius: "10px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  const categoryColor = article.category?.color || "#e50914";

  const getActiveAdList = (): ArticleAdItem[] => {
    if (article?.customAds && Array.isArray(article.customAds) && article.customAds.length > 0) {
      return article.customAds;
    }
    if (article?.adImage || article?.adTitle) {
      return [{
        id: "single_ad",
        title: article.adTitle,
        subtitle: article.adSubtitle,
        link: article.adLink,
        image: article.adImage,
        badge: article.adBadge || "SPONSORED",
        placement: "both"
      }];
    }
    return [];
  };

  const activeCustomAds = getActiveAdList();
  const leftCustomAds = activeCustomAds.filter((a) => !a.placement || a.placement === "both" || a.placement === "left");
  const rightCustomFilter = activeCustomAds.filter((a) => !a.placement || a.placement === "both" || a.placement === "right");
  const rightCustomAds = rightCustomFilter.length > 0
    ? rightCustomFilter
    : [{
        id: "global_ad",
        title: adSettings.ad_leaderboard_title || "GLOBAL AWAAZ SPONSORSHIP",
        subtitle: adSettings.ad_leaderboard_subtitle || "Promote your brand to millions of readers across Bihar, Jharkhand & India.",
        link: adSettings.ad_leaderboard_link || "/advertise",
        image: adSettings.ad_leaderboard_image || "",
        badge: adSettings.ad_leaderboard_badge || "ADVERTISEMENT"
      }];
  const bodyCustomFilter = activeCustomAds.filter((a) => !a.placement || a.placement === "both" || a.placement === "body");
  const bodyCustomAds = bodyCustomFilter.length > 0
    ? bodyCustomFilter
    : [{
        id: "global_ad",
        title: adSettings.ad_leaderboard_title || "GLOBAL AWAAZ SPONSORSHIP",
        subtitle: adSettings.ad_leaderboard_subtitle || "Promote your brand to millions of readers across Bihar, Jharkhand & India.",
        link: adSettings.ad_leaderboard_link || "/advertise",
        image: adSettings.ad_leaderboard_image || "",
        badge: adSettings.ad_leaderboard_badge || "ADVERTISEMENT"
      }];

  return (
    <div className="article-page-wrapper" style={{ maxWidth: "1440px", margin: "16px auto 80px auto", padding: "0 16px" }}>
      {/* 3-COLUMN RESPONSIVE LAYOUT: Center Main Column (FIRST in DOM for SEO H1 priority) | Left | Right */}
      <div className="article-3col-grid">
        {/* ========================================================
            CENTER COLUMN (2fr) — MAIN ARTICLE CONTENT (FIRST IN DOM)
           ======================================================== */}
        <main className="article-center-col" style={{ minWidth: 0 }}>
          {/* Back breadcrumb */}
          <div style={{ padding: "0 0 16px 0" }}>
            <Link
              href="/"
              style={{ color: "var(--color-secondary)", textDecoration: "none", fontSize: "0.84rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s ease" }}
            >
              <ArrowLeft size={15} /> {lang === "HI" ? "ग्लोबल आवाज़ मुख्य पृष्ठ पर लौटें" : "Back to Global Awaaz"}
            </Link>
          </div>

          {/* Category badge + Title */}
          <div style={{ marginBottom: "20px" }}>
            <span style={{
              display: "inline-block", background: categoryColor, color: "#fff",
              fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.06em", padding: "5px 12px", borderRadius: "6px", marginBottom: "14px"
            }}>
              {article.category?.name || "EDITORIAL"}
            </span>

            <h1 style={{
              fontFamily: "serif", fontSize: "clamp(1.6rem, 5vw, 2.5rem)",
              fontWeight: 800, lineHeight: 1.2, margin: "0 0 14px 0",
              color: "var(--color-primary)", letterSpacing: "-0.01em"
            }}>
              {article.title}
            </h1>

            {article.summary && (
              <p style={{ fontSize: "1.08rem", fontWeight: 400, color: "var(--color-secondary)", lineHeight: 1.65, margin: "0 0 16px 0" }}>
                {stripHtml(article.summary)}
              </p>
            )}
          </div>

          {/* Author + meta bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)",
            padding: "14px 0", marginBottom: "28px", flexWrap: "wrap", gap: "14px"
          }}>
            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "50%",
                background: "linear-gradient(135deg, #e50914, #ff6b6b)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: "1rem", flexShrink: 0
              }}>
                {(article.author?.name || "G")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.94rem" }}>{article.author?.name || "Global Awaaz Admin"}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-secondary)" }}>
                  {article.author?.bio || (article.author?.name === "Global Awaaz Admin" ? "Chief Editor & Administrator at Global Awaaz." : "Editor & Correspondent at Global Awaaz")}
                </div>
              </div>
            </div>

            {/* Meta: time | date | read time | likes | share */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--color-secondary)", fontWeight: 500 }}>
                <Clock size={14} /> {formatTime(article.createdAt)}
              </span>
              <span style={{ color: "var(--color-border)", fontSize: "0.8rem" }}>|</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--color-secondary)", fontWeight: 500 }}>
                <Calendar size={14} /> {formatDate(article.createdAt)}
              </span>
              <span style={{ color: "var(--color-border)", fontSize: "0.8rem" }}>|</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--color-secondary)", fontWeight: 500 }}>
                <BookOpen size={14} /> {article.readTime || "5 min read"}
              </span>
              <span style={{ color: "var(--color-border)", fontSize: "0.8rem" }}>|</span>
              <button
                onClick={handleLike}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: hasLiked ? "#e50914" : "var(--color-secondary)", fontWeight: 600, fontSize: "0.8rem", padding: 0 }}
              >
                <Heart size={16} fill={hasLiked ? "#e50914" : "none"} stroke={hasLiked ? "#e50914" : "currentColor"} /> {likes}
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div style={{
            position: "relative",
            marginBottom: "32px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
            height: article.imageHeight && article.imageHeight !== "auto" ? article.imageHeight : undefined
          }}>
            <img
              src={getArticleImage(article)}
              alt={article.title}
              style={{
                width: "100%",
                height: "100%",
                maxHeight: article.imageHeight ? "none" : "480px",
                objectFit: article.imageFit || "cover",
                display: "block"
              }}
            />
            <div style={{ position: "absolute", bottom: "16px", right: "16px" }}>
              <SocialShareButtons
                title={article.title}
                slug={slug}
                categorySlug={article.category?.slug || "top-news"}
                image={article.featuredImage}
                summary={article.summary}
                size="md"
              />
            </div>
          </div>

          {/* Embedded Article Video Story Player */}
          {article.videoUrl && article.videoUrl.trim() && (
            <div style={{
              position: "relative",
              marginBottom: "32px",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              aspectRatio: "16 / 9",
              background: "#0a0a0c",
              border: "2px solid #e50914"
            }}>
              {extractYouTubeId(article.videoUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(article.videoUrl)}?autoplay=1&mute=1`}
                  title={article.title}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={article.videoUrl}
                  controls
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
          )}

          {/* Article Body */}
          <div style={{ fontSize: "1.08rem", lineHeight: 1.85, color: "var(--color-primary)", letterSpacing: "0.01em" }}>
            {article.body && article.body.includes("<") ? (
              <div
                className="rich-article-body"
                dangerouslySetInnerHTML={{ __html: sanitizeSemanticArticleBody(article.body) }}
              />
            ) : (
              article.body
                .split("\n")
                .map((p) => p.trim())
                .filter(Boolean)
                .map((para, i) => {
                  const currentAd = bodyCustomAds[i % bodyCustomAds.length];
                  return (
                    <React.Fragment key={i}>
                      <p style={{ marginBottom: "1em", textAlign: "justify" }}>
                        {para}
                      </p>
                      {/* Insert Mid-Story In-Article Advertisement Banner after 2nd paragraph */}
                      {i === 1 && currentAd && (
                        <div style={{
                          margin: "20px 0",
                          padding: "16px 20px",
                          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                          color: "#ffffff",
                          borderRadius: "14px",
                          border: "1px solid rgba(255,255,255,0.12)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ background: "#e50914", color: "#fff", fontSize: "0.65rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              {currentAd.badge || "SPONSORED"}
                            </span>
                            <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>
                              GLOBAL AWAAZ SPONSORSHIP
                            </span>
                          </div>
                          {currentAd.image ? (
                            <a href={currentAd.link || "/advertise"} target="_blank" rel="noopener noreferrer">
                              <img src={currentAd.image} alt="Sponsored Ad" style={{ width: "100%", height: "auto", borderRadius: "8px", objectFit: "cover" }} />
                            </a>
                          ) : (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                              <div>
                                <h3 style={{ margin: "0 0 4px 0", fontSize: "1rem", fontWeight: 800, color: "#ffffff" }}>
                                  {currentAd.title || "GLOBAL AWAAZ DIGITAL SPONSORSHIP"}
                                </h3>
                                <p style={{ margin: 0, fontSize: "0.82rem", color: "#cbd5e1" }}>
                                  {currentAd.subtitle || "Promote your brand to millions of readers across Bihar, Jharkhand & India."}
                                </p>
                              </div>
                              <Link
                                href={currentAd.link || "/advertise"}
                                style={{
                                  background: "#e50914", color: "#ffffff", padding: "8px 16px", borderRadius: "8px",
                                  fontWeight: 800, fontSize: "0.8rem", textDecoration: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "6px"
                                }}
                              >
                                {adSettings.ad_leaderboard_btn_text || "Advertise With Us"} <ExternalLink size={13} />
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
            )}

            <blockquote style={{
              borderLeft: `4px solid ${categoryColor}`,
              paddingLeft: "16px",
              fontStyle: "italic",
              fontSize: "1.08rem",
              margin: "16px 0 20px 0",
              color: "var(--color-primary)",
              fontFamily: "serif",
              lineHeight: 1.55
            }}>
              &quot;The convergence of information, technology, and global transparency represents the foundation of responsible journalism.&quot;
            </blockquote>
          </div>

          {/* Related Articles Section (H2 Header -> H3 per Story Title) */}
          {sideNews.length > 0 && (
            <section style={{ margin: "32px 0 24px 0" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "2px solid #e50914",
                paddingBottom: "10px",
                marginBottom: "16px"
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: "1.15rem",
                  fontWeight: 900,
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <BookOpen size={18} style={{ color: "#e50914" }} />
                  {lang === "HI" ? "संबंधित प्रमुख खबरें एवं ताज़ा अपडेट्स" : "Related News Coverage & Analysis"}
                </h2>
                <Link
                  href={`/${article.category?.slug || ""}`}
                  style={{ fontSize: "0.78rem", color: "#e50914", fontWeight: 800, textDecoration: "none" }}
                >
                  {lang === "HI" ? "सभी संबंधित खबरें देखें →" : "View All Stories →"}
                </Link>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px"
              }}>
                {sideNews.slice(0, 3).map((relItem, relIdx) => (
                  <article
                    key={relItem.id || relIdx}
                    style={{
                      background: "var(--color-card-bg, #ffffff)",
                      border: "1px solid var(--color-border, #e2e8f0)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "var(--shadow-sm)",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <Link href={getArticleUrl(relItem)} style={{ textDecoration: "none", color: "inherit" }}>
                      <div style={{ height: "120px", overflow: "hidden", position: "relative", background: "#0f172a" }}>
                        <img
                          src={getArticleImage(relItem, relIdx)}
                          alt={relItem.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <span style={{
                          position: "absolute", top: "8px", left: "8px",
                          background: "#e50914", color: "#ffffff",
                          fontSize: "0.62rem", fontWeight: 800,
                          padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase"
                        }}>
                          {relItem.category?.name || "NEWS"}
                        </span>
                      </div>
                      <div style={{ padding: "12px" }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: "0.92rem",
                          fontWeight: 800,
                          lineHeight: 1.4,
                          color: "var(--color-text, #0f172a)",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}>
                          {relItem.title}
                        </h3>
                        <span style={{ fontSize: "0.74rem", color: "var(--color-secondary)", marginTop: "6px", display: "inline-block" }}>
                          {formatDate(relItem.createdAt)}
                        </span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Bottom Social Media Share Bar */}
          <div style={{
            margin: "28px 0 16px 0",
            padding: "18px 24px",
            background: "var(--color-card-bg, #ffffff)",
            borderRadius: "16px",
            border: "1px solid var(--color-border, #e2e8f0)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #e50914, #ff6b6b)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(229, 9, 20, 0.25)",
                flexShrink: 0
              }}>
                <Share2 size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800, color: "var(--color-primary)" }}>
                  {lang === "HI" ? "इस खबर को सोशल मीडिया पर शेयर करें" : "Share This Story On Social Media"}
                </h2>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "var(--color-secondary)" }}>
                  {lang === "HI" ? "व्हाट्सएप, एक्स (ट्विटर), फेसबुक या डायरेक्ट लिंक द्वारा साझा करें" : "Directly share via WhatsApp, X (Twitter), Facebook or Direct Link"}
                </p>
              </div>
            </div>

            <SocialShareButtons
              title={article.title}
              slug={slug}
              categorySlug={article.category?.slug || "top-news"}
              image={article.featuredImage}
              summary={article.summary}
              size="lg"
            />
          </div>
        </main>

        {/* ========================================================
            LEFT COLUMN (1fr) — ALL NEWS SECTION GRID & ADVERTISEMENTS
           ======================================================== */}
        <aside
          className="article-left-col"
          style={{
            position: "sticky",
            top: "90px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxHeight: "calc(100vh - 110px)",
            overflowY: "auto",
            scrollbarWidth: "none"
          }}
        >
          {/* CARD 1: TOP NEWS GRID */}
          <div
            style={{
              background: "var(--color-card-bg, #ffffff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "14px",
              padding: "16px",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #e50914", paddingBottom: "8px", marginBottom: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 900, color: "#e50914", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={15} style={{ fill: "#e50914" }} />
                {lang === "HI" ? "मुख्य समाचार ग्रिड" : "Top News Grid"}
              </h2>
              <Link href="/" style={{ fontSize: "0.74rem", color: "var(--color-secondary)", fontWeight: 700, textDecoration: "none" }}>
                {lang === "HI" ? "सभी देखें →" : "View All →"}
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sideNews.map((item, idx) => (
                <article key={item.id || idx} style={{ borderBottom: idx < sideNews.length - 1 ? "1px solid var(--color-border, #f1f5f9)" : "none", paddingBottom: "10px" }}>
                  <Link href={getArticleUrl(item)} style={{ textDecoration: "none", color: "inherit", display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ width: "70px", height: "55px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#0f172a" }}>
                      <img src={getArticleImage(item, idx)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: "0.62rem", fontWeight: 800, color: item.category?.color || "#e50914",
                        textTransform: "uppercase", letterSpacing: "0.03em", display: "block", marginBottom: "2px"
                      }}>
                        {item.category?.name || "NEWS"}
                      </span>
                      <h3 style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: "var(--color-text, #0f172a)" }}>
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* CARD 2: STANDALONE ADVERTISEMENT CARD (BELOW TOP NEWS GRID CARD) */}
          {leftCustomAds.length > 0 ? (
            leftCustomAds.map((adItem, index) => (
              <div
                key={adItem.id || index}
                style={{
                  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                  color: "#ffffff",
                  borderRadius: "14px",
                  padding: "16px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.14)",
                  flexShrink: 0
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ background: "#e50914", color: "#fff", fontSize: "0.62rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {adItem.badge || "SPONSORED"}
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>
                    ADVERTISEMENT
                  </span>
                </div>
                {adItem.image ? (
                  <a href={adItem.link || "/advertise"} target="_blank" rel="noopener noreferrer">
                    {adItem.title || adItem.subtitle ? (
                      <div style={{ marginBottom: "8px" }}>
                        {adItem.title && <div style={{ margin: "0 0 2px 0", fontSize: "0.88rem", fontWeight: 800, color: "#ffffff" }}>{adItem.title}</div>}
                        {adItem.subtitle && <p style={{ margin: 0, fontSize: "0.76rem", color: "#cbd5e1" }}>{adItem.subtitle}</p>}
                      </div>
                    ) : null}
                    <img
                      src={adItem.image}
                      alt={adItem.title || "Grid Ad Banner"}
                      style={{ width: "100%", height: "auto", borderRadius: "8px", objectFit: "cover", display: "block" }}
                    />
                  </a>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "#ffffff", lineHeight: 1.35 }}>
                      {adItem.title || "GLOBAL AWAAZ SPONSORSHIP"}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#cbd5e1", lineHeight: 1.4 }}>
                      {adItem.subtitle || "Promote your brand to millions of readers across Bihar, Jharkhand & India."}
                    </p>
                    <Link
                      href={adItem.link || "/advertise"}
                      style={{
                        background: "#e50914",
                        color: "#ffffff",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        width: "fit-content",
                        marginTop: "4px"
                      }}
                    >
                      {adSettings.ad_left_grid_btn_text || "Advertise With Us"} <ExternalLink size={12} />
                    </Link>
                  </div>
                )}
              </div>
            ))
          ) : adSettings.ad_left_grid_enabled !== "false" && (
            <div
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "#ffffff",
                borderRadius: "14px",
                padding: "16px",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 4px 18px rgba(0,0,0,0.14)",
                flexShrink: 0
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ background: "#e50914", color: "#fff", fontSize: "0.62rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {adSettings.ad_left_grid_badge || "SPONSORED"}
                </span>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>
                  ADVERTISEMENT
                </span>
              </div>
              {adSettings.ad_left_grid_image ? (
                <a href={adSettings.ad_left_grid_link || "/advertise"} target="_blank" rel="noopener noreferrer">
                  {adSettings.ad_left_grid_title ? (
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ margin: "0 0 2px 0", fontSize: "0.88rem", fontWeight: 800, color: "#ffffff" }}>{adSettings.ad_left_grid_title}</div>
                      {adSettings.ad_left_grid_subtitle && <p style={{ margin: 0, fontSize: "0.76rem", color: "#cbd5e1" }}>{adSettings.ad_left_grid_subtitle}</p>}
                    </div>
                  ) : null}
                  <img
                    src={adSettings.ad_left_grid_image}
                    alt="Grid Ad Banner"
                    style={{ width: "100%", height: "auto", borderRadius: "8px", objectFit: "cover", display: "block" }}
                  />
                </a>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "#ffffff", lineHeight: 1.35 }}>
                    {adSettings.ad_left_grid_title || "GLOBAL AWAAZ SPONSORSHIP"}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#cbd5e1", lineHeight: 1.4 }}>
                    {adSettings.ad_left_grid_subtitle || "Promote your brand to millions of readers across Bihar, Jharkhand & India."}
                  </p>
                  <Link
                    href={adSettings.ad_left_grid_link || "/advertise"}
                    style={{
                      background: "#e50914",
                      color: "#ffffff",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      width: "fit-content",
                      marginTop: "4px"
                    }}
                  >
                    {adSettings.ad_left_grid_btn_text || "Advertise With Us"} <ExternalLink size={12} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* ========================================================
            RIGHT COLUMN (1fr) — ADVERTISEMENTS FROM ADMIN
           ======================================================== */}
        <aside
          className="article-right-col"
          style={{
            position: "sticky",
            top: "90px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxHeight: "calc(100vh - 110px)",
            overflowY: "auto",
            scrollbarWidth: "none"
          }}
        >
          {/* Header Badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #e50914", paddingBottom: "8px" }}>
            <h2 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 900, color: "#e50914", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "6px" }}>
              <Megaphone size={16} />
              {lang === "HI" ? "प्रायोजित विज्ञापन" : "Sponsored Ads"} ({rightCustomAds.length})
            </h2>
            <span style={{ background: "#e50914", color: "#fff", fontSize: "0.62rem", padding: "2px 6px", borderRadius: "4px", fontWeight: 800 }}>
              AD
            </span>
          </div>

          {/* Render custom right column ads */}
          {rightCustomAds.map((adItem, index) => (
            <div
              key={adItem.id || index}
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "#ffffff",
                borderRadius: "14px",
                padding: "16px",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 4px 18px rgba(0,0,0,0.14)",
                flexShrink: 0
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ background: "#e50914", color: "#fff", fontSize: "0.62rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {adItem.badge || "SPONSORED"}
                </span>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>
                  ADVERTISEMENT
                </span>
              </div>
              {adItem.image ? (
                <a href={adItem.link || "/advertise"} target="_blank" rel="noopener noreferrer">
                  {adItem.title || adItem.subtitle ? (
                    <div style={{ marginBottom: "8px" }}>
                      {adItem.title && <div style={{ margin: "0 0 2px 0", fontSize: "0.88rem", fontWeight: 800, color: "#ffffff" }}>{adItem.title}</div>}
                      {adItem.subtitle && <p style={{ margin: 0, fontSize: "0.76rem", color: "#cbd5e1" }}>{adItem.subtitle}</p>}
                    </div>
                  ) : null}
                  <img
                    src={adItem.image}
                    alt={adItem.title || "Right Ad Banner"}
                    style={{ width: "100%", height: "auto", borderRadius: "8px", objectFit: "cover", display: "block" }}
                  />
                </a>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "#ffffff", lineHeight: 1.35 }}>
                    {adItem.title || "GLOBAL AWAAZ SPONSORSHIP"}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#cbd5e1", lineHeight: 1.4 }}>
                    {adItem.subtitle || "Promote your brand to millions of readers across Bihar, Jharkhand & India."}
                  </p>
                  <Link
                    href={adItem.link || "/advertise"}
                    style={{
                      background: "#e50914",
                      color: "#ffffff",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      width: "fit-content",
                      marginTop: "4px"
                    }}
                  >
                    {adSettings.ad_leaderboard_btn_text || "Advertise With Us"} <ExternalLink size={12} />
                  </Link>
                </div>
              )}
            </div>
          ))}

          {/* Ad Card 2: Sticky Announcement Banner Ad */}
          <div style={{
            background: adSettings.ad_sticky_bg || "#000000",
            color: "#ffffff",
            borderRadius: "14px",
            padding: "14px 16px",
            border: "1px solid #e50914",
            boxShadow: "0 4px 16px rgba(229,9,20,0.15)"
          }}>
            <span style={{ background: "#e50914", color: "#fff", fontSize: "0.62rem", padding: "2px 6px", borderRadius: "4px", fontWeight: 800, marginBottom: "6px", display: "inline-block" }}>
              {adSettings.ad_sticky_badge || "SPONSORED"}
            </span>
            <p style={{ margin: "0 0 10px 0", fontSize: "0.82rem", fontWeight: 700, lineHeight: 1.45, color: "#ffffff" }}>
              {adSettings.ad_sticky_text || "📢 SPECIAL ANNOUNCEMENT: Partner with Global Awaaz Digital News Platform!"}
            </p>
            <Link
              href={adSettings.ad_sticky_link || "/advertise"}
              style={{
                color: "#f87171",
                fontWeight: 800,
                fontSize: "0.78rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              {lang === "HI" ? "अधिक जानकारी ▶" : "Learn More ▶"}
            </Link>
          </div>

          {/* Ad Card 3: Direct Admin Booking Box */}
          <div style={{
            background: "var(--color-card-bg, #ffffff)",
            border: "2px dashed var(--color-border, #cbd5e1)",
            borderRadius: "14px",
            padding: "16px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "6px" }}>🎯</div>
            <div style={{ margin: "0 0 6px 0", fontSize: "0.92rem", fontWeight: 800, color: "var(--color-primary)" }}>
              {lang === "HI" ? "यहाँ अपना विज्ञापन दिखाएँ" : "Place Your Banner Here"}
            </div>
            <p style={{ margin: "0 0 12px 0", fontSize: "0.76rem", color: "var(--color-secondary)", lineHeight: 1.4 }}>
              {lang === "HI" ? "लाखों पाठकों तक सीधे पहुँचें।" : "Direct target reach for business & brand campaigns."}
            </p>
            <Link
              href="/advertise"
              style={{
                background: "var(--color-primary, #0f172a)",
                color: "#ffffff",
                padding: "7px 16px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-block"
              }}
            >
              {lang === "HI" ? "विज्ञापन दरें देखें" : "View Ad Rates"}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
