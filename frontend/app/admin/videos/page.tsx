"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  Plus,
  Play,
  Trash2,
  Edit,
  CheckCircle,
  Youtube,
  Search,
  Tv,
  Share2,
  ExternalLink
} from "lucide-react";
import { fetchCentralVideos, saveCentralVideos, extractYouTubeId, YouTubeVideoItem } from "@/lib/youtube";

export default function AdminVideosPage() {
  const [videosList, setVideosList] = useState<YouTubeVideoItem[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideoItem | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Video Form
  const [formYtTitle, setFormYtTitle] = useState("");
  const [formYtUrl, setFormYtUrl] = useState("");
  const [formYtCategory, setFormYtCategory] = useState("World");
  const [formYtDescription, setFormYtDescription] = useState("");
  const [formYtDuration, setFormYtDuration] = useState("01:30");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("ALL");

  // Live TV & Social Config State
  const [liveTvTitle, setLiveTvTitle] = useState("GLOBAL AWAAZ NEWS 24/7");
  const [liveTvSubtitle, setLiveTvSubtitle] = useState("लाइव न्यूज़ बुलेटिन और मुख्य समाचार प्रसारण");
  const [liveTvStreamUrl, setLiveTvStreamUrl] = useState("");
  const [googleNewsUrl, setGoogleNewsUrl] = useState("https://news.google.com");
  const [whatsappUrl, setWhatsappUrl] = useState("https://whatsapp.com");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    // Central Database load across all machines & devices
    fetchCentralVideos().then(({ videos, liveTvConfig }) => {
      if (Array.isArray(videos) && videos.length > 0) {
        setVideosList(videos);
      }
      if (liveTvConfig) {
        if (liveTvConfig.channelTitle) setLiveTvTitle(liveTvConfig.channelTitle);
        if (liveTvConfig.subtitle) setLiveTvSubtitle(liveTvConfig.subtitle);
        if (liveTvConfig.streamUrl) setLiveTvStreamUrl(liveTvConfig.streamUrl);
        if (liveTvConfig.googleNewsUrl) setGoogleNewsUrl(liveTvConfig.googleNewsUrl);
        if (liveTvConfig.whatsappUrl) setWhatsappUrl(liveTvConfig.whatsappUrl);
      }
    });
  }, []);

  const handleSaveLiveTvConfig = () => {
    const config = {
      channelTitle: liveTvTitle.trim() || "GLOBAL AWAAZ NEWS 24/7",
      subtitle: liveTvSubtitle.trim() || "लाइव न्यूज़ बुलेटिन और मुख्य समाचार प्रसारण",
      streamUrl: liveTvStreamUrl.trim(),
      googleNewsUrl: googleNewsUrl.trim() || "https://news.google.com",
      whatsappUrl: whatsappUrl.trim() || "https://whatsapp.com"
    };
    saveCentralVideos(videosList, config);
    showToast("✓ Live TV Stream & Social Channel settings saved centrally to database!");
  };

  const handleOpenVideoModal = (vid?: YouTubeVideoItem) => {
    if (vid) {
      setEditingVideo(vid);
      setFormYtTitle(vid.title);
      setFormYtUrl(vid.videoUrl || vid.youtubeUrl || "");
      setFormYtCategory(vid.category || "World");
      setFormYtDescription(vid.description || "");
      setFormYtDuration(vid.duration || "01:30");
    } else {
      setEditingVideo(null);
      setFormYtTitle("");
      setFormYtUrl("");
      setFormYtCategory("World");
      setFormYtDescription("");
      setFormYtDuration("01:30");
    }
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formYtTitle.trim() || !formYtUrl.trim()) {
      showToast("Title and YouTube URL are required!");
      return;
    }

    const videoId = extractYouTubeId(formYtUrl);
    if (!videoId) {
      showToast("Invalid YouTube URL! Please check link format.");
      return;
    }

    let updated: YouTubeVideoItem[];

    if (editingVideo) {
      updated = videosList.map((v) =>
        v.id === editingVideo.id
          ? {
              ...v,
              title: formYtTitle.trim(),
              videoUrl: formYtUrl.trim(),
              youtubeId: videoId,
              thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              category: formYtCategory,
              description: formYtDescription.trim(),
              duration: formYtDuration.trim()
            }
          : v
      );
      showToast("✓ YouTube video updated!");
    } else {
      const newVid: YouTubeVideoItem = {
        id: `yt_${Date.now()}`,
        title: formYtTitle.trim(),
        videoUrl: formYtUrl.trim(),
        youtubeId: videoId,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        category: formYtCategory,
        description: formYtDescription.trim(),
        duration: formYtDuration.trim(),
        views: "1.2K views",
        timeAgo: "Just now",
        isLive: false
      };
      updated = [newVid, ...videosList];
      showToast("✓ New video published centrally to all devices!");
    }

    setVideosList(updated);
    await saveCentralVideos(updated);
    setIsVideoModalOpen(false);
  };

  const handleDeleteVideo = async (id: string, title: string) => {
    if (confirm(`Delete video "${title}"?`)) {
      const updated = videosList.filter((v) => v.id !== id);
      setVideosList(updated);
      await saveCentralVideos(updated);
      showToast("Video deleted successfully.");
    }
  };

  const categories = ["ALL", "India", "World", "Business", "Sports", "Technology", "Entertainment"];

  const filteredVideos = activeCategoryFilter === "ALL"
    ? videosList
    : videosList.filter((v) => v.category?.toLowerCase() === activeCategoryFilter.toLowerCase());

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "#0a0a0a", color: "#ffffff", border: "2px solid #e50914", padding: "14px 20px", borderRadius: "10px", boxShadow: "0 10px 30px rgba(229,9,20,0.2)", zIndex: 9999, fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle size={18} style={{ color: "#22c55e" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Videos Section Header */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Youtube size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                YouTube Video Bulletin Manager
              </h2>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                Publish video reports, live broadcasts & YouTube news clips to your portal.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenVideoModal()}
            style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "11px 22px", borderRadius: "10px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(229,9,20,0.3)" }}
          >
            <Plus size={18} /> Add New YouTube Video
          </button>
        </div>

        {/* Homepage Live 24/7 TV Stream & Social Channels Settings */}
        <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "20px", marginTop: "20px" }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
            <Tv size={18} style={{ color: "#e50914" }} /> Homepage Live 24/7 TV Stream & Social Follow Channels Settings
          </h3>
          <p style={{ margin: "0 0 16px 0", fontSize: "0.82rem", color: "#64748b" }}>
            Configure live broadcast video URL, channel title, Google News link, and WhatsApp channel link shown on homepage spotlight sidebar.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                Live TV Channel Title
              </label>
              <input
                type="text"
                value={liveTvTitle}
                onChange={(e) => setLiveTvTitle(e.target.value)}
                placeholder="e.g. GLOBAL AWAAZ NEWS 24/7"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                Live TV Broadcast Subtitle / Ticker
              </label>
              <input
                type="text"
                value={liveTvSubtitle}
                onChange={(e) => setLiveTvSubtitle(e.target.value)}
                placeholder="e.g. लाइव न्यूज़ बुलेटिन और मुख्य समाचार प्रसारण"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff" }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                Live Stream Video URL / YouTube Embed URL (Optional)
              </label>
              <input
                type="text"
                value={liveTvStreamUrl}
                onChange={(e) => setLiveTvStreamUrl(e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=YOUR_VIDEO_ID or https://www.youtube.com/embed/YOUR_VIDEO_ID"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                Google News Channel URL
              </label>
              <input
                type="text"
                value={googleNewsUrl}
                onChange={(e) => setGoogleNewsUrl(e.target.value)}
                placeholder="e.g. https://news.google.com"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                WhatsApp Channel Link
              </label>
              <input
                type="text"
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                placeholder="e.g. https://whatsapp.com/channel/..."
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff" }}
              />
            </div>
          </div>

          <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSaveLiveTvConfig}
              style={{ background: "#0f172a", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}
            >
              Save Live TV & Social Settings ✓
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ display: "flex", gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              style={{
                background: activeCategoryFilter === cat ? "#0f172a" : "#f1f5f9",
                color: activeCategoryFilter === cat ? "#ffffff" : "#475569",
                border: "none",
                padding: "7px 16px",
                borderRadius: "9999px",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {cat === "ALL" ? "All Videos" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
        {filteredVideos.map((video) => (
          <div key={video.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
            {/* Thumbnail Box */}
            <div style={{ position: "relative", height: "170px", background: "#000000" }}>
              <img src={video.thumbnailUrl} alt={video.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }} />
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noreferrer"
                style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
              >
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(229, 9, 20, 0.9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", boxShadow: "0 4px 20px rgba(229, 9, 20, 0.5)" }}>
                  <Play size={22} style={{ marginLeft: "3px" }} />
                </div>
              </a>
              <span style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.8)", color: "#ffffff", padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700 }}>
                {video.duration || "01:30"}
              </span>
              <span style={{ position: "absolute", top: "10px", left: "10px", background: "#e50914", color: "#ffffff", padding: "3px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase" }}>
                {video.category || "General"}
              </span>
            </div>

            {/* Content Details */}
            <div style={{ padding: "18px" }}>
              <h3 style={{ fontSize: "0.98rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {video.title}
              </h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "0.82rem", color: "#64748b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {video.description || "No description provided."}
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 600 }}>
                  {video.views || "1.2K views"}
                </span>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleOpenVideoModal(video)}
                    style={{ background: "#f1f5f9", color: "#334155", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Edit size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(video.id, video.title)}
                    style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "540px", padding: "28px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 20px 0", color: "#0f172a" }}>
              {editingVideo ? "Edit YouTube Video" : "Publish New YouTube Video"}
            </h3>

            <form onSubmit={handleSaveVideo} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Video Title *</label>
                <input
                  type="text"
                  placeholder="Enter video bulletin title..."
                  value={formYtTitle}
                  onChange={(e) => setFormYtTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>YouTube Video URL *</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formYtUrl}
                  onChange={(e) => setFormYtUrl(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Category</label>
                  <select
                    value={formYtCategory}
                    onChange={(e) => setFormYtCategory(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  >
                    {categories.filter(c => c !== "ALL").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Duration (MM:SS)</label>
                  <input
                    type="text"
                    value={formYtDuration}
                    onChange={(e) => setFormYtDuration(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of video coverage..."
                  value={formYtDescription}
                  onChange={(e) => setFormYtDescription(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: 800, cursor: "pointer" }}
                >
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
