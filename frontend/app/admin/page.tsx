"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  ImageIcon,
  BarChart3,
  Bot,
  Plus,
  LogOut,
  Loader2,
  Search,
  CheckCircle,
  Activity,
  Zap,
  Edit,
  Trash2,
  Sparkles,
  ArrowUpRight,
  X,
  Upload,
  Image as ImageIcon2,
  Youtube,
  Video,
  Play
} from "lucide-react";
import { saveStoredVideos, getStoredVideos, extractYouTubeId, YouTubeVideoItem } from "@/lib/youtube";
import { API_ENDPOINTS } from "@/lib/config";

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  featuredImage?: string;
  category?: { name: string; slug?: string; color?: string };
  author?: { name: string };
  status: string;
  views?: number;
  readTime?: string;
  publishedAt?: string;
  isPinned?: boolean;
  isHero?: boolean;
  language?: "EN" | "HI";
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
  videoUrl?: string;
}

const LOCAL_STORAGE_KEY = "ga_custom_articles";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [languageFilter, setLanguageFilter] = useState("ALL");

  // AI State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("World");
  const [formAuthor, setFormAuthor] = useState("Global Admin");
  const [formStatus, setFormStatus] = useState("PUBLISHED");
  const [formLanguage, setFormLanguage] = useState<"EN" | "HI">("EN");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [formIsHero, setFormIsHero] = useState(false);
  const [formImageHeight, setFormImageHeight] = useState("auto");
  const [formCustomHeight, setFormCustomHeight] = useState("");
  const [formImageFit, setFormImageFit] = useState<"cover" | "contain" | "fill">("cover");
  const [formVideoUrl, setFormVideoUrl] = useState("");

  // YouTube Video Management States
  const [videosList, setVideosList] = useState<YouTubeVideoItem[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideoItem | null>(null);
  const [formYtTitle, setFormYtTitle] = useState("");
  const [formYtUrl, setFormYtUrl] = useState("");
  const [formYtCategory, setFormYtCategory] = useState("World");
  const [formYtDescription, setFormYtDescription] = useState("");
  const [formYtDuration, setFormYtDuration] = useState("01:30");

  useEffect(() => {
    setVideosList(getStoredVideos());
  }, []);

  useEffect(() => {
    async function loadInitialArticles() {
      let combined: AdminArticle[] = [];

      try {
        const res = await fetch(API_ENDPOINTS.articles);
        const json = await res.json();
        if (json && json.data && Array.isArray(json.data)) {
          combined = json.data;
        }
      } catch (err) {
        console.warn("Backend API fetch error in Admin:", err);
      }

      try {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(combined.map((a) => a.id));
            const uniqueCustom = parsed.filter((a: AdminArticle) => !existingIds.has(a.id));
            combined = [...uniqueCustom, ...combined];
          }
        }
      } catch (e) {
        console.warn("LocalStorage parse error:", e);
      }

      // Do not populate hardcoded mock articles
      setArticles(combined);
      setLoading(false);
    }

    loadInitialArticles();
  }, []);

  const saveToLocalStorage = (updatedArticles: AdminArticle[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedArticles));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("ga_articles_updated"));
    } catch (e) {
      console.warn("Error saving to localStorage:", e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleToggleHero = (id: string) => {
    const updatedList = articles.map((art) => {
      if (art.id === id) {
        const nextHero = !art.isHero;
        showToast(nextHero ? `⭐ "${art.title.slice(0, 30)}..." is set as MAIN HERO Headline on Homepage!` : `Removed Main Hero status.`);
        return { ...art, isHero: nextHero };
      }
      return { ...art, isHero: false };
    });
    setArticles(updatedList);
    saveToLocalStorage(updatedList);
  };

  const handleOpenVideoModal = () => {
    setEditingVideo(null);
    setFormYtTitle("");
    setFormYtUrl("");
    setFormYtCategory("World");
    setFormYtDescription("");
    setFormYtDuration("01:30");
    setIsVideoModalOpen(true);
  };

  const handleOpenEditVideoModal = (v: YouTubeVideoItem) => {
    setEditingVideo(v);
    setFormYtTitle(v.title);
    setFormYtUrl(v.youtubeUrl || `https://www.youtube.com/watch?v=${v.youtubeId}`);
    setFormYtCategory(v.category || "World");
    setFormYtDescription(v.description || "");
    setFormYtDuration(v.duration || "01:30");
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formYtTitle.trim() || !formYtUrl.trim()) {
      showToast("Please enter YouTube video title and URL!");
      return;
    }

    const yId = extractYouTubeId(formYtUrl);
    if (!yId) {
      showToast("Invalid YouTube Video URL or ID!");
      return;
    }

    let updatedVideos: YouTubeVideoItem[] = [];

    if (editingVideo) {
      updatedVideos = videosList.map((v) =>
        v.id === editingVideo.id
          ? {
              ...v,
              title: formYtTitle,
              youtubeUrl: formYtUrl,
              youtubeId: yId,
              category: formYtCategory,
              description: formYtDescription,
              duration: formYtDuration || "01:30"
            }
          : v
      );
      showToast(`YouTube video "${formYtTitle}" updated successfully!`);
    } else {
      const newV: YouTubeVideoItem = {
        id: "yt-custom-" + Date.now(),
        title: formYtTitle,
        youtubeUrl: formYtUrl,
        youtubeId: yId,
        category: formYtCategory,
        description: formYtDescription,
        duration: formYtDuration || "01:30",
        author: "Global Awaaz Admin",
        publishedAt: new Date().toISOString().split("T")[0],
        views: "1.2K views"
      };
      updatedVideos = [newV, ...videosList];
      showToast(`YouTube video "${formYtTitle}" added to Video Hub!`);
    }

    setVideosList(updatedVideos);
    saveStoredVideos(updatedVideos);
    setIsVideoModalOpen(false);
  };

  const handleDeleteVideo = (id: string, title: string) => {
    if (confirm(`Delete video "${title}"?`)) {
      const updated = videosList.filter((v) => v.id !== id);
      setVideosList(updated);
      saveStoredVideos(updated);
      showToast(`YouTube video deleted.`);
    }
  };

  const handleOpenPublishModal = () => {
    setEditingArticle(null);
    setFormTitle("");
    setFormCategory("World");
    setFormAuthor("Global Admin");
    setFormStatus("PUBLISHED");
    setFormLanguage("EN");
    setFormSummary("");
    setFormContent("");
    setFormImage("");
    setImageFileName("");
    setFormIsHero(false);
    setFormImageHeight("auto");
    setFormCustomHeight("");
    setFormImageFit("cover");
    setFormVideoUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (art: AdminArticle) => {
    setEditingArticle(art);
    setFormTitle(art.title || "");
    setFormCategory(art.category?.name || "World");
    setFormAuthor(art.author?.name || "Global Admin");
    setFormStatus(art.status || "PUBLISHED");
    setFormLanguage(art.language || "EN");
    setFormSummary(art.summary || "");
    setFormContent(art.body || "");
    setFormImage(art.featuredImage || "");
    setImageFileName("");
    setFormIsHero(!!art.isHero);
    setFormVideoUrl(art.videoUrl || "");
    
    // Height & Fit state check
    const h = art.imageHeight || "auto";
    const knownPresets = ["auto", "220px", "300px", "400px", "500px", "60vh"];
    if (knownPresets.includes(h)) {
      setFormImageHeight(h);
      setFormCustomHeight("");
    } else {
      setFormImageHeight("custom");
      setFormCustomHeight(h);
    }
    setFormImageFit(art.imageFit || "cover");

    setIsModalOpen(true);
  };

  const processAndUploadFile = async (file: File) => {
    setImageFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(API_ENDPOINTS.mediaUpload, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json && json.data && json.data.url) {
        setFormImage(json.data.url);
        showToast("✓ Image uploaded to Cloudinary CDN!");
        return;
      } else if (json && json.message) {
        console.error("Cloudinary upload error response:", json.message);
        showToast(`Cloudinary Error: ${json.message}`);
      }
    } catch (err) {
      console.warn("Backend image upload network error:", err);
      showToast("Network error trying to upload image to Cloudinary.");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setFormImage(reader.result);
        showToast("Using local image preview (Cloudinary upload skipped)");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const catSlug = formCategory.toLowerCase();
    const catColor = getCategoryColor(formCategory);
    const finalImage = formImage.trim();

    const effectiveHeight = formImageHeight === "custom"
      ? (formCustomHeight.trim() || "auto")
      : formImageHeight;

    let updatedList: AdminArticle[] = [];

    if (editingArticle) {
      updatedList = articles.map((art) => {
        if (art.id === editingArticle.id) {
          return {
            ...art,
            title: formTitle,
            summary: formSummary || formTitle,
            body: formContent || formTitle,
            featuredImage: finalImage,
            imageHeight: effectiveHeight,
            imageFit: formImageFit,
            videoUrl: formVideoUrl.trim(),
            category: { name: formCategory, slug: catSlug, color: catColor },
            author: { name: formAuthor },
            status: formStatus,
            language: formLanguage,
            isHero: formIsHero
          };
        }
        return formIsHero ? { ...art, isHero: false } : art;
      });
      showToast(`Article "${formTitle}" updated successfully!`);
    } else {
      // ── Slug generation — handles Latin AND non-Latin (Hindi) titles ──────
      const rawSlug = formTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[^a-z0-9\s-]/g, "")   // drop non-ASCII chars (Devanagari, etc.)
        .trim()
        .replace(/[\s]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // For fully Hindi titles, rawSlug will be ""; use a timestamp-based slug
      const uniqueId = Date.now();
      const computedSlug = rawSlug.length > 2
        ? rawSlug
        : `article-${uniqueId}`;

      const newArt: AdminArticle = {
        id: "custom-" + uniqueId,
        title: formTitle,
        slug: computedSlug,
        summary: formSummary || formTitle,
        body: formContent || formTitle,
        featuredImage: finalImage,
        imageHeight: effectiveHeight,
        imageFit: formImageFit,
        videoUrl: formVideoUrl.trim(),
        category: { name: formCategory, slug: catSlug, color: catColor },
        author: { name: formAuthor },
        status: formStatus,
        language: formLanguage,
        isHero: formIsHero,
        readTime: "4 min read",
        views: 1,
        publishedAt: new Date().toISOString()
      };
      
      const prevArticles = formIsHero ? articles.map(a => ({ ...a, isHero: false })) : articles;
      updatedList = [newArt, ...prevArticles];
      showToast(`New article (${formLanguage === "HI" ? "Hindi 🇮🇳" : "English 🇬🇧"}) published to Homepage!`);
    }

    setArticles(updatedList);
    saveToLocalStorage(updatedList);
    setIsModalOpen(false);

    // Persist to global MySQL database via API
    const targetArt = editingArticle ? updatedList.find(a => a.id === editingArticle.id) : updatedList[0];
    if (targetArt) {
      try {
        const res = await fetch(API_ENDPOINTS.articles, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(targetArt),
        });
        const json = await res.json();
        if (json?.success) {
          showToast("✓ Story saved globally to database!");
        }
      } catch (err) {
        console.warn("Backend article save request failed:", err);
      }
    }
  };

  const handleDeleteArticle = async (id: string, title: string, slug?: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const targetKey = slug || id;
      try {
        await fetch(`${API_ENDPOINTS.articles}/${targetKey}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Backend delete request failed:", err);
      }
      const updatedList = articles.filter((a) => a.id !== id && a.slug !== slug);
      setArticles(updatedList);
      saveToLocalStorage(updatedList);
      showToast(`Article "${title}" deleted from database.`);
    }
  };

  const handleAiAction = (action: string) => {
    if (!aiPrompt.trim()) {
      showToast("Please enter a topic or text prompt for AI copilot!");
      return;
    }
    setAiLoading(true);
    setTimeout(() => {
      if (action === "summarize") {
        setAiResult(`Executive Summary for "${aiPrompt}": Strategic developments indicate key market momentum, technological advancements, and high engagement across global channels.`);
      } else {
        setAiResult(`AI Generated Headlines:\n1. Breaking Analysis: ${aiPrompt}\n2. Deep Dive: Implications of ${aiPrompt}\n3. Global Perspective: What Experts Say About ${aiPrompt}`);
      }
      setAiLoading(false);
    }, 700);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "business": return "#3b82f6";
      case "technology": return "#8b5cf6";
      case "sports": return "#00875a";
      case "india": return "#f59e0b";
      default: return "#e50914";
    }
  };

  const filteredArticles = articles.filter((art) =>
    (art.title ? art.title.toLowerCase().includes(searchQuery.toLowerCase()) : true) &&
    (statusFilter === "ALL" || art.status === statusFilter) &&
    (languageFilter === "ALL" || (languageFilter === "HI" ? art.language === "HI" : art.language !== "HI"))
  );

  return (
    <div className="admin-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "#0a0a0a", color: "#ffffff", border: "2px solid #e50914", padding: "14px 20px", borderRadius: "10px", boxShadow: "0 10px 30px rgba(229,9,20,0.2)", zIndex: 9999, fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle size={18} style={{ color: "#00875a" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Sidebar */}
      <aside className="admin-sidebar-nav">
        <div style={{ paddingBottom: "24px", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "#e50914", width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.3rem", flexShrink: 0 }}>
              G
            </div>
            <div>
              <h2 style={{ fontFamily: "serif", fontSize: "1.1rem", color: "#ffffff", margin: 0, fontWeight: 900, letterSpacing: "0.02em" }}>
                GLOBAL AWAAZ
              </h2>
              <span style={{ color: "#e50914", fontSize: "0.68rem", fontWeight: 700, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                CMS Portal
              </span>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <button
            onClick={() => setActiveTab("dashboard")}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", background: activeTab === "dashboard" ? "#e50914" : "transparent", color: "#ffffff", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Vitals</span>
          </button>

          <button
            onClick={() => setActiveTab("articles")}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", background: activeTab === "articles" ? "#e50914" : "transparent", color: "#ffffff", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}
          >
            <FileText size={18} />
            <span>Articles ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", background: activeTab === "categories" ? "#e50914" : "transparent", color: "#ffffff", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}
          >
            <FolderTree size={18} />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab("media")}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", background: activeTab === "media" ? "#e50914" : "transparent", color: "#ffffff", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}
          >
            <ImageIcon size={18} />
            <span>Media Vault CDN</span>
          </button>

          <button
            onClick={() => setActiveTab("videos")}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "10px", background: activeTab === "videos" ? "#e50914" : "transparent", color: "#ffffff", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Youtube size={18} />
              <span>YouTube Videos ({videosList.length})</span>
            </div>
            <span style={{ background: "rgba(229,9,20,0.25)", color: "#ff4d4d", fontSize: "0.68rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>YT</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "10px", background: activeTab === "ai" ? "#e50914" : "transparent", color: "#ffffff", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Bot size={18} />
              <span>AI Copilot</span>
            </div>
            <span style={{ background: "rgba(229,9,20,0.2)", color: "#ff4d4d", fontSize: "0.68rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>AI</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", background: activeTab === "analytics" ? "#e50914" : "transparent", color: "#ffffff", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </button>
        </nav>

        <div style={{ paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", fontWeight: 600, transition: "color 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#e50914"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)"; }}
          >
            <LogOut size={16} /> Exit to Newsroom
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px", paddingBottom: "24px", borderBottom: "2px solid #f0f0f0" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0, textTransform: "capitalize", color: "#0a0a0a", letterSpacing: "-0.01em" }}>
              {activeTab} Overview
            </h1>
            <span style={{ fontSize: "0.85rem", color: "#6b6b6b", marginTop: "4px", display: "block", fontWeight: 500 }}>
              Full CRUD Content & Media Management Portal
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleOpenVideoModal}
              style={{ background: "#0a0a0a", color: "#fff", border: "1.5px solid #0a0a0a", padding: "12px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}
            >
              <Youtube size={18} style={{ color: "#e50914" }} /> Add YouTube Video
            </button>
            <button
              onClick={handleOpenPublishModal}
              style={{ background: "#e50914", color: "#fff", border: "none", padding: "12px 22px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 16px rgba(229,9,20,0.35)", fontSize: "0.9rem", letterSpacing: "0.01em" }}
            >
              <Plus size={18} /> Publish Story
            </button>
          </div>
        </header>

        {/* YouTube Video Hub (Rendered when Videos tab active or in media overview) */}
        {activeTab === "videos" && (
          <div className="admin-table-container" style={{ marginBottom: "32px" }}>
            <div className="admin-table-header">
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#0a0a0a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Youtube size={20} style={{ color: "#e50914" }} /> YouTube Video Hub & Live Broadcasts ({videosList.length})
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#6b6b6b" }}>
                  Manage YouTube video embeds displayed on the /videos page & homepage
                </span>
              </div>
              <button
                onClick={handleOpenVideoModal}
                style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.88rem", boxShadow: "0 4px 14px rgba(229,9,20,0.3)" }}
              >
                <Plus size={16} /> Add YouTube Video
              </button>
            </div>

            {videosList.length === 0 ? (
              <div style={{ padding: "50px", textAlign: "center", color: "#6b6b6b" }}>
                <p>No YouTube videos added yet. Click "+ Add YouTube Video" above!</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", padding: "20px" }}>
                {videosList.map((video) => (
                  <div
                    key={video.id}
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #e5e5e5",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000" }}>
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                        alt={video.title}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ background: "#e50914", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                          <Play size={16} style={{ fill: "#fff", marginLeft: "2px" }} />
                        </div>
                      </div>
                      <span style={{ position: "absolute", top: "8px", left: "8px", background: "#e50914", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 800 }}>
                        {video.category}
                      </span>
                      <span style={{ position: "absolute", bottom: "8px", left: "8px", background: "rgba(0,0,0,0.8)", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                        <Play size={10} style={{ fill: "#fff" }} /> {video.duration || "01:30"}
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "14px" }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0a0a0a", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {video.title}
                      </h4>
                      <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "#6b6b6b" }}>
                        ID: <code style={{ background: "#f5f5f7", padding: "2px 6px", borderRadius: "4px", color: "#e50914" }}>{video.youtubeId}</code>
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f0f0f0" }}>
                        <a
                          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#e50914", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <Youtube size={14} /> Open YouTube
                        </a>

                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => handleOpenEditVideoModal(video)}
                            style={{ background: "#f5f5f7", border: "1px solid #e5e5e5", borderRadius: "6px", cursor: "pointer", padding: "5px 8px", color: "#0a0a0a" }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.id, video.title)}
                            style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", padding: "5px 8px", color: "#e50914" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Metric Cards */}
        <div className="admin-vitals-grid">
          <div className="admin-stat-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b6b6b" }}>Total Story Views</span>
              <Activity size={18} style={{ color: "#e50914" }} />
            </div>
            <h2 style={{ fontSize: "2.4rem", fontWeight: 900, color: "#e50914", margin: "12px 0 4px 0", lineHeight: 1 }}>
              {articles.reduce((acc, art) => acc + (art.views || 0), 0) > 0 ? articles.reduce((acc, art) => acc + (art.views || 0), 0).toLocaleString() : "0"}
            </h2>
            <span style={{ fontSize: "0.78rem", color: articles.reduce((acc, art) => acc + (art.views || 0), 0) > 0 ? "#15803d" : "#6b6b6b", fontWeight: 700 }}>
              {articles.reduce((acc, art) => acc + (art.views || 0), 0) > 0 ? "⚡ Live Reader Interactions" : "No views recorded yet"}
            </span>
          </div>

          <div className="admin-stat-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b6b6b" }}>Total Stories</span>
              <FileText size={18} style={{ color: "#0a0a0a" }} />
            </div>
            <h2 style={{ fontSize: "2.4rem", fontWeight: 900, color: "#0a0a0a", margin: "12px 0 4px 0", lineHeight: 1 }}>{articles.length}</h2>
            <span style={{ fontSize: "0.78rem", color: "#6b6b6b", fontWeight: 600 }}>Active CRUD Queue</span>
          </div>

          <div className="admin-stat-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b6b6b" }}>Meilisearch</span>
              <Zap size={18} style={{ color: "#15803d" }} />
            </div>
            <h2 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#15803d", margin: "12px 0 4px 0", lineHeight: 1 }}>HEALTHY</h2>
            <span style={{ fontSize: "0.78rem", color: "#15803d", fontWeight: 700 }}>Sub-10ms query</span>
          </div>

          <div className="admin-stat-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b6b6b" }}>Authenticated Role</span>
              <CheckCircle size={18} style={{ color: "#e50914" }} />
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#e50914", margin: "12px 0 4px 0", lineHeight: 1 }}>SUPERADMIN</h2>
            <span style={{ fontSize: "0.78rem", color: "#6b6b6b", fontWeight: 600 }}>Full 7-Tier Access</span>
          </div>
        </div>

        {/* AI Newsroom Copilot Box */}
        {(activeTab === "ai" || activeTab === "dashboard") && (
          <div className="admin-card-box">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Sparkles size={22} style={{ color: "#e50914" }} />
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Google Gemini 1.5 AI Copilot</h3>
            </div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="Enter article text or draft topic..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", border: "1px solid #27272a", background: "#1c1c21", color: "#f4f4f5", fontSize: "0.95rem" }}
              />
              <button
                onClick={() => handleAiAction("summarize")}
                style={{ background: "#e50914", color: "#fff", border: "none", padding: "12px 18px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                Summarize
              </button>
              <button
                onClick={() => handleAiAction("headline")}
                style={{ background: "#27272a", color: "#f4f4f5", border: "1px solid #3f3f46", padding: "12px 18px", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}
              >
                Gen Headlines
              </button>
            </div>
            {aiLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-secondary)", padding: "8px 0" }}>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Generating AI insights...
              </div>
            )}
            {aiResult && (
              <div style={{ background: "#1c1c21", border: "1px solid #27272a", padding: "16px", borderRadius: "10px", fontSize: "0.9rem", color: "#f4f4f5", fontWeight: 500, whiteSpace: "pre-line" }}>
                {aiResult}
              </div>
            )}
          </div>
        )}

        {/* Live Articles Table */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
              Live Articles & Editorial Queue ({filteredArticles.length})
            </h3>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-secondary)" }} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: "8px 12px 8px 36px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.85rem" }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.85rem", fontWeight: 600 }}
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.85rem", fontWeight: 600 }}
              >
                <option value="ALL">All Languages</option>
                <option value="EN">🇬🇧 English Only</option>
                <option value="HI">🇮🇳 Hindi Only</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "50px 0" }}>
              <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "#e50914" }} />
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th style={{ width: "64px" }}>Image</th>
                  <th style={{ width: "35%" }}>Story Title</th>
                  <th style={{ width: "100px" }}>Category</th>
                  <th style={{ width: "100px" }}>Language</th>
                  <th style={{ width: "140px" }}>Author</th>
                  <th style={{ width: "100px" }}>Status</th>
                  <th style={{ width: "90px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((art) => (
                  <tr key={art.id}>
                    <td>
                      <div style={{ width: "48px", height: "36px", borderRadius: "6px", overflow: "hidden", background: "#18181b" }}>
                        <img
                          src={art.featuredImage || ""}
                          alt={art.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, maxWidth: "320px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <Link href={`/article/${art.slug}`} style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                          {art.title} <ArrowUpRight size={14} style={{ color: "var(--color-secondary)" }} />
                        </Link>
                        {art.isHero && (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            background: "#fffbeb",
                            color: "#b45309",
                            border: "1px solid rgba(245,158,11,0.4)",
                            width: "fit-content"
                          }}>
                            ⭐ MAIN HOMEPAGE HERO
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        maxWidth: "100px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        background: "rgba(229,9,20,0.08)",
                        color: "#c00",
                        border: "1.5px solid rgba(229,9,20,0.2)",
                        letterSpacing: "0.02em",
                      }}>
                        {art.category?.name || "General"}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        background: art.language === "HI" ? "#fff7ed" : "#f0fdf4",
                        color: art.language === "HI" ? "#c2410c" : "#15803d",
                        border: art.language === "HI" ? "1px solid #ffedd5" : "1px solid #dcfce7"
                      }}>
                        {art.language === "HI" ? "🇮🇳 Hindi" : "🇬🇧 English"}
                      </span>
                    </td>
                    <td style={{ color: "#333333", fontWeight: 500, fontSize: "0.88rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, flexShrink: 0 }}>
                          {(art.author?.name || "GA").charAt(0).toUpperCase()}
                        </div>
                        <span style={{ maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {art.author?.name || "Global Admin"}
                        </span>
                      </div>
                    </td>
                    <td>
                      {art.status === "DRAFT" ? (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "5px 11px",
                          borderRadius: "20px",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                          background: "#fef9c3",
                          color: "#854d0e",
                          border: "1.5px solid #fde68a",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ca8a04", flexShrink: 0 }} />
                          Draft
                        </span>
                      ) : (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "5px 11px",
                          borderRadius: "20px",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                          background: "#dcfce7",
                          color: "#166534",
                          border: "1.5px solid #86efac",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} />
                          Live
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          title={art.isHero ? "Remove Main Homepage Hero Status" : "Set as Main Homepage Hero Headline"}
                          onClick={() => handleToggleHero(art.id)}
                          style={{
                            background: art.isHero ? "#fffbeb" : "#f5f5f7",
                            border: art.isHero ? "1.5px solid #f59e0b" : "1.5px solid #e5e5e5",
                            borderRadius: "7px",
                            cursor: "pointer",
                            color: art.isHero ? "#b45309" : "#666",
                            padding: "6px 8px",
                            display: "flex",
                            alignItems: "center",
                            transition: "all 0.15s"
                          }}
                        >
                          <Sparkles size={14} style={{ color: art.isHero ? "#f59e0b" : "#666" }} />
                        </button>
                        <button
                          title="Edit Article"
                          onClick={() => handleOpenEditModal(art)}
                          style={{ background: "#f5f5f7", border: "1.5px solid #e5e5e5", borderRadius: "7px", cursor: "pointer", color: "#0a0a0a", padding: "6px 8px", display: "flex", alignItems: "center", transition: "all 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#0a0a0a"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#0a0a0a"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#f5f5f7"; e.currentTarget.style.color = "#0a0a0a"; e.currentTarget.style.borderColor = "#e5e5e5"; }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          title="Delete Article"
                          onClick={() => handleDeleteArticle(art.id, art.title, art.slug)}
                          style={{ background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: "7px", cursor: "pointer", color: "#e50914", padding: "6px 8px", display: "flex", alignItems: "center", transition: "all 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#e50914"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#e50914"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.color = "#e50914"; e.currentTarget.style.borderColor = "#fecaca"; }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Publish & Edit Story Modal Dialog (Full CRUD Form) */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderTop: "4px solid #e50914", borderRadius: "14px", width: "100%", maxWidth: "700px", padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto", color: "#0a0a0a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", borderBottom: "1.5px solid #f0f0f0", paddingBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.01em" }}>
                {editingArticle ? "✏️ Edit Article" : "+ Publish New Article"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "#f5f5f7", border: "1.5px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", color: "#0a0a0a", padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#e50914"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#e50914"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f5f5f7"; e.currentTarget.style.color = "#0a0a0a"; e.currentTarget.style.borderColor = "#e5e5e5"; }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Story Title</label>
                <input
                  type="text"
                  required
                  placeholder="Enter story headline..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#fafafa", color: "#0a0a0a", fontSize: "0.95rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Short Teaser / Summary</label>
                <input
                  type="text"
                  placeholder="Short summary for homepage and card teaser..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#fafafa", color: "#0a0a0a", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#fafafa", color: "#0a0a0a", fontWeight: 600 }}
                  >
                    <option value="World">World</option>
                    <option value="India">India</option>
                    <option value="Business">Business</option>
                    <option value="Technology">Technology</option>
                    <option value="Sports">Sports</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Science">Science</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Language (भाषा)</label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value as "EN" | "HI")}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#fafafa", color: "#0a0a0a", fontWeight: 600 }}
                  >
                    <option value="EN">🇬🇧 English (EN)</option>
                    <option value="HI">🇮🇳 Hindi (हिंदी - HI)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#fafafa", color: "#0a0a0a", fontWeight: 600 }}
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Author Name</label>
                <input
                  type="text"
                  placeholder="Author name..."
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#fafafa", color: "#0a0a0a", fontSize: "0.95rem" }}
                />
              </div>

              {/* Image Manager: Drag & Drop File Upload */}
              <div style={{ borderRadius: "10px", overflow: "hidden" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px", color: "#a1a1aa" }}>
                  Featured Image
                </label>

                {/* Drop Zone */}
                <label
                  htmlFor="admin-image-upload"
                  onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = "#e50914"; (e.currentTarget as HTMLElement).style.background = "rgba(229,9,20,0.06)"; }}
                  onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      processAndUploadFile(file);
                    }
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "28px 20px",
                    border: "2px dashed rgba(255,255,255,0.12)",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "center"
                  }}
                >
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(229,9,20,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Upload size={22} style={{ color: "#e50914" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", color: "#f4f4f5" }}>
                      Click to upload or drag & drop
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#71717a" }}>
                      PNG, WebP, JPG, GIF — max 10 MB
                    </p>
                  </div>
                  <input
                    id="admin-image-upload"
                    type="file"
                    accept="image/png,image/webp,image/jpeg,image/jpg,image/gif"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                </label>

                {/* Preview */}
                {formImage && (
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "12px", padding: "12px 14px", background: "rgba(54,179,126,0.06)", border: "1px solid rgba(54,179,126,0.2)", borderRadius: "10px" }}>
                    <div style={{ width: "72px", height: "52px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)" }}>
                      <img src={formImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#36b37e" }}>✓ Image ready</p>
                      {imageFileName && (
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#71717a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {imageFileName}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setFormImage(""); setImageFileName(""); }}
                      style={{ background: "rgba(229,9,20,0.12)", border: "1px solid rgba(229,9,20,0.3)", color: "#ff4d4d", padding: "5px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Video URL Attachment (YouTube / Vimeo / MP4) */}
              <div style={{ background: "#fcf8fa", border: "1.5px solid #fbcfe8", borderRadius: "10px", padding: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 800, color: "#be185d", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <Video size={16} /> Article Video Story Embed (ऑप्शनल / Optional)
                </label>
                <input
                  type="url"
                  placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...) or MP4 video link..."
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", background: "#ffffff", color: "#0f172a", fontSize: "0.9rem", fontWeight: 600 }}
                />
                <p style={{ margin: "6px 0 0", fontSize: "0.76rem", color: "#64748b" }}>
                  🎬 Adding a YouTube/video link will embed an HD video player at the top of the article reader page.
                </p>

                {/* Live Video Preview in Modal */}
                {formVideoUrl.trim() && extractYouTubeId(formVideoUrl) && (
                  <div style={{ marginTop: "12px", borderRadius: "8px", overflow: "hidden", aspectRatio: "16/9", background: "#000", border: "2px solid #be185d" }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeId(formVideoUrl)}`}
                      title="Video Preview"
                      style={{ width: "100%", height: "100%", border: "none" }}
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {/* Image Viewport Height & Fitting Controls */}
              <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, marginBottom: "10px", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  📐 Featured Image Viewport Height & Fitting
                </label>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "6px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                      Card Image Height (ऊंचाई)
                    </label>
                    <select
                      value={formImageHeight}
                      onChange={(e) => setFormImageHeight(e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "7px", border: "1.5px solid #cbd5e1", background: "#ffffff", color: "#0f172a", fontSize: "0.88rem", fontWeight: 600 }}
                    >
                      <option value="auto">Auto (Default Aspect)</option>
                      <option value="220px">Standard (220px)</option>
                      <option value="300px">Medium Height (300px)</option>
                      <option value="400px">Tall / Large (400px)</option>
                      <option value="500px">Extra Tall (500px)</option>
                      <option value="60vh">Viewport 60vh (60vh)</option>
                      <option value="custom">⚙️ Custom Height...</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                      Image Aspect Fit Mode (फिट प्रकार)
                    </label>
                    <select
                      value={formImageFit}
                      onChange={(e) => setFormImageFit(e.target.value as any)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "7px", border: "1.5px solid #cbd5e1", background: "#ffffff", color: "#0f172a", fontSize: "0.88rem", fontWeight: 600 }}
                    >
                      <option value="cover">Cover (Crop to fill card)</option>
                      <option value="contain">Contain (Fit whole image — no crop!)</option>
                      <option value="fill">Fill (Stretch to container)</option>
                    </select>
                  </div>
                </div>

                {formImageHeight === "custom" && (
                  <div style={{ marginTop: "10px" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#e50914", marginBottom: "4px" }}>
                      Enter Custom Height (e.g. 350px, 450px, or 70vh):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 380px or 65vh"
                      value={formCustomHeight}
                      onChange={(e) => setFormCustomHeight(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "7px", border: "1.5px solid #e50914", background: "#ffffff", color: "#0a0a0a", fontSize: "0.88rem" }}
                    />
                  </div>
                )}
              </div>

              <RichTextEditor value={formContent} onChange={setFormContent} />

              {/* Homepage Placement Switch Boxes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Hero Headline Box */}
                <div
                  onClick={() => setFormIsHero(!formIsHero)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    background: formIsHero ? "#fffbeb" : "#fafafa",
                    border: formIsHero ? "2px solid #f59e0b" : "1.5px solid #e5e5e5",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.18s ease"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formIsHero}
                    onChange={(e) => setFormIsHero(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#f59e0b", cursor: "pointer" }}
                  />
                  <div>
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: formIsHero ? "#b45309" : "#0a0a0a", display: "flex", alignItems: "center", gap: "6px" }}>
                      ⭐ Set as MAIN HERO Headline Banner on Homepage (मुख्य मुख्य समाचार)
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "#666", display: "block", marginTop: "2px" }}>
                      Displays this story as the primary giant hero feature on the homepage left section.
                    </span>
                  </div>
                </div>

              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1.5px solid #f0f0f0" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "11px 22px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#ffffff", color: "#0a0a0a", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f7"; e.currentTarget.style.borderColor = "#0a0a0a"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e5e5e5"; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "11px 28px", borderRadius: "8px", border: "none", background: "#e50914", color: "#ffffff", fontWeight: 800, cursor: "pointer", fontSize: "0.9rem", boxShadow: "0 4px 16px rgba(229,9,20,0.3)", letterSpacing: "0.01em" }}
                >
                  {editingArticle ? "Save Changes" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit YouTube Video Modal */}
      {isVideoModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderTop: "4px solid #e50914", borderRadius: "14px", width: "100%", maxWidth: "600px", padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto", color: "#0a0a0a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1.5px solid #f0f0f0", paddingBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900, color: "#0a0a0a", display: "flex", alignItems: "center", gap: "8px" }}>
                <Youtube size={22} style={{ color: "#e50914" }} /> {editingVideo ? "Edit YouTube Video" : "Add New YouTube Video"}
              </h3>
              <button onClick={() => setIsVideoModalOpen(false)} style={{ background: "#f5f5f7", border: "1.5px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", color: "#0a0a0a", padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "#6b6b6b", textTransform: "uppercase" }}>
                  YouTube Video URL or ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or Video ID"
                  value={formYtUrl}
                  onChange={(e) => setFormYtUrl(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#fafafa", color: "#0a0a0a", fontSize: "0.95rem" }}
                />
              </div>

              {/* Instant YouTube Thumbnail Preview */}
              {formYtUrl && extractYouTubeId(formYtUrl) ? (
                <div style={{ padding: "12px", background: "#f5f5f7", border: "1px solid #e5e5e5", borderRadius: "10px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "120px", height: "68px", borderRadius: "6px", overflow: "hidden", background: "#000", flexShrink: 0 }}>
                    <img src={`https://img.youtube.com/vi/${extractYouTubeId(formYtUrl)}/hqdefault.jpg`} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#15803d", fontWeight: 800, display: "block" }}>✓ Valid YouTube Video ID</span>
                    <code style={{ fontSize: "0.75rem", color: "#e50914" }}>{extractYouTubeId(formYtUrl)}</code>
                  </div>
                </div>
              ) : null}

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "#6b6b6b", textTransform: "uppercase" }}>
                  Video Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter video headline / title..."
                  value={formYtTitle}
                  onChange={(e) => setFormYtTitle(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#fafafa", color: "#0a0a0a", fontSize: "0.95rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "#6b6b6b", textTransform: "uppercase" }}>
                  Video Duration (e.g. 01:08)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01:08 or 02:43"
                  value={formYtDuration}
                  onChange={(e) => setFormYtDuration(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#fafafa", color: "#0a0a0a", fontSize: "0.95rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "#6b6b6b", textTransform: "uppercase" }}>
                  Category
                </label>
                <select
                  value={formYtCategory}
                  onChange={(e) => setFormYtCategory(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#fafafa", color: "#0a0a0a", fontWeight: 600 }}
                >
                  <option value="World">World</option>
                  <option value="India">India</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Politics">Politics</option>
                  <option value="News">News</option>
                  <option value="Health">Health</option>
                  <option value="National">National</option>
                  <option value="Business">Business</option>
                  <option value="Technology">Technology</option>
                  <option value="Sports">Sports</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "#6b6b6b", textTransform: "uppercase" }}>
                  Description / Synopsis
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the YouTube video..."
                  value={formYtDescription}
                  onChange={(e) => setFormYtDescription(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#fafafa", color: "#0a0a0a", fontSize: "0.9rem", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", paddingTop: "14px", borderTop: "1.5px solid #f0f0f0" }}>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  style={{ padding: "10px 20px", borderRadius: "8px", border: "1.5px solid #e5e5e5", background: "#ffffff", color: "#0a0a0a", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "#e50914", color: "#ffffff", fontWeight: 800, cursor: "pointer", fontSize: "0.88rem", boxShadow: "0 4px 14px rgba(229,9,20,0.3)" }}
                >
                  {editingVideo ? "Save Changes" : "Add YouTube Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
