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
  Image as ImageIcon2
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";
import { INDIAN_STATES } from "@/lib/states";

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
  state?: string;
}

const LOCAL_STORAGE_KEY = "ga_custom_articles";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [languageFilter, setLanguageFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("World");
  const [formState, setFormState] = useState("Jharkhand");
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
  const [showUrlInput, setShowUrlInput] = useState(false);

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
      setFormCategory(art.category?.name || "World");
      setFormState(art.state || "Jharkhand");
      setFormAuthor(art.author?.name || "Global Admin");
      setFormStatus(art.status);
      setFormLanguage(art.language || "EN");
      setFormSummary(art.summary || "");
      setFormContent(art.body || "");
      setFormImage(art.featuredImage || "");
      setImageFileName(art.featuredImage ? "Uploaded Image" : "");
      setFormIsHero(art.isHero || false);

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
      setFormCategory("World");
      setFormState("Jharkhand");
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
    }
    setIsModalOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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

    const newArt: AdminArticle = {
      id: editingArticle ? editingArticle.id : `art_${Date.now()}`,
      title: formTitle,
      slug: editingArticle ? editingArticle.slug : slug,
      summary: formSummary,
      body: formContent,
      featuredImage: formImage || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60",
      category: { name: formCategory, slug: formCategory.toLowerCase(), color: getCategoryColor(formCategory) },
      author: { name: formAuthor },
      status: formStatus,
      views: editingArticle ? editingArticle.views : 100,
      readTime: "3 min read",
      publishedAt: editingArticle ? editingArticle.publishedAt : new Date().toISOString(),
      isHero: formIsHero,
      language: formLanguage,
      imageHeight: finalHeight,
      imageFit: formImageFit,
      videoUrl: formVideoUrl,
      state: formCategory.toLowerCase() === "india" ? (formState || "National") : "National"
    };

    let updatedList: AdminArticle[];
    if (editingArticle) {
      updatedList = articles.map((a) => (a.id === newArt.id ? newArt : a));
      showToast(`Article "${formTitle}" updated successfully!`);
    } else {
      updatedList = [newArt, ...articles];
      showToast(`New Article "${formTitle}" published successfully!`);
    }

    setArticles(updatedList);
    saveToLocalStorage(updatedList);
    setIsModalOpen(false);
  };

  const handleDeleteArticle = async (id: string, slug: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const updatedList = articles.filter((a) => a.id !== id && a.slug !== slug);
      setArticles(updatedList);
      saveToLocalStorage(updatedList);
      showToast(`Article "${title}" deleted from database.`);
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
    return matchesSearch && matchesStatus && matchesLang;
  });

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
          <Plus size={18} /> Compose New Article
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
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: "42%", textAlign: "left" }}>Article Title</th>
                <th style={{ width: "14%", textAlign: "left" }}>Category</th>
                <th style={{ width: "14%", textAlign: "left" }}>State</th>
                <th style={{ width: "14%", textAlign: "left" }}>Status</th>
                <th style={{ width: "16%", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((art) => (
                <tr key={art.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {art.featuredImage && (
                        <img src={art.featuredImage} alt="" style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: "1px solid #e2e8f0" }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "6px", lineHeight: "1.3" }}>
                          {art.title}
                          {art.isHero && <span style={{ background: "#e50914", color: "#fff", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>HERO</span>}
                        </div>
                        <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600 }}>by {art.author?.name || "Global Admin"}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag-pill" style={{ background: getCategoryColor(art.category?.name || "World"), color: "#ffffff", border: "none" }}>
                      {art.category?.name || "General"}
                    </span>
                  </td>
                  <td>
                    <span style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "3px 10px", borderRadius: "6px", fontSize: "0.74rem", fontWeight: 700 }}>
                      {art.state || "National"}
                    </span>
                  </td>
                  <td>
                    <span className={art.status === "PUBLISHED" ? "status-published-pill" : "category-tag-pill"}>
                      ● {art.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleOpenModal(art)}
                        title="Edit Article"
                        style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "5px 10px", borderRadius: "6px", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Edit size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(art.id, art.slug, art.title)}
                        title="Delete Article"
                        style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", padding: "5px 10px", borderRadius: "6px", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

              <div style={{ display: "grid", gridTemplateColumns: formCategory.toLowerCase() === "india" ? "1fr 1fr 1fr" : "1fr 1fr", gap: "14px", transition: "all 0.2s ease" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", background: "#ffffff", color: "#0f172a" }}
                  >
                    {["Top News", "India", "World", "Business", "Sports", "Technology", "Entertainment", "Health", "Science", "Education", "Opinion"].map((c) => (
                      <option key={c} value={c}>{c}</option>
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
                    <option value="EN">English Portal</option>
                    <option value="HI">Hindi (हिंदी) Portal</option>
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
                          <span style={{ fontSize: "0.76rem", color: "#16a34a", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <CheckCircle size={14} /> Image Loaded & Ready to Publish
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
                  style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 800, cursor: "pointer" }}
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
