"use client";

import React, { useState, useEffect } from "react";
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
  getStoredVideos,
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

  const playerRef = React.useRef<HTMLDivElement>(null);

  const toggleNativeFullScreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen?.().catch(() => setCinemaMode(true));
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    function loadVideos() {
      const list = getStoredVideos();
      setVideos(list);

      // Check URL query string for ?v=YOUTUBE_ID or ?id=VIDEO_ID
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
        setActiveVideo(list[0]);
      } else {
        setActiveVideo(null);
      }
    }

    loadVideos();
    window.addEventListener("storage", loadVideos);
    window.addEventListener("popstate", loadVideos);
    return () => {
      window.removeEventListener("storage", loadVideos);
      window.removeEventListener("popstate", loadVideos);
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
    <div style={{ background: "#0a0a0c", color: "#f4f4f5", minHeight: "100vh", paddingBottom: "60px" }}>
      {/* Top Header Navigation Banner */}
      <div style={{ background: "#111115", borderBottom: "1px solid #22222a", padding: "16px 0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/" style={{ color: "#a1a1aa", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.88rem", fontWeight: 600 }}>
              <ArrowLeft size={16} /> Back to Newsroom
            </Link>
            <span style={{ color: "#333" }}>|</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ background: "#e50914", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontWeight: 900, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }}>
                <Youtube size={16} /> GLOBAL AWAAZ TV
              </div>
              <span style={{ fontSize: "0.85rem", color: "#a1a1aa", fontWeight: 600 }}>YouTube Media Portal</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#71717a" }} />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: "#18181c", border: "1px solid #27272a", borderRadius: "8px", padding: "8px 12px 8px 36px", color: "#fff", fontSize: "0.85rem", outline: "none", width: "200px" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "24px auto 0", padding: "0 20px" }}>

        {/* Featured Main YouTube Player - 650x350 Left Corner Layout */}
        {activeVideo ? (
          <div style={{ marginBottom: "40px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
              alignItems: "stretch"
            }}>
              {/* Left Column: Fixed 650x350 Video Player */}
              <div
                ref={playerRef}
                style={{
                  width: "100%",
                  maxWidth: "650px",
                  height: "350px",
                  background: "#000000",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "2px solid #27272a",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                  position: "relative",
                  flexShrink: 0
                }}
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
              <div style={{
                background: "#141418",
                border: "1px solid #27272a",
                borderRadius: "16px",
                padding: "24px",
                height: "350px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
                overflowY: "auto"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <span style={{ background: "rgba(229,9,20,0.15)", color: "#ff4d4d", border: "1px solid rgba(229,9,20,0.3)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>
                      {activeVideo.category}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Eye size={14} /> {activeVideo.views || "125K views"}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={14} /> {activeVideo.publishedAt || "Recently Published"}
                    </span>
                  </div>

                  <h1 style={{ margin: "0 0 12px 0", fontSize: "1.45rem", fontWeight: 800, color: "#ffffff", lineHeight: 1.3, fontFamily: "serif" }}>
                    {activeVideo.title}
                  </h1>

                  {activeVideo.description && (
                    <div style={{ background: "#1c1c22", border: "1px solid #27272a", padding: "12px 14px", borderRadius: "8px", color: "#d4d4d8", fontSize: "0.85rem", lineHeight: 1.5 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "#ffffff", marginBottom: "2px" }}>
                        By {activeVideo.author || "Global Awaaz Media"}
                      </p>
                      {activeVideo.description}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #27272a" }}>
                  <button
                    onClick={toggleNativeFullScreen}
                    title="Expand Fullscreen"
                    style={{ background: "#e50914", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 14px rgba(229,9,20,0.4)" }}
                  >
                    <Maximize2 size={16} /> Fullscreen
                  </button>

                  <button
                    onClick={() => setLiked(!liked)}
                    style={{ background: liked ? "#e50914" : "#27272a", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s" }}
                  >
                    <ThumbsUp size={16} /> {liked ? "Liked" : "Like"}
                  </button>

                  <button
                    onClick={handleShare}
                    style={{ background: "#27272a", color: "#fff", border: "1px solid #3f3f46", padding: "10px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    {copied ? <CheckCircle2 size={16} style={{ color: "#36b37e" }} /> : <Share2 size={16} />}
                    {copied ? "Copied!" : "Share"}
                  </button>

                  <a
                    href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: "#27272a", color: "#a1a1aa", border: "1px solid #3f3f46", padding: "10px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <ExternalLink size={16} /> YouTube
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Category Filters Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
              <Tv size={20} style={{ color: "#e50914" }} /> Video Library & Live Broadcasts ({filteredVideos.length})
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#a1a1aa" }}>
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
                  border: selectedCategory === cat ? "1.5px solid #e50914" : "1px solid #27272a",
                  background: selectedCategory === cat ? "#e50914" : "#18181c",
                  color: "#ffffff",
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
          <div style={{ textOverflow: "ellipsis", padding: "60px 0", textAlign: "center", color: "#71717a" }}>
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
                    background: isCurrent ? "#1c1c24" : "#141418",
                    border: isCurrent ? "2px solid #e50914" : "1px solid #27272a",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
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
                      e.currentTarget.style.borderColor = "#27272a";
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
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.title}
                    </h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "0.78rem", color: "#a1a1aa" }}>
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
