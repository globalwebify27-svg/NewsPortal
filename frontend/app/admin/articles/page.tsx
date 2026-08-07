"use client";

import React, { useState, useEffect } from "react";
import RichTextEditor from "@/components/RichTextEditor";
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Edit,
  Trash2,
  Sparkles,
  ArrowUpRight,
  Upload,
  Image as ImageIcon2,
  Zap
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";
import { getArticleImage } from "@/lib/defaultArticles";
import { INDIAN_STATES } from "@/lib/states";
import { INDIAN_DISTRICTS, getDistrictsForState } from "@/lib/districts";
import { convertImageToWebP } from "@/lib/webpConverter";

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  featuredImage?: string;
  category?: { name: string; slug?: string; color?: string; subCategory?: string };
  categories?: string[];
  subCategory?: string;
  author?: { name: string };
  status: string;
  views?: number;
  readTime?: string;
  publishedAt?: string;
  isPinned?: boolean;
  isHero?: boolean;
  isSuperfast?: boolean;
  language?: "EN" | "HI";
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
  videoUrl?: string;
  state?: string;
  district?: string;
  isTrending?: boolean;
}

const LOCAL_STORAGE_KEY = "ga_custom_articles";

const SUB_CATEGORIES_MAP: Record<string, { en: string; hi: string }[]> = {
  "Top News": [
    { en: "Lead Headlines", hi: "मुख्य समाचार" },
    { en: "Live Updates", hi: "लाइव समाचार" },
    { en: "Editor's Pick", hi: "संपादकीय चयन" }
  ],
  "Education": [
    { en: "Education News", hi: "शिक्षा समाचार" },
    { en: "Board Exams (10th/12th)", hi: "बोर्ड परीक्षा (10वीं/12वीं)" },
    { en: "Competitive Exams (UPSC/JEE/NEET)", hi: "प्रतियोगी परीक्षाएं" },
    { en: "College & Admissions", hi: "कॉलेज और प्रवेश" },
    { en: "Career Guidance", hi: "करियर मार्गदर्शन" }
  ],
  "World": [
    { en: "International Affairs", hi: "अंतरराष्ट्रीय मामले" },
    { en: "World Politics", hi: "वैश्विक राजनीति" },
    { en: "Defence & Security", hi: "रक्षा व सुरक्षा" },
    { en: "Diplomacy", hi: "कूटनीति व संबंध" },
    { en: "Global Economy", hi: "ग्लोबल अर्थव्यवस्था" }
  ],
  "India": [
    { en: "National News", hi: "राष्ट्रीय समाचार" },
    { en: "State Spotlight", hi: "राज्य मुख्य समाचार" },
    { en: "Governance & Society", hi: "शासन व समाज" }
  ],
  "Business": [
    { en: "Stock Markets", hi: "शेयर बाज़ार" },
    { en: "Companies & Startups", hi: "कंपनियां व स्टार्ट-अप" },
    { en: "Personal Finance & Tax", hi: "पर्सनल फाइनेंस" },
    { en: "Economy", hi: "अर्थव्यवस्था" },
    { en: "Crypto & Banking", hi: "क्रिप्टो व बैंकिंग" }
  ],
  "Technology": [
    { en: "AI & Machine Learning", hi: "एआई और मशीन लर्निंग" },
    { en: "Smartphones & Gadgets", hi: "स्मार्टफोन और गैजेट्स" },
    { en: "Cloud & Software", hi: "सॉफ्टवेयर और ऐप्स" },
    { en: "Space Tech", hi: "अंतरिक्ष तकनीक" },
    { en: "Cybersecurity", hi: "साइबर सुरक्षा" }
  ],
  "Sports": [
    { en: "Cricket", hi: "क्रिकेट" },
    { en: "Football", hi: "फुटबॉल" },
    { en: "Formula 1", hi: "फॉर्मूला 1" },
    { en: "Olympics & Athletics", hi: "ओलंपिक व अन्य खेल" }
  ],
  "Entertainment": [
    { en: "Cinema & Movies", hi: "सिनेमा और फिल्में" },
    { en: "OTT & Web Series", hi: "ओटीटी और वेब सीरीज" },
    { en: "Music & Songs", hi: "म्यूजिक और गाने" },
    { en: "Celebrity Gossips", hi: "सेलेब्रिटी अपडेट्स" }
  ],
  "Science": [
    { en: "Space Exploration", hi: "अंतरिक्ष अनुसंधान" },
    { en: "Innovations & Discoveries", hi: "नवाचार व खोजें" },
    { en: "Environment & Climate", hi: "पर्यावरण व जलवायु" }
  ],
  "Health": [
    { en: "Fitness & Yoga", hi: "फिटनेस और योग" },
    { en: "Nutrition & Diet", hi: "आहार और पोषण" },
    { en: "Medical Breakthroughs", hi: "चिकित्सा शोध" }
  ],
  "Opinion": [
    { en: "Daily Editorials", hi: "दैनिक संपादकीय" },
    { en: "Expert Columns", hi: "विशेषज्ञ दृष्टिकोण" },
    { en: "Special Reports", hi: "विशेष विश्लेषणात्मक रिपोर्ट" }
  ],
  "Videos": [
    { en: "Trending Video Clips", hi: "ट्रेंडिंग वीडियो" },
    { en: "Ground Reports", hi: "ग्राउंड रिपोर्ट" },
    { en: "Documentaries", hi: "वृत्तचित्र" }
  ]
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [languageFilter, setLanguageFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Education");
  const [formCategories, setFormCategories] = useState<string[]>(["Top News", "Education"]);
  const [formSubCategory, setFormSubCategory] = useState("General");
  const [formState, setFormState] = useState("Jharkhand");
  const [formDistrict, setFormDistrict] = useState("Ranchi");
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [formAuthor, setFormAuthor] = useState("Global Admin");
  const [formStatus, setFormStatus] = useState("PUBLISHED");
  const [formLanguage, setFormLanguage] = useState<"EN" | "HI">("HI");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [formIsHero, setFormIsHero] = useState(false);
  const [formIsSuperfast, setFormIsSuperfast] = useState(false);
  const [formImageHeight, setFormImageHeight] = useState("auto");
  const [formCustomHeight, setFormCustomHeight] = useState("");
  const [formImageFit, setFormImageFit] = useState<"cover" | "contain" | "fill">("cover");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const getStoredArticles = (): AdminArticle[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveToLocalStorage = (list: AdminArticle[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event("ga_articles_updated"));
      window.dispatchEvent(new Event("ga_epaper_updated"));
    } catch (e) {
      console.error(e);
    }
  };

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
        console.warn("Backend fetch failed, using stored local articles:", err);
      }

      const custom = getStoredArticles();
      const customIds = new Set(custom.map((c) => c.id));
      const backendFiltered = combined.filter((b) => !customIds.has(b.id));
      const finalArticles = [...custom, ...backendFiltered];

      setArticles(finalArticles);
      setLoading(false);
    }

    loadInitialArticles();
  }, []);

  const handleOpenModal = (art?: AdminArticle) => {
    if (art) {
      setEditingArticle(art);
      setFormTitle(art.title);
      setFormCategory(art.category?.name || "Education");
      const initialCats = art.categories && art.categories.length > 0 ? art.categories : [art.category?.name || "Education"];
      setFormCategories(initialCats);
      setFormSubCategory(art.subCategory || art.category?.subCategory || "General");
      setFormState(art.state || "Jharkhand");
      setFormAuthor(art.author?.name || "Global Admin");
      setFormStatus(art.status);
      setFormLanguage(art.language || "HI");
      setFormSummary(art.summary || "");
      setFormContent(art.body || "");
      setFormImage(art.featuredImage || "");
      setImageFileName(art.featuredImage ? "Uploaded Image" : "");
      setFormState(art.state || "Jharkhand");
      setFormDistrict(art.district || "Ranchi");
      setFormIsHero(art.isHero || false);
      setFormIsSuperfast(art.isSuperfast || false);
      setFormIsTrending(art.isTrending || false);

      const h = art.imageHeight || "auto";
      if (["auto", "250px", "350px", "450px", "550px"].includes(h)) {
        setFormImageHeight(h);
        setFormCustomHeight("");
      } else {
        setFormImageHeight("custom");
        setFormCustomHeight(h);
      }
      setFormImageFit(art.imageFit || "cover");
      setFormVideoUrl(art.videoUrl || "");
    } else {
      setEditingArticle(null);
      setFormTitle("");
      setFormCategory("Education");
      setFormCategories(["Top News", "Education"]);
      setFormSubCategory("General");
      setFormState("Jharkhand");
      setFormAuthor("Global Admin");
      setFormStatus("PUBLISHED");
      setFormLanguage("HI");
      setFormSummary("");
      setFormContent("");
      setFormImage("");
      setImageFileName("");
      setFormState("Jharkhand");
      setFormDistrict("Ranchi");
      setFormIsHero(false);
      setFormIsSuperfast(false);
      setFormIsTrending(false);
      setFormImageHeight("auto");
      setFormCustomHeight("");
      setFormImageFit("cover");
      setFormVideoUrl("");
    }
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setIsUploadingImage(true);
    showToast("⏳ Converting photo to ultra-optimized WebP format...");

    // Auto-convert any image type (JPG, PNG, GIF, BMP) to WebP format
    const file = await convertImageToWebP(rawFile);
    setImageFileName(file.name);

    // Show local WebP preview immediately while uploading
    const reader = new FileReader();
    reader.onloadend = () => setFormImage(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/v1/media/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();

      if (json?.success && json?.data?.url) {
        // Replace preview with saved local WebP URL
        setFormImage(json.data.url);
        setImageFileName(file.name + " (WebP Format ✓)");
        showToast("✅ Image converted to WebP & saved to /public/uploads/!");
      } else {
        showToast("⚠️ Upload failed: " + (json?.message || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Local upload error:", err);
      showToast("⚠️ Upload failed — image saved as local preview only.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("Title is required!");
      return;
    }

    const slug = formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const finalHeight = formImageHeight === "custom" ? (formCustomHeight ? (formCustomHeight.endsWith("px") ? formCustomHeight : `${formCustomHeight}px`) : "auto") : formImageHeight;

    const activeCat = formCategories.length > 0 ? formCategories[0] : formCategory;
    const newArt: AdminArticle = {
      id: editingArticle ? editingArticle.id : `art_${Date.now()}`,
      title: formTitle,
      slug: editingArticle ? editingArticle.slug : slug,
      summary: formSummary,
      body: formContent,
      featuredImage: formImage || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60",
      category: { name: activeCat, slug: activeCat.toLowerCase(), color: getCategoryColor(activeCat), subCategory: formSubCategory },
      categories: formCategories.length > 0 ? formCategories : [activeCat],
      subCategory: formSubCategory,
      author: { name: formAuthor },
      status: formStatus,
      views: editingArticle ? editingArticle.views : 100,
      readTime: "3 min read",
      publishedAt: editingArticle ? editingArticle.publishedAt : new Date().toISOString(),
      isHero: formIsHero,
      isSuperfast: formIsSuperfast,
      isTrending: formIsTrending,
      language: formLanguage,
      imageHeight: finalHeight,
      imageFit: formImageFit,
      videoUrl: formVideoUrl,
      state: formState,
      district: formDistrict || "Jharkhand"
    };

    let updatedList: AdminArticle[];
    if (editingArticle) {
      updatedList = articles.map((a) => (a.id === newArt.id ? newArt : (formIsHero ? { ...a, isHero: false } : a)));
    } else {
      const previousList = formIsHero ? articles.map((a) => ({ ...a, isHero: false })) : articles;
      updatedList = [newArt, ...previousList];
    }

    // 1. Instantly update UI & localStorage (fast, offline-friendly cache)
    setArticles(updatedList);
    saveToLocalStorage(updatedList);
    setIsModalOpen(false);
    showToast(
      formIsHero
        ? `Article "${formTitle}" set as Main Hero Banner (Previous Hero unassigned)!`
        : editingArticle
        ? `Article "${formTitle}" updated!`
        : `Article "${formTitle}" published!`
    );

    // 2. Persist to real database so it survives page refresh
    try {
      const res = await fetch(API_ENDPOINTS.articles, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newArt,
          slug: newArt.slug,
          status: newArt.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
        }),
      });
      const json = await res.json();
      if (json?.success && json?.data) {
        // Update the local article with the real DB id/slug
        const dbArt = { ...newArt, id: json.data.id || newArt.id, slug: json.data.slug || newArt.slug };
        const synced = updatedList.map((a) => (a.id === newArt.id ? dbArt : a));
        setArticles(synced);
        saveToLocalStorage(synced);
      }
    } catch (err) {
      console.warn("DB save failed – article is kept in localStorage only:", err);
      showToast(`"${formTitle}" saved locally (DB unreachable).`);
    }
  };

  const handleDeleteArticle = async (id: string, slug: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const updatedList = articles.filter((a) => a.id !== id && a.slug !== slug);
      setArticles(updatedList);
      saveToLocalStorage(updatedList);
      showToast(`Article "${title}" deleted.`);

      // Also delete from the real database
      try {
        await fetch(`${API_ENDPOINTS.articles}/${slug}`, { method: "DELETE" });
      } catch (err) {
        console.warn("DB delete failed – removed from localStorage only:", err);
      }
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "business": return "#3b82f6";
      case "technology": return "#8b5cf6";
      case "sports": return "#00875a";
      case "india": return "#f59e0b";
      case "education": return "#06b6d4";
      case "entertainment": return "#ec4899";
      case "science": return "#10b981";
      case "health": return "#ef4444";
      case "opinion": return "#6366f1";
      default: return "#e50914";
    }
  };

  const filteredArticles = articles.filter((art) => {
    const matchesSearch = art.title ? art.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesStatus = statusFilter === "ALL" || art.status === statusFilter;
    const matchesLang = languageFilter === "ALL" || (languageFilter === "HI" ? art.language === "HI" : art.language !== "HI");
    const matchesDate = !dateFilter || (art.publishedAt ? art.publishedAt.slice(0, 10) === dateFilter : false);
    return matchesSearch && matchesStatus && matchesLang && matchesDate;
  });

  const handleToggleHero = (artId: string) => {
    const updatedList = articles.map((a) => ({
      ...a,
      isHero: a.id === artId ? !a.isHero : false,
      ...(a.id === artId && !a.isHero ? { imageFit: "cover" as const } : {})
    }));
    setArticles(updatedList);
    saveToLocalStorage(updatedList);
    const target = updatedList.find((a) => a.id === artId);
    showToast(target?.isHero ? `🌟 Set "${target.title}" as Main Hero Banner!` : `Hero status removed from "${target?.title}".`);
  };

  const handleToggleSuperfast = (artId: string) => {
    const updatedList = articles.map((a) => (
      a.id === artId ? { ...a, isSuperfast: !a.isSuperfast } : a
    ));
    setArticles(updatedList);
    saveToLocalStorage(updatedList);
    const target = updatedList.find((a) => a.id === artId);
    showToast(target?.isSuperfast ? `⚡ Set "${target?.title}" in ⚡ सुपरफ़ास्ट NEWS section!` : `Removed "${target?.title}" from Superfast News.`);
  };

  const handleToggleTrending = (artId: string) => {
    const updatedList = articles.map((a) => (
      a.id === artId ? { ...a, isTrending: !a.isTrending } : a
    ));
    setArticles(updatedList);
    saveToLocalStorage(updatedList);
    const target = updatedList.find((a) => a.id === artId);
    showToast(target?.isTrending ? `🔥 Marked "${target?.title}" as Trending / Hot Topic!` : `Unmarked "${target?.title}" from Trending.`);
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "#0a0a0a", color: "#ffffff", border: "2px solid #e50914", padding: "14px 20px", borderRadius: "10px", boxShadow: "0 10px 30px rgba(229,9,20,0.2)", zIndex: 9999, fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle size={18} style={{ color: "#00875a" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
            Editorial Articles Queue ({articles.length})
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
            Create, publish, edit, or remove articles across English & Hindi portals.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "11px 22px", borderRadius: "10px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(229,9,20,0.3)" }}
        >
          <Plus size={18} /> Compose New News
        </button>
      </div>

      {/* Live Articles Table */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
            Live Queue ({filteredArticles.length})
          </h3>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-secondary)" }} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "8px 12px 8px 36px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.85rem" }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.85rem" }}
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                type="date"
                title="Filter news date wise"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.85rem", background: "var(--color-bg, #ffffff)", color: "var(--color-text, #0f172a)" }}
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 10px", borderRadius: "8px", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer" }}
                  title="Clear date filter"
                >
                  ✕ Clear Date
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-secondary)" }}>
            Loading editorial queue...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-secondary)" }}>
            No articles match your criteria.
          </div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff" }}>
            <table className="admin-data-table" style={{ minWidth: "980px", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ width: "30%", textAlign: "left" }}>Article Title</th>
                  <th style={{ width: "10%", textAlign: "left" }}>Category</th>
                  <th style={{ width: "10%", textAlign: "left" }}>State</th>
                  <th style={{ width: "10%", textAlign: "left" }}>Status</th>
                  <th style={{ width: "40%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((art) => (
                  <tr key={art.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {art.featuredImage && (
                          <img src={getArticleImage(art)} alt="" style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: "1px solid #e2e8f0" }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", lineHeight: "1.3" }}>
                            {art.title}
                            {art.isHero && <span style={{ background: "#e50914", color: "#fff", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>HERO</span>}
                            {art.isSuperfast && <span style={{ background: "#dc2626", color: "#fff", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>⚡ SUPERFAST</span>}
                            {art.isTrending && <span style={{ background: "#ea580c", color: "#fff", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>🔥 TRENDING</span>}
                          </div>
                          <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600 }}>
                            by {art.author?.name || "Global Admin"} • 📅 {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Today"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {(art.categories && art.categories.length > 0 ? art.categories : [art.category?.name || "General"]).map((c) => (
                          <span key={c} className="category-tag-pill" style={{ background: getCategoryColor(c), color: "#ffffff", border: "none", fontSize: "0.72rem", padding: "2px 8px" }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "3px 10px", borderRadius: "6px", fontSize: "0.74rem", fontWeight: 700, display: "inline-flex", flexDirection: "column", gap: "2px" }}>
                        <span>{art.state || "National"}</span>
                        {art.district && <span style={{ color: "#2563eb", fontWeight: 800 }}>📍 {art.district}</span>}
                      </span>
                    </td>
                    <td>
                      <span className={art.status === "PUBLISHED" ? "status-published-pill" : "category-tag-pill"}>
                        ● {art.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", justifyContent: "flex-end", flexWrap: "nowrap" }}>
                        {/* Prominent Edit & Delete Buttons First */}
                        <button
                          onClick={() => handleOpenModal(art)}
                          title="Edit Article"
                          style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "6px 12px", borderRadius: "6px", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id, art.slug, art.title)}
                          title="Delete Article"
                          style={{ background: "#dc2626", color: "#ffffff", border: "1px solid #b91c1c", padding: "6px 12px", borderRadius: "6px", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 6px rgba(220,38,38,0.25)" }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>

                        {/* Feature Toggles */}
                        <button
                          onClick={() => handleToggleHero(art.id)}
                          title={art.isHero ? "Click to unmark as Hero Banner" : "Set as Main Hero Banner (Top Lead Story)"}
                          style={{
                            background: art.isHero ? "#e50914" : "#fff1f2",
                            color: art.isHero ? "#ffffff" : "#e50914",
                            border: `1px solid ${art.isHero ? "#e50914" : "#fca5a5"}`,
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "0.76rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <Sparkles size={13} /> {art.isHero ? "Hero ★" : "Set Hero"}
                        </button>
                        <button
                          onClick={() => handleToggleSuperfast(art.id)}
                          title={art.isSuperfast ? "Click to remove from Superfast News section" : "Add to ⚡ सुपरफ़ास्ट NEWS section"}
                          style={{
                            background: art.isSuperfast ? "#dc2626" : "#fef2f2",
                            color: art.isSuperfast ? "#ffffff" : "#dc2626",
                            border: `1px solid ${art.isSuperfast ? "#dc2626" : "#fca5a5"}`,
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "0.76rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <Zap size={13} /> {art.isSuperfast ? "Superfast ⚡" : "+ Superfast"}
                        </button>
                        <button
                          onClick={() => handleToggleTrending(art.id)}
                          title={art.isTrending ? "Click to remove from Trending / Hot Topics" : "Mark as 🔥 Trending / Hot Topic"}
                          style={{
                            background: art.isTrending ? "#ea580c" : "#fff7ed",
                            color: art.isTrending ? "#ffffff" : "#ea580c",
                            border: `1px solid ${art.isTrending ? "#ea580c" : "#ffedd5"}`,
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "0.76rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          🔥 {art.isTrending ? "Trending" : "+ Trending"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Article Creation Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "960px", maxHeight: "90vh", overflowY: "auto", padding: "36px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 20px 0", color: "#0f172a" }}>
              {editingArticle ? "Edit Article Details" : "Compose & Publish New Article"}
            </h3>

            <form onSubmit={handleSaveArticle} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Article Headline *</label>
                <input
                  type="text"
                  placeholder="Enter high-impact headline..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", fontWeight: 600 }}
                  required
                />
              </div>

              {/* MULTI-TAB / MULTI-CATEGORY PUBLISHING SELECTOR */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ fontSize: "0.86rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>📌</span> Publish Article in Multiple Categories / Nav Tabs ({formCategories.length} Selected)
                  </label>
                  <span style={{ fontSize: "0.74rem", color: "#e50914", fontWeight: 700 }}>Click tabs to toggle placement</span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {["Top News", "Education", "World", "India", "Business", "Technology", "Sports", "Entertainment", "Science", "Health", "Opinion", "Videos"].map((catName) => {
                    const isSelected = formCategories.includes(catName);
                    return (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (formCategories.length > 1) {
                              setFormCategories(formCategories.filter((c) => c !== catName));
                            }
                          } else {
                            setFormCategories([...formCategories, catName]);
                            setFormCategory(catName);
                          }
                        }}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "0.82rem",
                          fontWeight: isSelected ? 800 : 600,
                          border: isSelected ? "2px solid #e50914" : "1px solid #cbd5e1",
                          background: isSelected ? "#e50914" : "#ffffff",
                          color: isSelected ? "#ffffff" : "#334155",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.15s ease",
                          boxShadow: isSelected ? "0 2px 8px rgba(229,9,20,0.25)" : "none"
                        }}
                      >
                        {isSelected ? <span>✓</span> : <Plus size={12} />}
                        <span>{catName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HERO BANNER PLACEMENT CARD */}
              <div
                onClick={() => setFormIsHero(!formIsHero)}
                style={{
                  background: formIsHero ? "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)" : "#f8fafc",
                  border: `2px solid ${formIsHero ? "#e50914" : "#cbd5e1"}`,
                  borderRadius: "12px",
                  padding: "14px 18px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={formIsHero}
                    onChange={(e) => setFormIsHero(e.target.checked)}
                    style={{ width: "20px", height: "20px", accentColor: "#e50914", cursor: "pointer" }}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles size={16} style={{ color: "#e50914" }} />
                      <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>
                        🌟 Set as Main Hero Banner (Top Lead Story)
                      </span>
                    </div>
                    <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                      Check this box to display this article as the primary Hero Card with giant banner image on Home Page & Category headers.
                    </p>
                  </div>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: formCategory.toLowerCase() === "india" ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr", gap: "12px", transition: "all 0.2s ease" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Primary Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFormCategory(newCat);
                      if (!formCategories.includes(newCat)) {
                        setFormCategories([newCat, ...formCategories]);
                      }
                      const subs = SUB_CATEGORIES_MAP[newCat];
                      if (subs && subs.length > 0) setFormSubCategory(subs[0].en);
                      else setFormSubCategory("General");
                    }}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", background: "#ffffff", color: "#0f172a" }}
                  >
                    {["Top News", "Education", "World", "India", "Business", "Technology", "Sports", "Entertainment", "Science", "Health", "Opinion", "Videos"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Sub-Category / Topic</label>
                  <select
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", background: "#ffffff", color: "#0f172a" }}
                  >
                    <option value="General">General / All Topics</option>
                    {(SUB_CATEGORIES_MAP[formCategory] || []).map((sub) => (
                      <option key={sub.en} value={sub.en}>
                        {sub.en} ({sub.hi})
                      </option>
                    ))}
                  </select>
                </div>

                {formCategory.toLowerCase() === "india" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Target State (Optional)</label>
                    <select
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", background: "#ffffff", color: "#0f172a" }}
                    >
                      <option value="National">All India (National)</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st.slug} value={st.nameEn}>
                          {st.nameEn} ({st.nameHi})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Language Portal</label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value as "EN" | "HI")}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", background: "#ffffff", color: "#0f172a" }}
                  >
                    <option value="HI">Hindi (हिंदी) Portal</option>
                    <option value="EN">English Portal</option>
                  </select>
                </div>
              </div>

              {/* Section Placement Controls */}
              <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "14px", marginTop: "10px" }}>
                <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>
                  📌 Special Homepage Section Assignments / प्लेसमेंट
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.84rem", color: "#0f172a" }}>
                    <input
                      type="checkbox"
                      checked={formIsHero}
                      onChange={(e) => setFormIsHero(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#e50914" }}
                    />
                    <span>🌟 Main Spotlight Lead Story (Hero Banner)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.84rem", color: "#dc2626" }}>
                    <input
                      type="checkbox"
                      checked={formIsSuperfast}
                      onChange={(e) => setFormIsSuperfast(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#dc2626" }}
                    />
                    <span>⚡ Superfast News (सुपरफ़ास्ट NEWS Section)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.84rem", color: "#ea580c" }}>
                    <input
                      type="checkbox"
                      checked={formIsTrending}
                      onChange={(e) => setFormIsTrending(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#ea580c" }}
                    />
                    <span>🔥 Trending / Hot Topic (ट्रेंडिंग ख़बर)</span>
                  </label>
                </div>
              </div>

              {/* State & City / District Selection */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>State / राज्य</label>
                  <select
                    value={formState}
                    onChange={(e) => {
                      const newSt = e.target.value;
                      setFormState(newSt);
                      const stObj = INDIAN_STATES.find((s) => s.nameEn === newSt);
                      const dists = getDistrictsForState(stObj?.code || "");
                      if (dists.length > 0) setFormDistrict(dists[0].nameEn);
                    }}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", background: "#ffffff", color: "#0f172a" }}
                  >
                    <option value="National">National / All India</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st.slug} value={st.nameEn}>
                        {st.nameEn} ({st.nameHi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>City / District / शहर / ज़िला</label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", background: "#ffffff", color: "#0f172a" }}
                  >
                    {getDistrictsForState(INDIAN_STATES.find((s) => s.nameEn === formState)?.code || "").map((d) => (
                      <option key={d.id} value={d.nameEn}>
                        📍 {d.nameEn} ({d.nameHi})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                  Upload Featured Cover Image *
                </label>

                {/* Primary Computer File Upload Dropzone */}
                <div style={{ border: "2px dashed #cbd5e1", borderRadius: "14px", padding: "20px", textAlign: "center", background: "#f8fafc", transition: "all 0.2s ease" }}>
                  {formImage ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ width: "96px", height: "64px", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1", background: "#000", flexShrink: 0 }}>
                          <img src={formImage} alt="Cover Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <span style={{ fontSize: "0.86rem", fontWeight: 800, color: "#0f172a", display: "block" }}>
                            {imageFileName || "Uploaded Article Image"}
                          </span>
                          <span style={{ fontSize: "0.76rem", color: isUploadingImage ? "#ea580c" : "#16a34a", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            {isUploadingImage ? (
                              <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #ea580c", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Uploading to Cloudinary…</>
                            ) : (
                              <><CheckCircle size={14} /> Uploaded to Cloudinary ✓</>
                            )}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <label style={{ background: "#0f172a", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Upload size={14} /> Choose Different File
                          <input type="file" accept="image/*" onChange={handleImageFileUpload} style={{ display: "none" }} />
                        </label>
                        <button
                          type="button"
                          onClick={() => { setFormImage(""); setImageFileName(""); }}
                          style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon2 size={36} style={{ color: "#e50914", marginBottom: "8px" }} />
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                        Upload Cover Image from Computer
                      </h4>
                      <p style={{ margin: "0 0 14px 0", fontSize: "0.78rem", color: "#64748b" }}>
                        Supports JPG, PNG, WebP, SVG high-resolution photo graphics
                      </p>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#e50914", color: "#ffffff", padding: "10px 22px", borderRadius: "8px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(229,9,20,0.25)" }}>
                        <Upload size={16} /> Choose Image File from Computer
                        <input type="file" accept="image/*" onChange={handleImageFileUpload} style={{ display: "none" }} />
                      </label>
                    </div>
                  )}
                </div>

                {/* Optional URL Toggle / Link */}
                <div style={{ marginTop: "8px", textAlign: "right" }}>
                  {!showUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(true)}
                      style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                    >
                      Or paste an Image CDN URL instead
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={formImage.startsWith("data:") ? "" : formImage}
                        onChange={(e) => { setFormImage(e.target.value); setImageFileName("URL Image"); }}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(false)}
                        style={{ background: "#f1f5f9", border: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700 }}
                      >
                        Hide URL Input
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Summary Teaser</label>
                <textarea
                  rows={2}
                  placeholder="Brief synopsis for card previews..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Article Body Content</label>
                <RichTextEditor value={formContent} onChange={setFormContent} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  style={{ background: isUploadingImage ? "#94a3b8" : "#e50914", color: "#ffffff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 800, cursor: isUploadingImage ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  {isUploadingImage ? (
                    <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Uploading Image…</>
                  ) : (
                    editingArticle ? "Update Article" : "Publish Article"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
