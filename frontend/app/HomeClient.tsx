"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Mail, Zap, Play, ChevronLeft, ChevronRight, X, ExternalLink, Clock, Calendar, ChevronRight as ArrowRight, Share2, Loader2, MapPin, Sliders, RotateCcw, ShieldCheck, Globe, Lock, Send, TrendingUp, Building2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { fetchCentralVideos, extractYouTubeId, YouTubeVideoItem } from "@/lib/youtube";
import SocialShareButtons from "@/components/SocialShareButtons";
import { INDIAN_STATES, IndianState } from "@/lib/states";
import { getDistrictsForState } from "@/lib/districts";

import { stripHtml, getArticleImage, formatArticleSlug, getArticleUrl } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { fetchWithCache, clearCacheKey } from "@/lib/settingsCache";
import { cleanVideoUrl } from "@/lib/mediaUpload";

import { Article } from "@/types/article";

function getLocalizedCityName(districtRaw?: string, lang = "HI", activeCityObj?: any): string {
  if (lang !== "HI") {
    return districtRaw || activeCityObj?.nameEn || "Ranchi";
  }
  const clean = (districtRaw || "").toLowerCase().trim();
  const HINDI_DISTRICT_MAP: Record<string, string> = {
    ranchi: "रांची",
    dhanbad: "धनबाद",
    jamshedpur: "जमशेदपुर",
    bokaro: "बोकारो",
    hazaribagh: "हज़ारीबाग",
    deoghar: "देवघर",
    giridih: "गिरिडीह",
    palamu: "पलामू",
    patna: "पटना",
    bihar: "बिहार",
    jharkhand: "झारखंड",
    chatra: "चतरा",
    dumka: "दुमका",
    garhwa: "गढ़वा",
    godda: "गोड्डा",
    gumla: "गुमला",
    jamtara: "जामताड़ा",
    khunti: "खूंटी",
    koderma: "कोडरमा",
    latehar: "लातेहार",
    lohardaga: "लोहरदगा",
    pakur: "पाकुड़",
    ramgarh: "रामगढ़",
    sahibganj: "साहिबगंज",
    seraikela: "सरायकेला",
    simdega: "सिमडेगा",
    chaibasa: "चाईबासा",
    delhi: "दिल्ली",
    mumbai: "मुंबई",
    national: "राष्ट्रीय",
    all: "समग्र"
  };
  if (HINDI_DISTRICT_MAP[clean]) return HINDI_DISTRICT_MAP[clean];
  if (activeCityObj?.nameHi) {
    return activeCityObj.nameHi.split(" ")[0].replace(/[()]/g, "");
  }
  return districtRaw || "रांची";
}

function getLocalizedSubBeat(subCategoryRaw?: string, categoryRaw?: string, lang = "HI"): string {
  if (lang !== "HI") {
    return subCategoryRaw || categoryRaw || "Local News";
  }
  const clean = (subCategoryRaw || categoryRaw || "").toLowerCase().trim();
  const HINDI_BEAT_MAP: Record<string, string> = {
    "national news": "राष्ट्रीय समाचार",
    "top headlines": "मुख्य समाचार",
    "police & law": "पुलिस व कानून",
    "crime": "अपराध",
    "crime investigation": "अपराध जांच",
    "court & justice": "अदालत व न्याय",
    "cyber crime": "साइबर अपराध",
    "regional crime": "क्षेत्रीय घटनाएं",
    "state politics": "राज्य राजनीति",
    "national politics": "राष्ट्रीय राजनीति",
    "politics": "राजनीति",
    "elections & polls": "चुनाव व सर्वे",
    "government policies": "सरकारी नीतियां",
    "governance & society": "शासन व समाज",
    "education news": "शिक्षा समाचार",
    "education": "शिक्षा",
    "business": "व्यापार",
    "stock markets": "शेयर बाज़ार",
    "economy": "अर्थव्यवस्था",
    "technology": "तकनीक",
    "sports": "खेल",
    "cricket": "क्रिकेट",
    "entertainment": "मनोरंजन",
    "cinema & movies": "सिनेमा व फिल्में",
    "health": "स्वास्थ्य",
    "science": "विज्ञान",
    "breaking news": "ताज़ा ख़बर",
    "general": "विशेष कवरेज",
    "special report": "विशेष रिपोर्ट",
    "administration": "प्रशासनिक कार्रवाई",
    "accident": "दुर्घटना व आपदा",
    "anti-corruption": "भ्रष्टाचार निरोधक"
  };

  for (const [enKey, hiVal] of Object.entries(HINDI_BEAT_MAP)) {
    if (clean === enKey || clean.includes(enKey)) {
      return hiVal;
    }
  }

  if (/[\u0900-\u097F]/.test(subCategoryRaw || "")) {
    return subCategoryRaw || "विशेष कवरेज";
  }

  return subCategoryRaw || categoryRaw || "विशेष कवरेज";
}

