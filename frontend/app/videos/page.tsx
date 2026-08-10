"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Youtube,
  Play,
  Eye,
  Calendar,
  Share2,
  ThumbsUp,
  Search,
  Filter,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Tv,
  Maximize2,
  Minimize2,
  ExternalLink,
  X
} from "lucide-react";
import {
  YouTubeVideoItem,
  fetchCentralVideos,
  DEFAULT_VIDEOS
} from "@/lib/youtube";

export default function VideosPage() {
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<YouTubeVideoItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cinemaMode, setCinemaMode] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const toggleNativeFullScreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen?.().catch(() => setCinemaMode(true));
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    function processVideoList(list: YouTubeVideoItem[]) {
      setVideos(list);

      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const targetV = params?.get("v") || params?.get("id");

      if (targetV) {
        const found = list.find((v) => v.youtubeId === targetV || v.id === targetV);
        if (found) {
          setActiveVideo(found);
          return;
        }
      }

      if (list.length > 0) {
        setActiveVideo((prev) => prev || list[0]);
      } else {
        setActiveVideo(null);
      }
    }

    const syncCentral = () => {
      fetchCentralVideos().then(({ videos: centralList }) => {
        if (Array.isArray(centralList) && centralList.length > 0) {
          processVideoList(centralList);
        }
      });
    };

    syncCentral();
    const interval = setInterval(syncCentral, 15000);

    const loadLocal = () => syncCentral();
    window.addEventListener("storage", loadLocal);
    window.addEventListener("popstate", loadLocal);
    window.addEventListener("ga_videos_updated", loadLocal);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", loadLocal);
      window.removeEventListener("popstate", loadLocal);
      window.removeEventListener("ga_videos_updated", loadLocal);
    };
  }, []);

  const categories = ["ALL", "World", "India", "Business", "Technology", "Sports", "Entertainment"];

  const filteredVideos = videos.filter((v) => {
    const matchesCat = selectedCategory === "ALL" || v.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery.trim() || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleShare = () => {
    if (!activeVideo) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectVideo = (video: YouTubeVideoItem) => {
    setActiveVideo(video);
    setLiked(false);
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  return (
    <div className="video-page-wrapper">
      {/* Top Header Navigation Banner */}
      <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "12px 0" }}>
        <div className="video-header-nav">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#475569", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600 }}>
              <ArrowLeft size={16} /> Back to Newsroom
            </Link>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ background: "#e50914", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontWeight: 900, fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "5px" }}>
                <Youtube size={15} /> GLOBAL AWAAZ TV
              </div>
              <span className="video-header-brand-sub" style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>YouTube Media Portal</span>
            </div>
          </div>

          <div className="video-search-wrapper">
            <div style={{ position: "relative", width: "100%" }}>
              <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="video-search-input"
                style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 12px 8px 36px", color: "#0f172a", fontSize: "0.85rem", outline: "none", width: "200px" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="video-page-container" style={{ maxWidth: "1280px", margin: "24px auto 0", padding: "0 20px" }}>

        {/* Featured Main YouTube Player */}
        {activeVideo ? (
          <div style={{ marginBottom: "40px" }}>
            <div className="video-player-grid">
              {/* Left Column: Video Player Container */}
              <div
                ref={playerRef}
                className="video-iframe-container"
              >
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&fs=1&enablejsapi=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen={true}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </div>

              {/* Right Column: Metadata, Controls & Details Panel */}
              <div className="video-info-panel">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <span style={{ background: "rgba(229,9,20,0.1)", color: "#e50914", border: "1px solid rgba(229,9,20,0.25)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>
                      {activeVideo.category}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Eye size={14} /> {activeVideo.views || "125K views"}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={14} /> {activeVideo.publishedAt || "Recently Published"}
                    </span>
                  </div>

                  <h1 style={{ margin: "0 0 12px 0", fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.35, fontFamily: "sans-serif" }}>
                    {activeVideo.title}
                  </h1>

                  {activeVideo.description && (
                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "12px 14px", borderRadius: "8px", color: "#334155", fontSize: "0.85rem", lineHeight: 1.5 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>
                        By {activeVideo.author || "Global Awaaz Media"}
                      </p>
                      {activeVideo.description}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
                  <button
                    onClick={handleShare}
                    style={{ background: "#ffffff", color: "#334155", border: "1px solid #cbd5e1", padding: "10px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flex: 1 }}
                  >
                    {copied ? <CheckCircle2 size={16} style={{ color: "#16a34a" }} /> : <Share2 size={16} />}
                    {copied ? "Copied!" : "Share"}
                  </button>

                  <a
                    href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "10px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 4px 14px rgba(229,9,20,0.3)", flex: 1, whiteSpace: "nowrap" }}
                  >
                    <ExternalLink size={16} /> Open in YouTube
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Category Filters Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <Tv size={20} style={{ color: "#e50914" }} /> Video Library & Live Broadcasts ({filteredVideos.length})
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
              Watch world news, business insights, and tech breakthroughs hosted on YouTube
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: selectedCategory === cat ? "1.5px solid #e50914" : "1px solid #cbd5e1",
                  background: selectedCategory === cat ? "#e50914" : "#ffffff",
                  color: selectedCategory === cat ? "#ffffff" : "#334155",
                  transition: "all 0.15s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Video Cards Grid */}
        {filteredVideos.length === 0 ? (
          <div style={{ textOverflow: "ellipsis", padding: "60px 0", textAlign: "center", color: "#64748b" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No YouTube videos found in this category.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {filteredVideos.map((item) => {
              const isCurrent = activeVideo?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => selectVideo(item)}
                  style={{
                    background: isCurrent ? "#fef2f2" : "#ffffff",
                    border: isCurrent ? "2px solid #e50914" : "1px solid #e2e8f0",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.05)"
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.borderColor = "rgba(229,9,20,0.5)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }
                  }}
                >
                  {/* Thumbnail Wrap */}
                  <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000", overflow: "hidden" }}>
                    <img
                      src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                      alt={item.title}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />

                    {/* Red Play Overlay */}
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ background: "#e50914", width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 16px rgba(229,9,20,0.6)" }}>
                        <Play size={20} style={{ fill: "#fff", marginLeft: "3px" }} />
                      </div>
                    </div>

                    <span style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", color: "#fff", padding: "3px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 800 }}>
                      {item.category}
                    </span>

                    {isCurrent && (
                      <span style={{ position: "absolute", top: "10px", right: "10px", background: "#e50914", color: "#fff", padding: "3px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 800 }}>
                        NOW PLAYING
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "14px 16px" }}>
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.title}
                    </h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "0.78rem", color: "#64748b" }}>
                      <span>{item.author || "Global Awaaz TV"}</span>
                      <span>{item.views || "100K views"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cinema Mode Fullscreen Modal */}
      {cinemaMode && activeVideo && (
        <div style={{ position: "fixed", inset: 0, background: "#000000", zIndex: 99999, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 24px", background: "#0a0a0a", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ background: "#e50914", color: "#fff", padding: "3px 10px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 800 }}>CINEMA FULLSCREEN</span>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "600px" }}>{activeVideo.title}</h3>
            </div>
            <button
              onClick={() => setCinemaMode(false)}
              style={{ background: "#222", border: "1px solid #444", color: "#fff", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}
            >
              <X size={18} /> Exit Fullscreen
            </button>
          </div>

          <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=0&rel=0&fs=1`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen={true}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
