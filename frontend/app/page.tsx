"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Bookmark, Mail, Zap, Play, ChevronLeft, ChevronRight, X, ExternalLink, Clock, Calendar, ChevronRight as ArrowRight, Share2, Loader2, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getStoredVideos, fetchCentralVideos, extractYouTubeId, YouTubeVideoItem } from "@/lib/youtube";
import SocialShareButtons from "@/components/SocialShareButtons";
import { INDIAN_STATES, IndianState, autoDetectUserIndianState } from "@/lib/states";
import { INDIAN_DISTRICTS, getDistrictsForState, autoDetectUserCity } from "@/lib/districts";

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
  isSuperfast?: boolean;
  status?: string;
  language?: "EN" | "HI";
  state?: string;
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
  videoUrl?: string;
  district?: string;
  isTrending?: boolean;
}

export default function Home() {
  const { lang, t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoModal, setActiveVideoModal] = useState<YouTubeVideoItem | null>(null);
  const [trendingVideos, setTrendingVideos] = useState<YouTubeVideoItem[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [userState, setUserState] = useState<IndianState>(
    INDIAN_STATES.find((s) => s.code === "JH") || INDIAN_STATES[0]
  );
  const [userCity, setUserCity] = useState("Ranchi");
  const [stickyAdData, setStickyAdData] = useState<{
    enabled: boolean;
    badge: string;
    text: string;
    link: string;
    image: string;
    bg: string;
    height: string;
  }>({
    enabled: true,
    badge: "SPONSORED",
    text: "Grow your brand with Global Awaaz Digital News Platform — Get 50% Off First Ad Booking!",
    link: "/advertise",
    image: "",
    bg: "#000000",
    height: "auto"
  });

  const [liveTvConfig, setLiveTvConfig] = useState({
    channelTitle: "GLOBAL AWAAZ NEWS 24/7",
    subtitle: "लाइव न्यूज़ बुलेटिन और मुख्य समाचार प्रसारण",
    streamUrl: "",
    googleNewsUrl: "https://news.google.com",
    whatsappUrl: "https://whatsapp.com"
  });
  const [isPlayingLive, setIsPlayingLive] = useState(false);

  const [leaderboardAdData, setLeaderboardAdData] = useState<{
    enabled: boolean;
    image: string;
    title: string;
    subtitle: string;
    link: string;
    btnText: string;
    badge: string;
    height: string;
  }>({
    enabled: true,
    image: "",
    title: "GLOBAL AWAAZ DIGITAL MEDIA COVERAGE",
    subtitle: "Get real-time news updates across Bihar, Jharkhand & National headlines 24/7",
    link: "/advertise",
    btnText: "Advertise With Us",
    badge: "ADVERTISEMENT",
    height: "110"
  });

  const [adDismissed, setAdDismissed] = useState(false);
  const [leaderboardAdDismissed, setLeaderboardAdDismissed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const carouselWrapperRef = useRef<HTMLDivElement>(null);

  const loadStickyAdSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/ad-settings");
      const json = await res.json();
      if (json.success && json.data) {
        setStickyAdData({
          enabled: json.data.ad_sticky_enabled !== "false",
          badge: json.data.ad_sticky_badge || "SPONSORED",
          text: json.data.ad_sticky_text || "📢 Reach Millions of Readers with Global Awaaz Sponsorships!",
          link: json.data.ad_sticky_link || "/advertise",
          image: json.data.ad_sticky_image || "",
          bg: (json.data.ad_sticky_bg && !json.data.ad_sticky_bg.includes("#1e293b")) ? json.data.ad_sticky_bg : "#000000",
          height: json.data.ad_sticky_height || "auto"
        });
        setLeaderboardAdData({
          enabled: json.data.ad_leaderboard_enabled !== "false",
          image: json.data.ad_leaderboard_image || "",
          title: json.data.ad_leaderboard_title || "GLOBAL AWAAZ DIGITAL MEDIA COVERAGE",
          subtitle: json.data.ad_leaderboard_subtitle || "Get real-time news updates across Bihar, Jharkhand & National headlines 24/7",
          link: json.data.ad_leaderboard_link || "/advertise",
          btnText: json.data.ad_leaderboard_btn_text || "Advertise With Us",
          badge: json.data.ad_leaderboard_badge || "ADVERTISEMENT",
          height: json.data.ad_leaderboard_height || "110"
        });
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadStickyAdSettings();
    const handleUpdate = () => loadStickyAdSettings();
    window.addEventListener("ga_sticky_ad_updated", handleUpdate);
    return () => window.removeEventListener("ga_sticky_ad_updated", handleUpdate);
  }, [loadStickyAdSettings]);

  useEffect(() => {
    const updateVideos = () => {
      // 1. Immediate local cache load
      setTrendingVideos(getStoredVideos());

      // 2. Fetch central database videos across all devices & computers
      fetchCentralVideos().then(({ videos, liveTvConfig }) => {
        if (Array.isArray(videos) && videos.length > 0) {
          setTrendingVideos(videos);
        }
        if (liveTvConfig) {
          setLiveTvConfig((prev) => ({
            ...prev,
            ...liveTvConfig
          }));
        }
      });
    };

    updateVideos();
    window.addEventListener("storage", updateVideos);
    window.addEventListener("ga_videos_updated", updateVideos);
    return () => {
      window.removeEventListener("storage", updateVideos);
      window.removeEventListener("ga_videos_updated", updateVideos);
    };
  }, []);

  useEffect(() => {
    const loadUserState = async () => {
      const stored = localStorage.getItem("ga_selected_state");
      if (stored) {
        const match = INDIAN_STATES.find(
          (s) => s.code === stored || s.slug === stored || s.nameEn.toLowerCase() === stored.toLowerCase()
        );
        if (match) {
          setUserState(match);
          return;
        }
      }

      const detected = await autoDetectUserIndianState();
      if (detected) {
        setUserState(detected);
        localStorage.setItem("ga_selected_state", detected.code);
      }
    };

    loadUserState();
    window.addEventListener("ga_state_changed", loadUserState);
    return () => window.removeEventListener("ga_state_changed", loadUserState);
  }, []);

  const handleSelectState = (stCode: string) => {
    const match = INDIAN_STATES.find((s) => s.code === stCode || s.slug === stCode);
    if (match) {
      setUserState(match);
      localStorage.setItem("ga_selected_state", match.code);
      window.dispatchEvent(new Event("ga_state_changed"));
    }
  };

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

    const loadLiveConfig = () => {
      try {
        const saved = localStorage.getItem("ga_livetv_config");
        if (saved) {
          const parsed = JSON.parse(saved);
          setLiveTvConfig((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {}
    };
    loadLiveConfig();
    window.addEventListener("ga_livetv_config_updated", loadLiveConfig);

    const syncLocation = async () => {
      try {
        const isManuallySelected = sessionStorage.getItem("ga_manual_city_selected") === "true";
        const storedState = localStorage.getItem("ga_selected_state");
        const storedCity = localStorage.getItem("ga_selected_city");
        if (isManuallySelected && storedCity && storedState) {
          const found = INDIAN_STATES.find(s => s.code === storedState || s.nameEn.toLowerCase() === storedState.toLowerCase());
          if (found) setUserState(found);
          setUserCity(storedCity);
        } else {
          // Dynamic IP / VPN Geolocation Detection
          const detected = await autoDetectUserCity();
          if (detected) {
            setUserCity(detected.city);
            const stObj = INDIAN_STATES.find((s) => s.code === detected.stateCode);
            if (stObj) setUserState(stObj);
          }
        }
      } catch (e) {}
    };

    syncLocation();
    window.addEventListener("ga_state_changed", syncLocation);

    return () => {
      window.removeEventListener("storage", fetchArticles);
      window.removeEventListener("ga_articles_updated", fetchArticles);
      window.removeEventListener("ga_epaper_updated", fetchArticles);
      window.removeEventListener("ga_livetv_config_updated", loadLiveConfig);
      window.removeEventListener("ga_state_changed", syncLocation);
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

  const userCityLower = userCity.toLowerCase().trim();
  const userStateLower = userState.nameEn.toLowerCase().trim();

  // 1. HIGHEST PRIORITY: Geo-Location City News (e.g., Ranchi news for Ranchi visitors)
  const cityHero = displayList.find((a) => {
    if (!a.district) return false;
    const dLower = a.district.toLowerCase().trim();
    return dLower.includes(userCityLower) || userCityLower.includes(dLower);
  });

  // 2. SECOND PRIORITY: Geo-Location State News (e.g., Jharkhand news for Jharkhand visitors)
  const stateHero = displayList.find((a) => {
    if (!a.state) return false;
    const sLower = a.state.toLowerCase().trim();
    return sLower === userStateLower || userStateLower.includes(sLower);
  });

  // 3. THIRD PRIORITY: Admin Set Hero Article
  const explicitHero = articles.find((a) => a.isHero && a.status !== "DRAFT") || displayList.find((a) => a.isHero);

  const mainHero = cityHero || stateHero || explicitHero || displayList[0];
  const secondaryHero = displayList.filter((a) => a.id !== mainHero?.id).slice(0, 4);
  const topStories = displayList.filter((a) => a.id !== mainHero?.id).slice(0, 6);

  const superfastArticles = displayList.filter((a) => a.isSuperfast);
  const superfastList = superfastArticles.length > 0
    ? superfastArticles.slice(0, 5)
    : displayList.filter((a) => a.id !== mainHero?.id).slice(0, 5);
  
  const locationNews = displayList.filter((a) => {
    if (a.district && a.district.toLowerCase().includes(userCity.toLowerCase())) return true;
    if (!a.state) return false;
    const stLower = a.state.toLowerCase();
    const nameEnLower = userState.nameEn.toLowerCase();
    const codeLower = userState.code.toLowerCase();
    const slugLower = userState.slug.toLowerCase();
    return stLower === nameEnLower || stLower === codeLower || stLower === slugLower;
  });

  const stateArticles = locationNews.length > 0
    ? locationNews.slice(0, 6)
    : displayList.filter((a) => a.id !== mainHero?.id).slice(0, 6);

  const trendingArticles = displayList.filter((a) => a.isTrending);
  const trendingList = trendingArticles.length > 0
    ? trendingArticles.slice(0, 6)
    : displayList.filter((a) => a.id !== mainHero?.id).slice(0, 6);
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
          SPOTLIGHT NEWS GRID (Image 2 News Media Style)
          =========================== */}
      <section className="spotlight-news-section" style={{ marginTop: "-18px", marginBottom: "24px" }}>
        {/* STICKY ADVERTISEMENT BAR (Admin Manageable) */}
        {stickyAdData?.enabled && !adDismissed && (
          <div
            className="sticky-ad-banner-bar"
            style={{
              position: "sticky",
              top: "70px",
              zIndex: 90,
              background: "#000000",
              borderRadius: "12px",
              padding: "10px 16px",
              marginBottom: "20px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(12px)",
              color: "#ffffff"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
              {stickyAdData.badge && (
                <span style={{
                  background: "#e50914",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: 900,
                  padding: "3px 10px",
                  borderRadius: "6px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(229, 9, 20, 0.4)",
                  flexShrink: 0
                }}>
                  {stickyAdData.badge}
                </span>
              )}
              {stickyAdData.image && (
                <img
                  src={stickyAdData.image}
                  alt="Advertisement Banner"
                  style={{
                    maxHeight: stickyAdData.text ? "44px" : "70px",
                    maxWidth: "100%",
                    objectFit: "contain",
                    borderRadius: "6px",
                    flexShrink: 0
                  }}
                />
              )}
              {stickyAdData.text && (
                <p style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: "#ffffff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {stickyAdData.text}
                </p>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              {stickyAdData.link && (
                <Link
                  href={stickyAdData.link}
                  target={stickyAdData.link.startsWith("http") ? "_blank" : "_self"}
                  style={{
                    background: "#ffffff",
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease"
                  }}
                >
                  {lang === "HI" ? "अभी देखें ▶" : "Explore Now ▶"}
                </Link>
              )}
              <button
                onClick={() => setAdDismissed(true)}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  border: "none",
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.2s ease"
                }}
                title="Dismiss advertisement"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Sticky Main Leaderboard Ad Banner (Admin Manageable) */}
        {leaderboardAdData?.enabled && !leaderboardAdDismissed && (
          <div
            className="sticky-leaderboard-ad-bar"
            style={{
              position: "sticky",
              top: stickyAdData?.enabled && !adDismissed ? "126px" : "70px",
              zIndex: 85,
              background: "linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "24px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              backdropFilter: "blur(12px)"
            }}
          >
            <button
              onClick={() => setLeaderboardAdDismissed(true)}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "rgba(0, 0, 0, 0.55)",
                color: "#ffffff",
                border: "none",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                transition: "background 0.2s ease"
              }}
              title="Dismiss banner"
            >
              <X size={13} />
            </button>

            {leaderboardAdData.image ? (
              <Link
                href={leaderboardAdData.link || "/advertise"}
                target={leaderboardAdData.link?.startsWith("http") ? "_blank" : "_self"}
                style={{ display: "block", textDecoration: "none", width: "100%" }}
              >
                <img
                  src={leaderboardAdData.image}
                  alt={leaderboardAdData.title || "Leaderboard Advertisement"}
                  style={{ width: "100%", height: "auto", maxHeight: `${leaderboardAdData.height || "110"}px`, objectFit: "cover", display: "block" }}
                />
              </Link>
            ) : (
              <div style={{
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#ffffff",
                flexWrap: "wrap",
                gap: "12px"
              }}>
                <div>
                  <span style={{ background: "#e50914", color: "#fff", fontSize: "0.65rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 800, textTransform: "uppercase" }}>
                    {leaderboardAdData.badge || "ADVERTISEMENT"}
                  </span>
                  <h3 style={{ margin: "6px 0 2px", fontSize: "1.1rem", fontWeight: 800 }}>
                    {leaderboardAdData.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8" }}>
                    {leaderboardAdData.subtitle}
                  </p>
                </div>
                {leaderboardAdData.link && (
                  <Link
                    href={leaderboardAdData.link}
                    target={leaderboardAdData.link.startsWith("http") ? "_blank" : "_self"}
                    style={{
                      background: "#ffffff",
                      color: "#0f172a",
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontWeight: 800,
                      fontSize: "0.82rem",
                      textDecoration: "none",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {leaderboardAdData.btnText || (lang === "HI" ? "विज्ञापन दें" : "Advertise With Us")}
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3-Column Spotlight News Feed Grid (Image 2 Style) */}
        <div className="spotlight-3col-grid" style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 0.9fr",
          gap: "20px"
        }}>
          {/* Column 1: Primary Big News Story / Video Lead (Geo-Targeted Local Lead / Admin Hero Story) */}
          <div style={{ background: "var(--color-card-bg, #ffffff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column" }}>
            {mainHero && (() => {
              const isExactCity = mainHero.district && (mainHero.district.toLowerCase().includes(userCityLower) || userCityLower.includes(mainHero.district.toLowerCase()));
              const isSameState = mainHero.state && mainHero.state.toLowerCase().trim() === userStateLower;
              
              let badgeLabel = "🔥 TRENDING TOP STORY";
              if (isExactCity) {
                badgeLabel = `📍 ${userCity.toUpperCase()} LOCAL LEAD STORY`;
              } else if (isSameState) {
                badgeLabel = `📍 NEAREST LOCAL STORY (${mainHero.district || mainHero.state})`;
              } else if (mainHero.district) {
                badgeLabel = `📍 ${mainHero.district.split("/")[0].trim().toUpperCase()} STORY`;
              }

              return (
                <Link href={`/article/${mainHero.slug || mainHero.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span style={{
                      background: isExactCity ? "#e50914" : isSameState ? "#2563eb" : "#0f172a",
                      color: "#ffffff",
                      fontSize: "0.68rem",
                      fontWeight: 900,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em"
                    }}>
                      {badgeLabel}
                    </span>
                    {mainHero.isHero && (
                      <span style={{ background: "#dc2626", color: "#fff", fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", fontWeight: 800 }}>
                        🌟 SPOTLIGHT
                      </span>
                    )}
                  </div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, lineHeight: 1.4, margin: "0 0 12px", color: "var(--color-text, #0f172a)" }}>
                  {mainHero.title}
                </h2>
                <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "16/9", background: "#0a0f1d" }}>
                  <img src={getArticleImage(mainHero, 0)} alt={mainHero.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {mainHero.videoUrl && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(229,9,20,0.9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                        <Play size={22} style={{ marginLeft: "3px" }} />
                      </div>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: "0.86rem", color: "var(--color-secondary, #64748b)", margin: "12px 0 0", lineHeight: 1.5 }}>
                  {stripHtml(mainHero.summary)}
                </p>
                <div style={{ marginTop: "10px" }}>
                  <span style={{ fontSize: "0.86rem", color: "#e50914", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    {lang === "HI" ? "और भी ▶" : "Read More ▶"}
                  </span>
                </div>
              </Link>
            );
          })()}
        </div>

          {/* Column 2: "सुपरफ़ास्ट NEWS" Real-Time Feed (Admin Superfast Articles) */}
          <div style={{ background: "var(--color-card-bg, #ffffff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", borderBottom: "2px solid #e50914", paddingBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={18} style={{ color: "#e50914", fill: "#e50914" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase", color: "#e50914" }}>
                  {lang === "HI" ? "सुपरफ़ास्ट NEWS" : "SUPERFAST NEWS"}
                </h3>
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--color-secondary)", fontWeight: 600 }}>
                {lang === "HI" ? "सबसे कम समय में सबसे ज़्यादा ख़बरें..." : "Fastest News Stream"}
              </span>
            </div>

            {superfastList.map((item, idx) => (
              <article key={item.id} style={{ borderBottom: idx < superfastList.length - 1 ? "1px solid var(--color-border, #f1f5f9)" : "none", padding: "10px 0" }}>
                <Link href={`/article/${item.slug || item.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ width: "70px", height: "55px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "#1e293b" }}>
                    <img src={getArticleImage(item, idx + 1)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: "0.86rem", fontWeight: 700, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: "var(--color-text, #0f172a)" }}>
                      {item.title}
                    </h4>
                    {idx === 0 && (
                      <span style={{ fontSize: "0.72rem", color: "#e50914", fontWeight: 700, marginTop: "4px", display: "inline-block" }}>
                        {lang === "HI" ? "और भी ▶" : "Read More ▶"}
                      </span>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Column 3: Live TV Stream Player & Social Follow Pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Live Broadcast Card Player */}
            <div style={{ background: "#0a0f1d", borderRadius: "14px", overflow: "hidden", border: "1px solid #1e293b", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", background: "#1e293b", borderBottom: "1px solid #334155" }}>
                <button style={{ flex: 1, padding: "8px", background: "#e50914", color: "#fff", border: "none", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer" }}>
                  {lang === "HI" ? "ग्लोबल आवाज़ LIVE" : "LIVE TV"}
                </button>
                <button style={{ flex: 1, padding: "8px", background: "transparent", color: "#94a3b8", border: "none", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                  NEWS LIVE
                </button>
              </div>

              {isPlayingLive && liveTvConfig.streamUrl ? (
                <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
                  <iframe
                    src={liveTvConfig.streamUrl.includes("embed/") ? liveTvConfig.streamUrl : `https://www.youtube.com/embed/${extractYouTubeId(liveTvConfig.streamUrl)}?autoplay=1`}
                    title={liveTvConfig.channelTitle}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div style={{ position: "relative", aspectRatio: "16/9", background: "linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px", textAlign: "center" }}>
                  <div style={{ position: "absolute", top: "10px", left: "10px", background: "#e50914", color: "#fff", fontSize: "0.65rem", fontWeight: 900, padding: "2px 8px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite" }} />
                    LIVE
                  </div>
                  <button
                    onClick={() => setIsPlayingLive(true)}
                    style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}
                  >
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(229, 9, 20, 0.9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", boxShadow: "0 4px 18px rgba(229,9,20,0.5)", marginBottom: "10px", transition: "transform 0.2s ease" }}>
                      <Play size={24} style={{ marginLeft: "3px" }} />
                    </div>
                    <span style={{ color: "#ffffff", fontWeight: 800, fontSize: "0.88rem", letterSpacing: "0.02em" }}>
                      {liveTvConfig.channelTitle}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "0.74rem", marginTop: "2px" }}>
                      {liveTvConfig.subtitle}
                    </span>
                  </button>
                </div>
              )}

              <div style={{ background: "#b91c1c", color: "#ffffff", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite" }} />
                  <span>{lang === "HI" ? "लाइव न्यूज़ अपडेट प्रसारित" : "LIVE NEWS STREAM ACTIVE"}</span>
                </div>
                <span style={{ fontSize: "0.68rem", opacity: 0.9 }}>HD 1080p</span>
              </div>
            </div>

            {/* Social Follow Buttons */}
            <div style={{ background: "var(--color-card-bg, #ffffff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <a href={liveTvConfig.googleNewsUrl || "https://news.google.com"} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "6px 14px", textDecoration: "none", color: "inherit" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>Follow us on Google News</span>
                <ExternalLink size={14} style={{ color: "#4285F4" }} />
              </a>
              <a href={liveTvConfig.whatsappUrl || "https://whatsapp.com"} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#25D366", color: "#ffffff", borderRadius: "20px", padding: "6px 14px", textDecoration: "none", fontWeight: 800 }}>
                <span style={{ fontSize: "0.8rem" }}>Join WhatsApp Channel</span>
                <Share2 size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===========================
          MOBILE HERO CARD
          =========================== */}


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
      {/* ===========================
          HYPER-LOCAL CITY & STATE NEWS SECTION
          =========================== */}
      <section className="mobile-state-section" style={{ background: "var(--color-card-bg, #ffffff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: "14px", padding: "14px", marginTop: "12px", marginBottom: "16px" }}>
        <div className="mobile-section-header" style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px", borderBottom: "2px solid #e50914", paddingBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
              <MapPin size={18} style={{ color: "#e50914", flexShrink: 0 }} />
              <h2 className="mobile-section-title" style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "var(--color-text, #0f172a)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {lang === "HI" ? "आपके शहर की ख़बरें" : "Local City News"}
              </h2>
            </div>
            <span style={{ background: "rgba(229, 9, 20, 0.08)", color: "#e50914", fontSize: "0.74rem", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", whiteSpace: "nowrap", flexShrink: 0 }}>
              {userCity} ({lang === "HI" ? userState.nameHi : userState.nameEn})
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%" }}>
            {/* City / District Selector */}
            <select
              value={userCity}
              onChange={(e) => {
                const newCity = e.target.value;
                setUserCity(newCity);
                try {
                  sessionStorage.setItem("ga_manual_city_selected", "true");
                  localStorage.setItem("ga_selected_city", newCity);
                  window.dispatchEvent(new Event("ga_state_changed"));
                } catch (err) {}
              }}
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: "8px",
                border: "1px solid var(--color-border, #cbd5e1)",
                background: "var(--color-bg, #ffffff)",
                color: "var(--color-text, #0f172a)",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                boxSizing: "border-box"
              }}
            >
              {getDistrictsForState(userState.code).map((d) => (
                <option key={d.id} value={d.nameEn}>
                  📍 {lang === "HI" ? d.nameHi : d.nameEn}
                </option>
              ))}
            </select>

            {/* State Selector */}
            <select
              value={userState.code}
              onChange={(e) => {
                const selectedSt = INDIAN_STATES.find((s) => s.code === e.target.value);
                if (selectedSt) {
                  setUserState(selectedSt);
                  const dists = getDistrictsForState(selectedSt.code);
                  const newCity = dists.length > 0 ? dists[0].nameEn : "Ranchi";
                  setUserCity(newCity);
                  try {
                    sessionStorage.setItem("ga_manual_city_selected", "true");
                    localStorage.setItem("ga_selected_state", selectedSt.code);
                    localStorage.setItem("ga_selected_city", newCity);
                    window.dispatchEvent(new Event("ga_state_changed"));
                  } catch (err) {}
                }
              }}
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: "8px",
                border: "1px solid var(--color-border, #cbd5e1)",
                background: "var(--color-bg, #ffffff)",
                color: "var(--color-text, #0f172a)",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                boxSizing: "border-box"
              }}
            >
              {INDIAN_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {lang === "HI" ? st.nameHi : st.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {stateArticles.map((item, idx) => (
            <article key={item.id} style={{ background: "var(--color-bg, #f8fafc)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <Link href={`/article/${item.slug && item.slug.length > 1 ? item.slug : item.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ position: "relative", height: "150px", overflow: "hidden", background: "#0a0f1d" }}>
                  <img src={getArticleImage(item, idx + 4)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{ position: "absolute", top: "8px", left: "8px", background: "#e50914", color: "#fff", fontSize: "0.68rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 800 }}>
                    📍 {item.district || userCity}
                  </span>
                </div>
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "0.92rem", fontWeight: 800, lineHeight: 1.35, color: "var(--color-text, #0f172a)" }}>
                    {item.title}
                  </h3>
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.74rem", color: "var(--color-secondary, #64748b)" }}>
                    <span><Clock size={11} style={{ display: "inline", marginRight: "3px" }} /> {timeStr}</span>
                    <span style={{ color: "#e50914", fontWeight: 700 }}>{lang === "HI" ? "पढ़ें ▶" : "Read ▶"}</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ===========================
          🔥 TRENDING / HOT TOPICS SECTION
          =========================== */}
      <section style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "1px solid #fed7aa", borderRadius: "16px", padding: "18px", marginTop: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", borderBottom: "2px solid #ea580c", paddingBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.3rem" }}>🔥</span>
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, textTransform: "uppercase", color: "#c2410c" }}>
              {lang === "HI" ? "ट्रेंडिंग और वायरल समाचार (Trending & Hot Topics)" : "Trending & Hot Topics"}
            </h2>
          </div>
          <span style={{ fontSize: "0.76rem", color: "#c2410c", fontWeight: 700 }}>
            {lang === "HI" ? "देश भर में वायरल सुर्खियाँ" : "Top Viral Highlights"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
          {trendingList.map((item, idx) => (
            <article key={item.id} style={{ background: "#ffffff", border: "1px solid #ffedd5", borderRadius: "10px", padding: "12px", boxShadow: "0 2px 10px rgba(234,88,12,0.06)" }}>
              <Link href={`/article/${item.slug && item.slug.length > 1 ? item.slug : item.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={{ width: "65px", height: "55px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "#0a0f1d" }}>
                  <img src={getArticleImage(item, idx + 2)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ background: "#ea580c", color: "#ffffff", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", fontWeight: 800, marginBottom: "4px", display: "inline-block" }}>
                    🔥 TRENDING #{idx + 1}
                  </span>
                  <h4 style={{ margin: 0, fontSize: "0.84rem", fontWeight: 800, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: "#0f172a" }}>
                    {item.title}
                  </h4>
                </div>
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