function formatIndianTime(dateInput?: string | Date | null): string {
  if (!dateInput) return "10:30 am";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "10:30 am";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).toLowerCase();
  } catch (e) {
    return "10:30 am";
  }
}

function formatIndianDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "18 Sep 2026";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "18 Sep 2026";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  } catch (e) {
    return "18 Sep 2026";
  }
}

export default function HomeClient({
  initialArticles = [],
  initialAdSettings = {},
  initialLogoSettings = {}
}: {
  initialArticles?: Article[];
  initialAdSettings?: Record<string, string>;
  initialLogoSettings?: Record<string, string>;
}) {
  const { lang, t } = useLanguage();
  const isHi = lang === "HI";
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [activeVideoModal, setActiveVideoModal] = useState<YouTubeVideoItem | null>(null);
  const [trendingVideos, setTrendingVideos] = useState<YouTubeVideoItem[]>([]);

  const [userState, setUserState] = useState<IndianState>(
    INDIAN_STATES.find((s) => s.code === "JH") || INDIAN_STATES[0]
  );
  const [userCity, setUserCity] = useState("Ranchi");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [stickyAdData, setStickyAdData] = useState<{
    enabled: boolean;
    badge: string;
    text: string;
    link: string;
    image: string;
    bg: string;
    height: string;
  }>({
    enabled: initialAdSettings?.ad_sticky_enabled !== "false",
    badge: initialAdSettings?.ad_sticky_badge || "SPONSORED",
    text: initialAdSettings?.ad_sticky_text || "📢 Reach Millions of Readers with Global Awaaz Sponsorships!",
    link: initialAdSettings?.ad_sticky_link || "/advertise",
    image: initialAdSettings?.ad_sticky_image || "",
    bg: (initialAdSettings?.ad_sticky_bg && !initialAdSettings.ad_sticky_bg.includes("#1e293b")) ? initialAdSettings.ad_sticky_bg : "#000000",
    height: initialAdSettings?.ad_sticky_height || "auto"
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
    enabled: initialAdSettings?.ad_leaderboard_enabled !== "false",
    image: initialAdSettings?.ad_leaderboard_image || "",
    title: initialAdSettings?.ad_leaderboard_title || "GLOBAL AWAAZ DIGITAL MEDIA COVERAGE",
    subtitle: initialAdSettings?.ad_leaderboard_subtitle || "Get real-time news updates across Bihar, Jharkhand & National headlines 24/7",
    link: initialAdSettings?.ad_leaderboard_link || "/advertise",
    btnText: initialAdSettings?.ad_leaderboard_btn_text || "Advertise With Us",
    badge: initialAdSettings?.ad_leaderboard_badge || "ADVERTISEMENT",
    height: initialAdSettings?.ad_leaderboard_height || "110"
  });

  const [adDismissed, setAdDismissed] = useState(false);
  const [leaderboardAdDismissed, setLeaderboardAdDismissed] = useState(false);

  // ─── City News Section Settings State ──────────────────────────────────────
  const [cityNewsSettings, setCityNewsSettings] = useState({
    enabled: true,
    titleHi: "आपके शहर की ख़बरें",
    titleEn: "Your City News",
    subtitleHi: "झारखंड के 24 जिलों और प्रमुख शहरों का जमीनी कवरेज",
    subtitleEn: "Ground coverage of 24 districts and major cities",
    allLinkTextHi: "सभी राज्य व ज़िले देखें →",
    allLinkTextEn: "View All States & Districts →",
    allLinkUrl: "/india",
    cities: [
      { id: "1", nameHi: "रांची (मुख्य केंद्र)", nameEn: "Ranchi (HQ)", filterKey: "ranchi", isDefault: true },
      { id: "2", nameHi: "धनबाद", nameEn: "Dhanbad", filterKey: "dhanbad" },
      { id: "3", nameHi: "जमशेदपुर", nameEn: "Jamshedpur", filterKey: "jamshedpur" },
      { id: "4", nameHi: "बोकारो", nameEn: "Bokaro", filterKey: "bokaro" },
      { id: "5", nameHi: "हज़ारीबाग", nameEn: "Hazaribagh", filterKey: "hazaribagh" },
      { id: "6", nameHi: "देवघर", nameEn: "Deoghar", filterKey: "deoghar" },
      { id: "7", nameHi: "गिरिडीह", nameEn: "Giridih", filterKey: "giridih" },
      { id: "8", nameHi: "पलामू", nameEn: "Palamu", filterKey: "palamu" },
      { id: "9", nameHi: "पटना / बिहार", nameEn: "Patna / Bihar", filterKey: "patna" }
    ]
  });
  const [activeCityPillKey, setActiveCityPillKey] = useState("ranchi");

  const loadCityNewsSettings = useCallback(async (forceBypass = false) => {
    try {
      if (forceBypass) clearCacheKey("/api/v1/city-news-settings");
      const json = await fetchWithCache<{ success?: boolean; data?: any }>("/api/v1/city-news-settings", 30000);
      if (json && json.success && json.data) {
        const d = json.data;
        let parsedCities = [
          { id: "1", nameHi: "रांची (मुख्य केंद्र)", nameEn: "Ranchi (HQ)", filterKey: "ranchi", isDefault: true },
          { id: "2", nameHi: "धनबाद", nameEn: "Dhanbad", filterKey: "dhanbad" },
          { id: "3", nameHi: "जमशेदपुर", nameEn: "Jamshedpur", filterKey: "jamshedpur" },
          { id: "4", nameHi: "बोकारो", nameEn: "Bokaro", filterKey: "bokaro" },
          { id: "5", nameHi: "हज़ारीबाग", nameEn: "Hazaribagh", filterKey: "hazaribagh" },
          { id: "6", nameHi: "देवघर", nameEn: "Deoghar", filterKey: "deoghar" },
          { id: "7", nameHi: "गिरिडीह", nameEn: "Giridih", filterKey: "giridih" },
          { id: "8", nameHi: "पलामू", nameEn: "Palamu", filterKey: "palamu" },
          { id: "9", nameHi: "पटना / बिहार", nameEn: "Patna / Bihar", filterKey: "patna" }
        ];
        if (d.city_news_cities) {
          try {
            const c = JSON.parse(d.city_news_cities);
            if (Array.isArray(c) && c.length > 0) parsedCities = c;
          } catch (e) {}
        }
        setCityNewsSettings({
          enabled: d.city_news_enabled !== "false",
          titleHi: d.city_news_title_hi || "आपके शहर की ख़बरें",
          titleEn: d.city_news_title_en || "Your City News",
          subtitleHi: d.city_news_subtitle_hi || "झारखंड के 24 जिलों और प्रमुख शहरों का जमीनी कवरेज",
          subtitleEn: d.city_news_subtitle_en || "Ground coverage of 24 districts and major cities",
          allLinkTextHi: d.city_news_all_link_text_hi || "सभी राज्य व ज़िले देखें →",
          allLinkTextEn: d.city_news_all_link_text_en || "View All States & Districts →",
          allLinkUrl: d.city_news_all_link_url || "/india",
          cities: parsedCities
        });
        const def = parsedCities.find((c: any) => c.isDefault) || parsedCities[0];
        if (def) setActiveCityPillKey(def.filterKey);
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCityNewsSettings();
    }, 1200);
    const handleUpdate = () => loadCityNewsSettings(true);
    window.addEventListener("ga_city_news_updated", handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("ga_city_news_updated", handleUpdate);
    };
  }, [loadCityNewsSettings]);

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

  let initialParsedVideoAds: Array<{ id: string; url: string; title: string; targetLink: string }> = [
    {
      id: "1",
      url: initialLogoSettings?.sidebar_video_ad_url || "",
      title: initialLogoSettings?.sidebar_video_ad_title || "ग्लोबल आवाज़ विशेष डिजिटल मीडिया विज्ञापन",
      targetLink: initialLogoSettings?.sidebar_video_ad_target_link || "/advertise"
    }
  ];
  if (initialLogoSettings?.sidebar_video_ads_list) {
    try {
      const parsed = JSON.parse(initialLogoSettings.sidebar_video_ads_list);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialParsedVideoAds = parsed;
      }
    } catch (_) {}
  }

  const [videoAdsList, setVideoAdsList] = useState(initialParsedVideoAds);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [trendingSlideIndex, setTrendingSlideIndex] = useState(0);
  const [videoAdEnabled, setVideoAdEnabled] = useState(initialLogoSettings?.sidebar_video_ad_enabled !== "false");
  const [spotlightCol1Ad, setSpotlightCol1Ad] = useState<{ url: string; targetLink: string; title: string } | null>(
    initialLogoSettings?.spotlight_col1_ad_url
      ? {
          url: initialLogoSettings.spotlight_col1_ad_url,
          targetLink: initialLogoSettings.spotlight_col1_ad_link || "/advertise",
          title: initialLogoSettings.spotlight_col1_ad_title || "ग्लोबल आवाज़ विज्ञापन"
        }
      : null
  );
  const [spotlightCol2Ad, setSpotlightCol2Ad] = useState<{ url: string; targetLink: string; title: string } | null>(
    initialLogoSettings?.spotlight_col2_ad_url
      ? {
          url: initialLogoSettings.spotlight_col2_ad_url,
          targetLink: initialLogoSettings.spotlight_col2_ad_link || "/advertise",
          title: initialLogoSettings.spotlight_col2_ad_title || "ग्लोबल आवाज़ डिजिटल पार्टनर"
        }
      : null
  );

  const loadVideoAdSettings = useCallback(async (forceBypass = false) => {
    try {
      if (forceBypass) clearCacheKey("/api/v1/logo-settings");
      const json = await fetchWithCache<{ success?: boolean; data?: any }>("/api/v1/logo-settings", 30000);
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
    const handleUpdate = () => {
      loadStickyAdSettings(true);
      loadVideoAdSettings(true);
    };
    window.addEventListener("ga_sticky_ad_updated", handleUpdate);
    window.addEventListener("ga_video_ad_updated", handleUpdate);
    return () => {
      window.removeEventListener("ga_sticky_ad_updated", handleUpdate);
      window.removeEventListener("ga_video_ad_updated", handleUpdate);
    };
  }, [loadStickyAdSettings, loadVideoAdSettings]);

  // Auto-scroll Carousel timer for Image ads & static slides (3-second auto scroll)
  useEffect(() => {
    if (!videoAdEnabled || videoAdsList.length <= 1) return;
    const activeAd = videoAdsList[currentAdIndex];
    const rawUrl = activeAd?.url ? activeAd.url.toLowerCase() : "";
    const isYouTube = rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be") || rawUrl.includes("embed/");
    const isMp4 = rawUrl.endsWith(".mp4") || rawUrl.endsWith(".webm") || rawUrl.endsWith(".mov");

    // For images or static banner ads: auto-scroll every 3 seconds (3000ms)!
    if (!isMp4) {
      const scrollDuration = isYouTube ? 6000 : 3000;
      const timer = setTimeout(() => {
        setCurrentAdIndex((prev) => (prev + 1) % videoAdsList.length);
      }, scrollDuration);
      return () => clearTimeout(timer);
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

    const timer = setTimeout(updateVideos, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadUserState = () => {
      try {
        const manual = sessionStorage.getItem("ga_manual_state_selected");
        const savedCode = sessionStorage.getItem("ga_selected_state");
        if (manual === "true" && savedCode) {
          const match = INDIAN_STATES.find((s) => s.code === savedCode || s.slug === savedCode);
          if (match) setUserState(match);
        }
      } catch (e) {}
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
    // If SSR/ISR already provided initialArticles, do NOT re-fetch immediately on mount.
    // This prevents re-rendering the entire DOM, eliminates layout shifts, and keeps LCP sub-2s.
    if (initialArticles && initialArticles.length > 0) {
      return;
    }

    async function fetchArticles() {
      setLoading(true);
      let apiList: Article[] = [];
      try {
        const res = await fetch(API_ENDPOINTS.articles);
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

      if (apiList && apiList.length > 0) {
        setArticles(apiList);
      }
      setLoading(false);
    }

    fetchArticles();
  }, [initialArticles]);

  useEffect(() => {
    const syncManualLocation = () => {
      try {
        const manualCity = sessionStorage.getItem("ga_manual_city_selected");
        const savedCity = sessionStorage.getItem("ga_selected_city");
        if (manualCity === "true" && savedCity) {
          setUserCity(savedCity);
        }
      } catch (e) {}
    };

    syncManualLocation();
    window.addEventListener("ga_state_changed", syncManualLocation);

    return () => {
      window.removeEventListener("ga_state_changed", syncManualLocation);
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
      const multiCats = Array.isArray(a.categories)
        ? a.categories.map((c) => c.toLowerCase().trim())
        : [];

      const matchesPrimary = catSlug.includes(targetCat) || targetCat.includes(catSlug) || subCat.includes(targetCat);
      const matchesMulti = multiCats.some((c) => c.includes(targetCat) || targetCat.includes(c));

      if (!matchesPrimary && !matchesMulti) {
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
      const stFilter = activeFilters.state;
      const stLower = a.state.toLowerCase().trim();
      const targetState = stFilter.toLowerCase().trim().replace(/-/g, " ");
      const matchedSt = INDIAN_STATES.find(
        (s) => s.slug === stFilter || s.code.toLowerCase() === stFilter.toLowerCase()
      );
      const matchName = matchedSt ? matchedSt.nameEn.toLowerCase() : targetState;
      const matchCode = matchedSt ? matchedSt.code.toLowerCase() : targetState;
      if (!stLower.includes(matchName) && !stLower.includes(matchCode) && !stLower.includes(targetState)) {
        return false;
      }
    }

    return true;
  });

  // Helper to extract timestamp for chronological comparison (latest first)
  const getArticleTimestamp = (a: Article) => {
    const d = a.publishedAt || a.createdAt;
    if (!d) return 0;
    const t = new Date(d).getTime();
    return isNaN(t) ? 0 : t;
  };

  // Apply Sorting
  if (activeFilters?.sort === "popular") {
    filteredList = [...filteredList].sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
  } else if (activeFilters?.sort === "editors") {
    filteredList = [...filteredList].sort((a, b) => (b.isHero ? 1 : 0) - (a.isHero ? 1 : 0));
  } else {
    // Default: Strictly latest-wise (newest published/created first)
    filteredList = [...filteredList].sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a));
  }

  const activeArticles = (filteredList.length > 0 ? filteredList : baseArticles).sort(
    (a, b) => getArticleTimestamp(b) - getArticleTimestamp(a)
  );

  // Pure editorial / published order feed — strictly latest-wise
  const displayList = activeArticles;

  // ── 1. Main Trending / Hero: Newest article added by admin is ALWAYS #1 ─────
  const mainHero = displayList[0];

  // ── 2. Build Trending Slider Articles (Slide 1 is always the newest admin article) ─
  const otherTrending = displayList.filter((a) => a.isTrending && a.id !== mainHero?.id);
  const otherChronological = displayList.filter((a) => a.id !== mainHero?.id && !a.isTrending);

  const trendingSliderArticles = mainHero
    ? [mainHero, ...otherTrending, ...otherChronological].slice(0, 10)
    : displayList.slice(0, 10);

  // ── 3. Top 5 News (टॉप 5 न्यूज़ - 5 सबसे ताज़ा समाचार) ─────────────────────────
  // Strictly shows the NEXT 5 latest news directly following the featured trending news (excluding mainHero)
  const superfastList = displayList.filter((a) => a.id !== mainHero?.id).slice(0, 5);

  const secondaryHero = displayList.filter((a) => a.id !== mainHero?.id).slice(0, 4);
  const topStories = displayList.filter((a) => a.id !== mainHero?.id).slice(0, 6);

  // Regional / State section articles (only used for the manual state filter block)
  const userCityLower = userCity.toLowerCase().trim();
  const userStateLower = userState.nameEn.toLowerCase().trim();
  const userStateCodeLower = userState.code.toLowerCase().trim();
  const userStateSlugLower = userState.slug.toLowerCase().trim();

  const stateMatchedArticles = activeArticles.filter((a) => {
    if (a.district && (a.district.toLowerCase().includes(userCityLower) || userCityLower.includes(a.district.toLowerCase()))) return true;
    if (!a.state) return false;
    const stLower = a.state.toLowerCase().trim();
    return stLower === userStateLower || stLower === userStateCodeLower || stLower === userStateSlugLower || userStateLower.includes(stLower);
  });

  const stateArticles = stateMatchedArticles.length > 0
    ? stateMatchedArticles.slice(0, 6)
    : displayList.filter((a) => a.id !== mainHero?.id).slice(0, 6);

  const trendingArticles = displayList
    .filter((a) => a.isTrending)
    .sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a));
  const trendingList = (
    trendingArticles.length > 0
      ? trendingArticles
      : displayList.filter((a) => a.id !== mainHero?.id)
  )
    .sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a))
    .slice(0, 6);
  const todaysTopStories = displayList;

  // City News filtered articles based on selected pill
  const activeCityObj = cityNewsSettings.cities.find((c) => c.filterKey === activeCityPillKey) || cityNewsSettings.cities[0];
  const activeCityFilterKey = (activeCityPillKey || "ranchi").toLowerCase();

  const cityFilteredArticles = displayList.filter((a) => {
    const dist = (a.district || "").toLowerCase();
    const title = (a.title || "").toLowerCase();
    const summary = (a.summary || "").toLowerCase();
    const state = (a.state || "").toLowerCase();
    const cityNameHi = activeCityObj?.nameHi?.toLowerCase() || "";
    const cityNameEn = activeCityObj?.nameEn?.toLowerCase() || "";

    return (
      dist.includes(activeCityFilterKey) ||
      title.includes(activeCityFilterKey) ||
      summary.includes(activeCityFilterKey) ||
      (cityNameHi && (title.includes(cityNameHi) || dist.includes(cityNameHi))) ||
      (cityNameEn && (title.includes(cityNameEn) || dist.includes(cityNameEn))) ||
      (activeCityFilterKey.includes("patna") && (state.includes("bihar") || dist.includes("patna") || title.includes("बिहार") || title.includes("पटना"))) ||
      (activeCityFilterKey.includes("bihar") && (state.includes("bihar") || title.includes("बिहार")))
    );
  });

  const cityNewsDisplayArticles = (() => {
    if (cityFilteredArticles.length >= 3) return cityFilteredArticles.slice(0, 3);
    const existingIds = new Set(cityFilteredArticles.map(a => a.id));
    const fallbackList = displayList.filter(a => !existingIds.has(a.id));
    return [...cityFilteredArticles, ...fallbackList].slice(0, 3);
  })();

  const timeStr = mounted ? formatIndianTime(new Date()) : "10:30 am";
  const dateStr = mounted ? formatIndianDate(new Date()) : "18 Sep 2026";

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
              minHeight: "80px",
              contain: "layout",
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
                  <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", color: "#e50914", fontFamily: "var(--font-headline)" }}>
                    {lang === "HI" ? "ट्रेंडिंग न्यूज" : "TRENDING NEWS"}
                  </h2>
                </div>
                
                {/* Manual Slider Left/Right Navigation Arrows */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, marginRight: "4px" }}>
                    {trendingSlideIndex + 1} / {trendingSliderArticles.length || 1}
                  </span>
                  <button
                    onClick={() => setTrendingSlideIndex((prev) => (prev - 1 + (trendingSliderArticles.length || 1)) % (trendingSliderArticles.length || 1))}
                    style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f1f5f9", border: "1px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0f172a", fontWeight: 700 }}
                    title="Previous Trending News"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setTrendingSlideIndex((prev) => (prev + 1) % (trendingSliderArticles.length || 1))}
                    style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#e50914", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ffffff", fontWeight: 700 }}
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

                const badgeLabel = `🔥 TRENDING NEWS #${trendingSlideIndex + 1}`;

                return (
                  <Link href={getArticleUrl(activeSlide)} title={activeSlide.title} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <span style={{
                        background: "#e50914",
                        color: "#ffffff",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em"
                      }}>
                        {badgeLabel}
                      </span>
                      {activeSlide.isHero && (
                        <span style={{ background: "#dc2626", color: "#fff", fontSize: "0.68rem", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                          🌟 SPOTLIGHT
                        </span>
                      )}
                    </div>
                    <h3 title={activeSlide.title} style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.45, margin: "0 0 10px", color: "var(--color-text, #0f172a)" }}>
                      {activeSlide.title}
                    </h3>
                    <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "16/9", background: "#0a0f1d" }}>
                      <img
                        src={getArticleImage(activeSlide, trendingSlideIndex, 1000)}
                        alt={activeSlide.title}
                        title={activeSlide.title}
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
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
                      fontFamily: "var(--font-body)",
                      fontSize: "0.86rem",
                      color: "var(--color-secondary, #64748b)",
                      margin: "8px 0 0",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {stripHtml(activeSlide.summary)}
                    </p>
                    <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.82rem", color: "#e50914", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
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
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", color: "#e50914", fontFamily: "var(--font-headline)" }}>
                    {lang === "HI" ? "टॉप 5 न्यूज" : "TOP 5 NEWS"}
                  </h3>
                </div>
                <span style={{ fontSize: "0.74rem", color: "var(--color-secondary)", fontWeight: 500 }}>
                  {lang === "HI" ? "5 सबसे ताज़ा समाचार" : "5 Latest News"}
                </span>
              </div>

              {superfastList.slice(0, 5).map((item, idx) => (
                <article key={item.id} style={{ borderBottom: idx < Math.min(superfastList.length, 5) - 1 ? "1px solid var(--color-border, #f1f5f9)" : "none", padding: "12px 0" }}>
                  <Link href={getArticleUrl(item)} title={item.title} style={{ textDecoration: "none", color: "inherit", display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: idx < 3 ? "#e50914" : "#0f172a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div style={{ width: "75px", height: "54px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#1e293b" }}>
                      <img src={getArticleImage(item, idx + 1, 300)} alt={item.title} title={item.title} loading={idx === 0 ? "eager" : "lazy"} decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 title={item.title} style={{ fontFamily: "var(--font-headline)", margin: 0, fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: "var(--color-text, #0f172a)", wordBreak: "break-word" }}>
                        {item.title}
                      </h4>
                      {idx === 0 && (
                        <span style={{ fontSize: "0.74rem", color: "#e50914", fontWeight: 600, marginTop: "2px", display: "inline-block" }}>
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
                          loading="lazy"
                          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : cleanAdUrl.toLowerCase().endsWith(".mp4") || cleanAdUrl.toLowerCase().endsWith(".webm") || cleanAdUrl.toLowerCase().endsWith(".mov") ? (
                        <video
                          key={`mp4_${currentAdIndex}_${cleanAdUrl}`}
                          src={cleanAdUrl}
                          autoPlay
                          muted
                          preload="none"
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
                      ) : (
                        <img
                          key={`img_${currentAdIndex}_${cleanAdUrl}`}
                          src={cleanAdUrl}
                          alt={activeAd?.title || "Ad Banner"}
                          loading="lazy"
                          decoding="async"
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
                <img src={spotlightCol1Ad.url} alt={spotlightCol1Ad.title} loading="lazy" decoding="async" style={{ width: "100%", maxHeight: "280px", objectFit: "cover", borderRadius: "10px" }} />
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
                  {getArticleImage(item, idx + 2, 400) ? (
                    <img src={getArticleImage(item, idx + 2, 400)} alt={item.title} className="mobile-story-img" loading="lazy" decoding="async" />
                  ) : (
                    <div className="mobile-story-img-placeholder" />
                  )}
                  <span className="mobile-story-cat-badge" style={{ background: item.category?.color || "#e50914" }}>
                    {item.category?.name || (lang === "HI" ? "समाचार" : "NEWS")}
                  </span>
                </div>
                <h3 className="mobile-story-title">{item.title}</h3>
                <div className="mobile-story-footer" style={{ marginTop: "auto" }}>
                  <span suppressHydrationWarning className="mobile-story-time"><Clock size={11} /> {timeStr}</span>
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
              <h2 className="mobile-section-title" style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-headline)", color: "var(--color-text, #0f172a)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {lang === "HI" ? "राज्य व प्रादेशिक समाचार" : "State & Regional News"}
              </h2>
            </div>
            <span style={{ background: "rgba(229, 9, 20, 0.08)", color: "#e50914", fontSize: "0.74rem", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", whiteSpace: "nowrap", flexShrink: 0 }}>
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
                  <img src={getArticleImage(item, idx + 4, 600)} alt={item.title} title={item.title} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{ position: "absolute", top: "8px", left: "8px", background: "#e50914", color: "#fff", fontSize: "0.68rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 800 }}>
                    📍 {item.district || item.state || (lang === "HI" ? "प्रादेशिक" : "Regional")}
                  </span>
                </div>
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 title={item.title} style={{ margin: "0 0 8px 0", fontSize: "0.92rem", fontWeight: 800, lineHeight: 1.35, color: "var(--color-text, #0f172a)" }}>
                    {item.title}
                  </h3>
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.74rem", color: "var(--color-secondary, #64748b)" }}>
                    <span suppressHydrationWarning><Clock size={11} style={{ display: "inline", marginRight: "3px" }} /> {timeStr}</span>
                    <span style={{ color: "#e50914", fontWeight: 700 }}>{lang === "HI" ? "पढ़ें ▶" : "Read ▶"}</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ===========================
          🏙️ CITY NEWS SECTION (आपके शहर की ख़बरें)
          =========================== */}
      {cityNewsSettings.enabled && (
        <section
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "22px 24px",
            marginTop: "20px",
            marginBottom: "24px",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)"
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "18px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "#b91c1c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(185, 28, 28, 0.3)"
                }}
              >
                <Building2 size={22} color="#ffffff" />
              </div>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.25rem, 2.2vw, 1.55rem)",
                    fontWeight: 700,
                    lineHeight: 1.45,
                    color: "#0f172a",
                    fontFamily: "var(--font-headline)",
                    letterSpacing: 0
                  }}
                >
                  {lang === "HI" ? cityNewsSettings.titleHi : cityNewsSettings.titleEn}
                </h2>
                <p
                  style={{
                    margin: "3px 0 0 0",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    lineHeight: 1.5,
                    color: "#64748b",
                    fontFamily: "var(--font-ui)",
                    letterSpacing: 0
                  }}
                >
                  {lang === "HI" ? cityNewsSettings.subtitleHi : cityNewsSettings.subtitleEn}
                </p>
              </div>
            </div>

            <Link
              href={cityNewsSettings.allLinkUrl || "/india"}
              style={{
                color: "#b91c1c",
                fontWeight: 700,
                fontSize: "0.86rem",
                lineHeight: 1.4,
                letterSpacing: 0,
                textDecoration: "none",
                fontFamily: "var(--font-ui)",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                transition: "color 0.15s ease"
              }}
            >
              {lang === "HI" ? cityNewsSettings.allLinkTextHi : cityNewsSettings.allLinkTextEn}
            </Link>
          </div>

          {/* City Filter Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "8px",
              marginBottom: "18px",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
          >
            {cityNewsSettings.cities.map((city) => {
              const isActive = activeCityPillKey === city.filterKey;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setActiveCityPillKey(city.filterKey)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "24px",
                    fontSize: "0.84rem",
                    fontWeight: isActive ? 700 : 600,
                    fontFamily: "var(--font-ui)",
                    letterSpacing: 0,
                    lineHeight: 1.4,
                    border: isActive ? "none" : "1px solid #cbd5e1",
                    background: isActive ? "#991b1b" : "#eff6ff",
                    color: isActive ? "#ffffff" : "#1e293b",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    boxShadow: isActive ? "0 2px 8px rgba(153, 27, 27, 0.35)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  📍 {lang === "HI" ? city.nameHi : city.nameEn}
                </button>
              );
            })}
          </div>

          {/* 3-Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
              gap: "18px"
            }}
          >
            {cityNewsDisplayArticles.map((item, idx) => {
              const displayCity = getLocalizedCityName(item.district, lang, activeCityObj);
              const subBeat = getLocalizedSubBeat(item.subCategory, item.category?.name, lang);
              const cardTime = formatIndianTime(item.publishedAt || item.createdAt);

              return (
                <article
                  key={item.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(15, 23, 42, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(15, 23, 42, 0.04)";
                  }}
                >
                  <Link
                    href={getArticleUrl(item)}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%"
                    }}
                  >
                    {/* Card Image with dark chip */}
                    <div
                      style={{
                        position: "relative",
                        height: "195px",
                        overflow: "hidden",
                        background: "#0f172a"
                      }}
                    >
                      <img
                        src={getArticleImage(item, idx + 5, 600)}
                        alt={item.title}
                        title={item.title}
                        loading="lazy"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          background: "rgba(15, 23, 42, 0.85)",
                          backdropFilter: "blur(4px)",
                          color: "#ffffff",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          lineHeight: 1.3,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          letterSpacing: 0,
                          fontFamily: "var(--font-ui)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.35)"
                        }}
                      >
                        📍 {displayCity} • {subBeat}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div
                      style={{
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1
                      }}
                    >
                      {/* Red Beat Label */}
                      <span
                        style={{
                          color: "#b91c1c",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          fontFamily: "var(--font-ui)",
                          letterSpacing: 0,
                          lineHeight: 1.35,
                          marginBottom: "6px",
                          display: "block"
                        }}
                      >
                        {subBeat}
                      </span>

                      {/* Headline */}
                      <h3
                        style={{
                          margin: "0 0 8px 0",
                          fontFamily: "var(--font-headline)",
                          fontSize: "1.08rem",
                          fontWeight: 700,
                          lineHeight: 1.48,
                          letterSpacing: 0,
                          color: "#0f172a",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "3.1em"
                        }}
                      >
                        {item.title}
                      </h3>

                      {/* Excerpt */}
                      <p
                        style={{
                          margin: "0 0 14px 0",
                          fontFamily: "var(--font-body)",
                          fontSize: "0.88rem",
                          lineHeight: 1.65,
                          letterSpacing: 0,
                          textAlign: "left",
                          color: "#475569",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "3.2em"
                        }}
                      >
                        {stripHtml(item.summary) || (item.body ? stripHtml(item.body).slice(0, 140) : item.title)}
                      </p>

                      {/* Bottom Footer */}
                      <div
                        style={{
                          marginTop: "auto",
                          paddingTop: "10px",
                          borderTop: "1px solid #f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "0.78rem",
                          color: "#64748b",
                          fontFamily: "var(--font-ui)"
                        }}
                      >
                        <span suppressHydrationWarning style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                          {cardTime} • {item.readTime || (lang === "HI" ? "4 मिनट" : "4 min")}
                        </span>
                        <span
                          style={{
                            color: "#b91c1c",
                            fontWeight: 700,
                            letterSpacing: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "2px"
                          }}
                        >
                          {lang === "HI" ? "विस्तृत पढ़ें ▶" : "Read Full ▶"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ===========================
          DESKTOP: Today's Top Stories Horizontal Carousel
          =========================== */}
      <section className="todays-top-stories-section desktop-top-stories" style={{ marginTop: "0px", marginBottom: "0px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <div>
            <h2 className="section-title" style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.01em", fontFamily: "var(--font-headline)" }}>
              {t("todaysTopStories")}
            </h2>
            <span style={{ fontSize: "0.85rem", color: "var(--color-secondary)", marginTop: "4px", display: "block", fontFamily: "var(--font-ui)" }}>
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
                      <img src={getArticleImage(item, index + 3, 600)} alt={item.title} title={item.title} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                      <span suppressHydrationWarning style={{ display: "flex", alignItems: "center", gap: "3px", fontWeight: 500 }}>
                        <Clock size={12} />
                        {timeStr}
                      </span>
                      <span style={{ color: "var(--color-border)" }}>|</span>
                      <span suppressHydrationWarning style={{ display: "flex", alignItems: "center", gap: "3px", fontWeight: 500 }}>
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
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-headline)" }}>
                | {t("trendingVideos")}
                <ArrowRight size={22} style={{ color: "var(--color-text)", strokeWidth: 2.8 }} />
              </h2>
            </div>
          </Link>
          <Link href="/videos" style={{ color: "#e50914", textDecoration: "none", fontWeight: 700, fontSize: "0.88rem" }}>
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
