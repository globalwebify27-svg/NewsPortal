"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Bookmark, Mail, Zap, Play, ChevronLeft, ChevronRight, X, ExternalLink, Clock, Calendar, ChevronRight as ArrowRight, Share2, Loader2, MapPin, Sliders, RotateCcw, ShieldCheck, Globe, Lock, Send, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { fetchCentralVideos, extractYouTubeId, YouTubeVideoItem } from "@/lib/youtube";
import SocialShareButtons from "@/components/SocialShareButtons";
import { INDIAN_STATES, IndianState, autoDetectUserIndianState } from "@/lib/states";
import { INDIAN_DISTRICTS, getDistrictsForState, autoDetectUserCity } from "@/lib/districts";

import { defaultEnglishArticles, defaultHindiArticles, allDefaultArticles, stripHtml, getArticleImage, formatArticleSlug, getArticleUrl } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { fetchWithCache, clearCacheKey } from "@/lib/settingsCache";
import { cleanVideoUrl } from "@/lib/mediaUpload";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  featuredImage: string;
  category?: { name: string; slug: string; color: string; subCategory?: string };
  subCategory?: string;
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
  createdAt?: string;
}

export default function Home() {
  const { lang, t } = useLanguage();
  const isHi = lang === "HI";
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

  const loadStickyAdSettings = useCallback(async (forceBypass = false) => {
    try {
      if (forceBypass) clearCacheKey("/api/v1/ad-settings");
      const json = await fetchWithCache<{ success?: boolean; data?: any }>("/api/v1/ad-settings", 30000);
      if (json && json.success && json.data) {
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

  const [videoAdsList, setVideoAdsList] = useState<Array<{ id: string; url: string; title: string; targetLink: string }>>([
    {
      id: "1",
      url: "",
      title: "ग्लोबल आवाज़ विशेष डिजिटल मीडिया विज्ञापन",
      targetLink: "/advertise"
    }
  ]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [trendingSlideIndex, setTrendingSlideIndex] = useState(0);
  const [videoAdEnabled, setVideoAdEnabled] = useState(true);
  const [spotlightCol1Ad, setSpotlightCol1Ad] = useState<{ url: string; targetLink: string; title: string } | null>(null);
  const [spotlightCol2Ad, setSpotlightCol2Ad] = useState<{ url: string; targetLink: string; title: string } | null>(null);

  const loadVideoAdSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/logo-settings", { cache: "no-store" });
      const json = await res.json();
      if (json && json.success && json.data) {
        setVideoAdEnabled(json.data.sidebar_video_ad_enabled !== "false");
        if (json.data.spotlight_col1_ad_url) {
          setSpotlightCol1Ad({
            url: json.data.spotlight_col1_ad_url,
            targetLink: json.data.spotlight_col1_ad_link || "/advertise",
            title: json.data.spotlight_col1_ad_title || "ग्लोबल आवाज़ विज्ञापन"
          });
        }
        if (json.data.spotlight_col2_ad_url) {
          setSpotlightCol2Ad({
            url: json.data.spotlight_col2_ad_url,
            targetLink: json.data.spotlight_col2_ad_link || "/advertise",
            title: json.data.spotlight_col2_ad_title || "ग्लोबल आवाज़ डिजिटल पार्टनर"
          });
        }
        if (json.data.sidebar_video_ads_list) {
          try {
            const parsed = JSON.parse(json.data.sidebar_video_ads_list);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setVideoAdsList(parsed);
              return;
            }
          } catch (e) {}
        }
        if (json.data.sidebar_video_ad_url) {
          setVideoAdsList([{
            id: "1",
            url: json.data.sidebar_video_ad_url,
            title: json.data.sidebar_video_ad_title || "ग्लोबल आवाज़ विशेष डिजिटल मीडिया विज्ञापन",
            targetLink: json.data.sidebar_video_ad_target_link || "/advertise"
          }]);
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadStickyAdSettings();
    loadVideoAdSettings();
    const handleUpdate = () => {
      loadStickyAdSettings(true);
      loadVideoAdSettings();
    };
    window.addEventListener("ga_sticky_ad_updated", handleUpdate);
    window.addEventListener("ga_video_ad_updated", handleUpdate);
    return () => {
      window.removeEventListener("ga_sticky_ad_updated", handleUpdate);
      window.removeEventListener("ga_video_ad_updated", handleUpdate);
    };
  }, [loadStickyAdSettings, loadVideoAdSettings]);

  // Auto-scroll Carousel timer for YouTube / static slides
  useEffect(() => {
    if (!videoAdEnabled || videoAdsList.length <= 1) return;
    const activeAd = videoAdsList[currentAdIndex];
    const isYouTube = activeAd?.url && (activeAd.url.includes("youtube.com") || activeAd.url.includes("youtu.be") || activeAd.url.includes("embed/"));
    if (isYouTube || !activeAd?.url) {
      const timer = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % videoAdsList.length);
      }, 9000);
      return () => clearInterval(timer);
    }
  }, [videoAdEnabled, videoAdsList, currentAdIndex]);

  useEffect(() => {
    const updateVideos = () => {
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
  }, []);

  useEffect(() => {
    const loadUserState = async () => {
      const detected = await autoDetectUserIndianState();
      if (detected) {
        setUserState(detected);
        sessionStorage.setItem("ga_selected_state", detected.code);
      }
    };

    loadUserState();
    window.addEventListener("ga_state_changed", loadUserState);
    return () => window.removeEventListener("ga_state_changed", loadUserState);
  }, []);

  const handleSelectState = (stCode: string) => {
    const match = INDIAN_STATES.find((s) => s.code === stCode || s.slug === stCode || s.nameEn.toLowerCase() === stCode.toLowerCase());
    if (match) {
      setUserState(match);
      sessionStorage.setItem("ga_selected_state", match.code);
      sessionStorage.setItem("ga_manual_state_selected", "true");
      const dists = getDistrictsForState(match.code);
      if (dists && dists.length > 0) {
        const defaultCity = dists[0].nameEn.split("/")[0].trim();
        setUserCity(defaultCity);
        sessionStorage.setItem("ga_selected_city", defaultCity);
        sessionStorage.setItem("ga_manual_city_selected", "true");
      }
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
        const res = await fetch(API_ENDPOINTS.articles, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
            apiList = json.data;
          } else if (json?.articles && Array.isArray(json.articles) && json.articles.length > 0) {
            apiList = json.articles;
          }
        }
      } catch (err) {
        console.warn("Error fetching articles from MySQL DB:", err);
      }

      if (!apiList || apiList.length === 0) {
        apiList = [];
      }

      setArticles(apiList);
      setLoading(false);
    }

    fetchArticles();
  }, []);

  useEffect(() => {
    const syncLocation = async () => {
      try {
        const detected = await autoDetectUserCity();
        if (detected) {
          setUserCity(detected.city);
          const stObj = INDIAN_STATES.find((s) => s.code === detected.stateCode);
          if (stObj) {
            setUserState(stObj);
            sessionStorage.setItem("ga_selected_state", stObj.code);
          }
        }
      } catch (e) {}
    };

    syncLocation();
    window.addEventListener("ga_state_changed", syncLocation);

    return () => {
      window.removeEventListener("ga_state_changed", syncLocation);
    };
  }, []);

  const [activeFilters, setActiveFilters] = useState<{
    sort?: string;
    category?: string;
    format?: string;
    timeRange?: string;
    state?: string;
  } | null>(null);

  useEffect(() => {
    const loadFilters = () => {
      try {
        const saved = sessionStorage.getItem("ga_active_filters");
        if (saved) {
          setActiveFilters(JSON.parse(saved));
        } else {
          setActiveFilters(null);
        }
      } catch (e) {
        setActiveFilters(null);
      }
    };
    loadFilters();
    window.addEventListener("ga_filters_changed", loadFilters);
    window.addEventListener("storage", loadFilters);
    return () => {
      window.removeEventListener("ga_filters_changed", loadFilters);
      window.removeEventListener("storage", loadFilters);
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

  // Show articles that match the current language OR have no language set (admin default)
  const langFiltered = articles.filter((a) => {
    if (!a.language) return true; // No language set → always show
    if (lang === "HI") return a.language === "HI" || a.language === "EN";
    return a.language === "EN" || a.language === "HI";
  });
  const baseArticles = langFiltered.length > 0 ? langFiltered : articles;

  // Apply active filters (if user applied filters via Filter Modal)
  let filteredList = baseArticles.filter((a) => {
    if (!activeFilters) return true;

    // Filter by Category
    if (activeFilters.category && activeFilters.category !== "all") {
      const catSlug = (a.category?.slug || a.category?.name || "").toLowerCase().trim();
      const subCat = (a.subCategory || a.category?.subCategory || "").toLowerCase().trim();
      const targetCat = activeFilters.category.toLowerCase().trim();
      if (!catSlug.includes(targetCat) && !subCat.includes(targetCat) && !targetCat.includes(catSlug)) {
        return false;
      }
    }

    // Filter by Format
    if (activeFilters.format && activeFilters.format !== "all") {
      if (activeFilters.format === "videos" && !a.videoUrl && a.category?.slug !== "videos") return false;
      if (activeFilters.format === "epaper" && a.category?.slug !== "epaper") return false;
      if (activeFilters.format === "articles" && (a.videoUrl || a.category?.slug === "videos")) return false;
    }

    // Filter by Time Range
    if (activeFilters.timeRange && activeFilters.timeRange !== "all") {
      const createdAt = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
      const now = Date.now();
      if (activeFilters.timeRange === "24h" && now - createdAt > 24 * 3600 * 1000) return false;
      if (activeFilters.timeRange === "7d" && now - createdAt > 7 * 24 * 3600 * 1000) return false;
      if (activeFilters.timeRange === "30d" && now - createdAt > 30 * 24 * 3600 * 1000) return false;
    }

    // Filter by State (from Filter Modal)
    if (activeFilters.state && activeFilters.state !== "all") {
      if (!a.state) return false;
      const stLower = a.state.toLowerCase().trim();
      const targetState = activeFilters.state.toLowerCase().trim().replace(/-/g, " ");
      const matchedSt = INDIAN_STATES.find(
        (s) => s.slug === activeFilters.state || s.code.toLowerCase() === activeFilters.state.toLowerCase()
      );
      const matchName = matchedSt ? matchedSt.nameEn.toLowerCase() : targetState;
      const matchCode = matchedSt ? matchedSt.code.toLowerCase() : targetState;
      if (!stLower.includes(matchName) && !stLower.includes(matchCode) && !stLower.includes(targetState)) {
        return false;
      }
    }

    return true;
  });

  // Apply Sorting
  if (activeFilters?.sort === "popular") {
    filteredList = [...filteredList].sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
  } else if (activeFilters?.sort === "editors") {
    filteredList = [...filteredList].sort((a, b) => (b.isHero ? 1 : 0) - (a.isHero ? 1 : 0));
  }

  const activeArticles = filteredList.length > 0 ? filteredList : baseArticles;

  // Geo-Location & Selected State Prioritization
  const userCityLower = userCity.toLowerCase().trim();
  const userStateLower = userState.nameEn.toLowerCase().trim();
  const userStateCodeLower = userState.code.toLowerCase().trim();
  const userStateSlugLower = userState.slug.toLowerCase().trim();

  // Articles matching current Geo-Location or Selected State
  const geoMatchedList = activeArticles.filter((a) => {
    if (a.district && (a.district.toLowerCase().includes(userCityLower) || userCityLower.includes(a.district.toLowerCase()))) return true;
    if (!a.state) return false;
    const stLower = a.state.toLowerCase().trim();
    return stLower === userStateLower || stLower === userStateCodeLower || stLower === userStateSlugLower || userStateLower.includes(stLower);
  });

  const nonGeoMatchedList = activeArticles.filter((a) => !geoMatchedList.includes(a));

  // Prioritize Geo-Location / Selected State articles at the top of the feed
  const displayList = geoMatchedList.length > 0 ? [...geoMatchedList, ...nonGeoMatchedList] : activeArticles;

  // Hero Selection: Geo/Selected State Hero -> Admin Hero -> First Available Article
  const cityHero = geoMatchedList.find((a) => a.district && (a.district.toLowerCase().includes(userCityLower) || userCityLower.includes(a.district.toLowerCase())));
  const stateHero = geoMatchedList.find((a) => a.state);
  const explicitHero = activeArticles.find((a) => a.isHero && a.status !== "DRAFT") || activeArticles.find((a) => a.isHero);

  const mainHero = cityHero || stateHero || explicitHero || displayList[0];
  const trendingSliderArticles = displayList.length > 0 ? displayList.slice(0, 10) : [mainHero].filter(Boolean);

  const secondaryHero = displayList.filter((a) => a.id !== mainHero?.id).slice(0, 4);
  const topStories = displayList.filter((a) => a.id !== mainHero?.id).slice(0, 6);

  const superfastArticles = displayList.filter((a) => a.isSuperfast);
  const superfastList = superfastArticles.length > 0
    ? superfastArticles.slice(0, 5)
    : displayList.slice(0, 5);
  
  const locationNews = geoMatchedList.length > 0 ? geoMatchedList : displayList.filter((a) => a.id !== mainHero?.id);
  const stateArticles = locationNews.slice(0, 6);

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
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
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

        {/* Active Filter Notification Bar */}
        {activeFilters && (activeFilters.category !== "all" || activeFilters.state !== "all" || activeFilters.sort !== "latest" || activeFilters.format !== "all" || activeFilters.timeRange !== "all") && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "10px",
            padding: "8px 14px",
            marginBottom: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "0.85rem", fontWeight: 700, color: "#991b1b" }}>
              <Sliders size={15} style={{ color: "#e50914" }} />
              <span>{lang === "HI" ? "सक्रिय फ़िल्टर (Active Filter):" : "Active Filter Applied:"}</span>
              {activeFilters.category && activeFilters.category !== "all" && (
                <span style={{ background: "#e50914", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800 }}>
                  📂 {activeFilters.category.toUpperCase()}
                </span>
              )}
              {activeFilters.state && activeFilters.state !== "all" && (
                <span style={{ background: "#2563eb", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800 }}>
                  📍 {activeFilters.state.toUpperCase()}
                </span>
              )}
              {activeFilters.sort && activeFilters.sort !== "latest" && (
                <span style={{ background: "#0f172a", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800 }}>
                  ⭐ {activeFilters.sort.toUpperCase()}
                </span>
              )}
              {activeFilters.format && activeFilters.format !== "all" && (
                <span style={{ background: "#16a34a", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800 }}>
                  📰 {activeFilters.format.toUpperCase()}
                </span>
              )}
              {activeFilters.timeRange && activeFilters.timeRange !== "all" && (
                <span style={{ background: "#d97706", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800 }}>
                  ⏱️ {activeFilters.timeRange.toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                try {
                  sessionStorage.removeItem("ga_active_filters");
                  window.dispatchEvent(new Event("ga_filters_changed"));
                } catch (e) {}
              }}
              style={{ background: "transparent", border: "none", color: "#e50914", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <RotateCcw size={13} />
              {lang === "HI" ? "फ़िल्टर हटाएं" : "Clear Filter"}
            </button>
          </div>
        )}

        {/* 3-Column Spotlight News Feed Grid (Matched Equal Heights) */}
        <div className="spotlight-3col-grid" style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 0.9fr",
          gap: "20px",
          alignItems: "stretch"
        }}>
          {/* Column 1: TRENDING NEWS (Manual Arrow Slider - Matched Height) */}
          <div style={{ background: "var(--color-card-bg, #ffffff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", height: "100%", position: "relative", boxSizing: "border-box", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", borderBottom: "2px solid #e50914", paddingBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <TrendingUp size={18} style={{ color: "#e50914" }} />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase", color: "#e50914" }}>
                    {lang === "HI" ? "ट्रेंडिंग न्यूज" : "TRENDING NEWS"}
                  </h3>
                </div>
                
                {/* Manual Slider Left/Right Navigation Arrows */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 800, marginRight: "4px" }}>
                    {trendingSlideIndex + 1} / {trendingSliderArticles.length || 1}
                  </span>
                  <button
                    onClick={() => setTrendingSlideIndex((prev) => (prev - 1 + (trendingSliderArticles.length || 1)) % (trendingSliderArticles.length || 1))}
                    style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f1f5f9", border: "1px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0f172a", fontWeight: 900 }}
                    title="Previous Trending News"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setTrendingSlideIndex((prev) => (prev + 1) % (trendingSliderArticles.length || 1))}
                    style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#e50914", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ffffff", fontWeight: 900 }}
                    title="Next Trending News"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Active Trending Article Card (Manual Slider Slide) */}
              {(() => {
                const activeSlide = trendingSliderArticles[trendingSlideIndex] || mainHero;
                if (!activeSlide) return null;

                const isExactCity = activeSlide.district && (activeSlide.district.toLowerCase().includes(userCityLower) || userCityLower.includes(activeSlide.district.toLowerCase()));
                const isSameState = activeSlide.state && activeSlide.state.toLowerCase().trim() === userStateLower;
                
                let badgeLabel = `🔥 TRENDING NEWS #${trendingSlideIndex + 1}`;
                if (isExactCity) {
                  badgeLabel = `📍 ${userCity.toUpperCase()} LOCAL LEAD`;
                } else if (isSameState) {
                  badgeLabel = `📍 LOCAL STORY (${activeSlide.district || activeSlide.state})`;
                }

                return (
                  <Link href={getArticleUrl(activeSlide)} title={activeSlide.title} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
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
                      {activeSlide.isHero && (
                        <span style={{ background: "#dc2626", color: "#fff", fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", fontWeight: 800 }}>
                          🌟 SPOTLIGHT
                        </span>
                      )}
                    </div>
                    <h2 title={activeSlide.title} style={{ fontSize: "1.15rem", fontWeight: 800, lineHeight: 1.4, margin: "0 0 10px", color: "var(--color-text, #0f172a)" }}>
                      {activeSlide.title}
                    </h2>
                    <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "16/9", background: "#0a0f1d" }}>
                      <img
                        src={getArticleImage(activeSlide, trendingSlideIndex)}
                        alt={activeSlide.title}
                        title={activeSlide.title}
                        loading="lazy"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {activeSlide.videoUrl && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)" }}>
                          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(229,9,20,0.9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                            <Play size={20} style={{ marginLeft: "3px" }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <p style={{
                      fontSize: "0.82rem",
                      color: "var(--color-secondary, #64748b)",
                      margin: "8px 0 0",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {stripHtml(activeSlide.summary)}
                    </p>
                    <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.82rem", color: "#e50914", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {lang === "HI" ? "पूरी खबर पढ़ें ▶" : "Read Full Story ▶"}
                      </span>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {trendingSliderArticles.slice(0, 10).map((_, dotIdx) => (
                          <span
                            key={dotIdx}
                            onClick={(e) => {
                              e.preventDefault();
                              setTrendingSlideIndex(dotIdx);
                            }}
                            style={{
                              width: dotIdx === trendingSlideIndex ? "16px" : "6px",
                              height: "6px",
                              borderRadius: "4px",
                              background: dotIdx === trendingSlideIndex ? "#e50914" : "#cbd5e1",
                              cursor: "pointer",
                              transition: "all 0.2s ease"
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })()}
            </div>
          </div>

          {/* Column 2: "TOP 5 NEWS" (5 Latest News Only - Matched Equal Height) */}
          <div style={{ background: "var(--color-card-bg, #ffffff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", borderBottom: "2px solid #e50914", paddingBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Zap size={18} style={{ color: "#e50914", fill: "#e50914" }} />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase", color: "#e50914" }}>
                    {lang === "HI" ? "टॉप 5 न्यूज" : "TOP 5 NEWS"}
                  </h3>
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--color-secondary)", fontWeight: 600 }}>
                  {lang === "HI" ? "5 सबसे ताज़ा समाचार" : "5 Latest News"}
                </span>
              </div>

              {superfastList.slice(0, 5).map((item, idx) => (
                <article key={item.id} style={{ borderBottom: idx < Math.min(superfastList.length, 5) - 1 ? "1px solid var(--color-border, #f1f5f9)" : "none", padding: "12px 0" }}>
                  <Link href={getArticleUrl(item)} title={item.title} style={{ textDecoration: "none", color: "inherit", display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: idx < 3 ? "#e50914" : "#0f172a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 900, flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div style={{ width: "75px", height: "54px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#1e293b" }}>
                      <img src={getArticleImage(item, idx + 1)} alt={item.title} title={item.title} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 title={item.title} style={{ margin: 0, fontSize: "0.86rem", fontWeight: 700, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: "var(--color-text, #0f172a)", wordBreak: "break-word" }}>
                        {item.title}
                      </h4>
                      {idx === 0 && (
                        <span style={{ fontSize: "0.72rem", color: "#e50914", fontWeight: 700, marginTop: "2px", display: "inline-block" }}>
                          {lang === "HI" ? "और भी ▶" : "Read More ▶"}
                        </span>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* Column 3: Admin Video Advertisement Player (Matched Equal Height) */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>

            {/* Admin Video Advertisement Carousel Card */}
            {videoAdEnabled && videoAdsList.length > 0 && (() => {
              const activeAd = videoAdsList[currentAdIndex] || videoAdsList[0];
              const isMultiple = videoAdsList.length > 1;

              const cleanAdUrl = cleanVideoUrl(activeAd?.url);

              let cleanTargetLink = activeAd?.targetLink ? activeAd.targetLink.trim() : "";
              if (cleanTargetLink) {
                cleanTargetLink = cleanTargetLink
                  .replace("https://yellowgreen-rook-384455.hostingersite.com", "")
                  .replace("http://yellowgreen-rook-384455.hostingersite.com", "")
                  .replace("//yellowgreen-rook-384455.hostingersite.com", "");

                if (!cleanTargetLink.startsWith("http://") && !cleanTargetLink.startsWith("https://") && !cleanTargetLink.startsWith("/")) {
                  cleanTargetLink = "https://" + cleanTargetLink;
                }
              }

              return (
                <div style={{ background: "#0a0f1d", borderRadius: "14px", overflow: "hidden", border: "1px solid #1e293b", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
                  {/* Video Player Box with Autoplay & Auto-Next on End */}
                  <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "100%", flex: 1, background: "#000", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {cleanAdUrl ? (
                      cleanAdUrl.includes("embed/") || cleanAdUrl.includes("youtube.com") || cleanAdUrl.includes("youtu.be") ? (
                        <iframe
                          key={`yt_${currentAdIndex}_${cleanAdUrl}`}
                          src={cleanAdUrl.includes("embed/") ? cleanAdUrl : `https://www.youtube.com/embed/${extractYouTubeId(cleanAdUrl)}?autoplay=1&mute=1&controls=1&rel=0`}
                          title={activeAd.title}
                          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          key={`mp4_${currentAdIndex}_${cleanAdUrl}`}
                          src={cleanAdUrl}
                          autoPlay
                          muted
                          loop={!isMultiple}
                          playsInline
                          controls
                          onEnded={() => {
                            if (isMultiple) {
                              setCurrentAdIndex((prev) => (prev + 1) % videoAdsList.length);
                            }
                          }}
                          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                        />
                      )
                    ) : (
                      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px", textAlign: "center", background: "linear-gradient(135deg, #1e1b4b 0%, #090d16 100%)" }}>
                        <span style={{ color: "#ffffff", fontWeight: 800, fontSize: "0.85rem", marginBottom: "6px" }}>
                          {activeAd?.title || "ग्लोबल आवाज़ डिजिटल मीडिया विज्ञापन"}
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                          {lang === "HI" ? "अपना ब्रांड या बिज़नेस यहाँ प्रमोट करें" : "Promote your brand or business here"}
                        </span>
                      </div>
                    )}

                    {/* Floating Target Action Link overlay over video */}
                    {cleanTargetLink && (
                      <a
                        href={cleanTargetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          position: "absolute",
                          bottom: "12px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 4,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                          background: "#e50914",
                          color: "#ffffff",
                          borderRadius: "6px",
                          padding: "6px 16px",
                          textDecoration: "none",
                          fontSize: "0.76rem",
                          fontWeight: 800,
                          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                          whiteSpace: "nowrap"
                        }}
                      >
                        <span>{lang === "HI" ? "अभी जानें / संपर्क करें" : "Learn More / Visit Site"}</span>
                        <ExternalLink size={12} />
                      </a>
                    )}

                    {/* Left & Right Slide Controls */}
                    {isMultiple && (
                      <>
                        <button
                          onClick={() => setCurrentAdIndex((prev) => (prev - 1 + videoAdsList.length) % videoAdsList.length)}
                          style={{
                            position: "absolute",
                            left: "6px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            zIndex: 3
                          }}
                          title="Previous Video Ad"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => setCurrentAdIndex((prev) => (prev + 1) % videoAdsList.length)}
                          style={{
                            position: "absolute",
                            right: "6px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            zIndex: 3
                          }}
                          title="Next Video Ad"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* New Row: Full-Width Image / Video Advertisement Banner Space (Only displayed if configured from Admin) */}
      {spotlightCol1Ad?.url && (
        <div className="main-layout-container" style={{ marginTop: "24px", marginBottom: "16px" }}>
          <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid #fed7aa", background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", padding: "12px 16px", boxShadow: "0 4px 16px rgba(234,88,12,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ background: "#ea580c", color: "#ffffff", fontSize: "0.62rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 900, textTransform: "uppercase" }}>
                  📢 ADVERTISEMENT BANNER
                </span>
                <span style={{ fontSize: "0.75rem", color: "#c2410c", fontWeight: 700 }}>ग्लोबल आवाज़ डिजिटल मीडिया विज्ञापन स्लॉट</span>
              </div>
              <a href="/advertise" style={{ fontSize: "0.72rem", color: "#ea580c", fontWeight: 800, textDecoration: "none" }}>
                {lang === "HI" ? "विज्ञापन दें ▶" : "Advertise With Us ▶"}
              </a>
            </div>

            <a href={spotlightCol1Ad.targetLink || "/advertise"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              {spotlightCol1Ad.url.endsWith(".mp4") || spotlightCol1Ad.url.includes("video") ? (
                <video src={spotlightCol1Ad.url} autoPlay muted loop playsInline style={{ width: "100%", maxHeight: "280px", objectFit: "cover", borderRadius: "10px" }} />
              ) : (
                <img src={spotlightCol1Ad.url} alt={spotlightCol1Ad.title} style={{ width: "100%", maxHeight: "280px", objectFit: "cover", borderRadius: "10px" }} />
              )}
            </a>
          </div>
        </div>
      )}

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
              <Link href={getArticleUrl(item)} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
                <div className="mobile-story-img-wrap">
                  {getArticleImage(item, idx + 2) ? (
                    <img src={getArticleImage(item, idx + 2)} alt={item.title} className="mobile-story-img" loading="lazy" decoding="async" />
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
                  sessionStorage.setItem("ga_selected_city", newCity);
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
                    sessionStorage.setItem("ga_selected_state", selectedSt.code);
                    sessionStorage.setItem("ga_selected_city", newCity);
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
              <Link href={getArticleUrl(item)} title={item.title} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ position: "relative", height: "150px", overflow: "hidden", background: "#0a0f1d" }}>
                  <img src={getArticleImage(item, idx + 4)} alt={item.title} title={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{ position: "absolute", top: "8px", left: "8px", background: "#e50914", color: "#fff", fontSize: "0.68rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 800 }}>
                    📍 {item.district || userCity}
                  </span>
                </div>
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 title={item.title} style={{ margin: "0 0 8px 0", fontSize: "0.92rem", fontWeight: 800, lineHeight: 1.35, color: "var(--color-text, #0f172a)" }}>
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
              <Link href={getArticleUrl(item)} title={item.title} style={{ textDecoration: "none", color: "inherit", display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={{ width: "65px", height: "55px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "#0a0f1d" }}>
                  <img src={getArticleImage(item, idx + 2)} alt={item.title} title={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ background: "#ea580c", color: "#ffffff", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", fontWeight: 800, marginBottom: "4px", display: "inline-block" }}>
                    🔥 TRENDING #{idx + 1}
                  </span>
                  <h4 title={item.title} style={{ margin: 0, fontSize: "0.84rem", fontWeight: 800, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: "#0f172a" }}>
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
        >
          <div
            ref={containerRef}
            className="top-stories-horizontal-grid"
          >
            {todaysTopStories.map((item, index) => (
              <article key={`${item.id}-${index}`} className="top-story-item">
                <Link href={getArticleUrl(item)} title={item.title} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div className="story-image-box">
                    {getArticleImage(item, index + 3) ? (
                      <img src={getArticleImage(item, index + 3)} alt={item.title} title={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }} />
                    )}
                    <span className="badge badge-accent" style={{ background: item.category?.color || "#e50914" }}>
                      {item.category?.name || (lang === "HI" ? "समाचार" : "NEWS")}
                    </span>
                    <span className="story-time-chip">{item.readTime || (lang === "HI" ? "4 मिनट पढ़ें" : "4 min read")}</span>
                  </div>
                  <div className="story-info-box">
                    <h3 className="story-heading" title={item.title}>{item.title}</h3>
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
                      <SocialShareButtons title={item.title} slug={item.slug} categorySlug={item.category?.slug || "top-news"} image={item.featuredImage} summary={item.summary} size="sm" />
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
                <SocialShareButtons title={video.title} slug={`videos?v=${video.youtubeId}`} categorySlug="videos" image={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`} size="sm" />
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <div className="relative bg-gradient-to-r from-zinc-950 via-zinc-900 to-[#1d080a] text-white rounded-[24px] p-5 sm:p-7 shadow-2xl border border-red-900/30 overflow-hidden">
          {/* Background Decorative Glow */}
          <div className="absolute top-0 right-0 w-80 h-full bg-red-600/10 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-red-600/10 blur-2xl pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 lg:gap-10">
            {/* Left Graphic Badge */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 border-4 border-red-950/60 shadow-xl flex items-center justify-center text-white relative">
                <Mail className="w-8 h-8 sm:w-9 sm:h-9 text-white fill-white/20" />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white shadow-md">
                  <Send className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Right Content & Form */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-1 tracking-tight">
                {isHi ? (
                  <>
                    GLOBAL मॉर्निंग ब्रीफिंग के साथ <span className="text-red-500">आगे रहें</span>
                  </>
                ) : (
                  <>
                    Stay Ahead with <span className="text-red-500">Global Morning Briefing</span>
                  </>
                )}
              </h2>

              <p className="text-slate-400 text-xs sm:text-sm mb-4 max-w-2xl leading-relaxed font-normal">
                {t("newsletterDesc")}
              </p>

              {/* Integrated Pill Form Input Bar */}
              <div className="bg-white rounded-2xl p-1.5 flex items-center shadow-lg border border-slate-200/50 max-w-lg mx-auto md:mx-0">
                <Mail className="w-4 h-4 text-slate-400 ml-3 mr-2 shrink-0" />
                <input
                  type="email"
                  placeholder={isHi ? "अपना ईमेल पता दर्ज करें..." : "Enter your email address..."}
                  className="bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none flex-1 min-w-0 pr-2"
                />
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 shrink-0">
                  <span>{isHi ? "निःशुल्क सदस्यता लें" : "Subscribe Free"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Badges Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] text-slate-400 mt-3.5 font-medium">
                <span className="flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                  {isHi ? "विश्वसनीय समाचार" : "Trusted Journalism"}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  {isHi ? "हर सुबह अपडेट" : "Daily Morning Updates"}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-red-500" />
                  {isHi ? "स्थानीय से वैश्विक कवरेज" : "Global & Local Coverage"}
                </span>
              </div>

              {/* Privacy Note */}
              <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-center md:justify-start gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>{isHi ? "आपकी जानकारी सुरक्षित है। हम स्पैम नहीं भेजते।" : "Your information is 100% secure. We never spam."}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
