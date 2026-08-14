"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Search,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Share2,
  Code,
  Save,
  RotateCcw,
  Upload,
  Download,
  ExternalLink,
  Layers,
  FileText,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";

import {
  SeoPageConfig,
  getAllSeoConfigs,
  saveSeoConfigs,
  calculateSeoScore,
  DEFAULT_SEO_PAGES
} from "@/lib/seo";

export default function AdminSeoPage() {
  const [configs, setConfigs] = useState<SeoPageConfig[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>("/");
  const [toastMessage, setToastMessage] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<"serp" | "social" | "schema">("serp");

  useEffect(() => {
    getAllSeoConfigs().then((res) => {
      if (Array.isArray(res)) setConfigs(res);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const activeConfig = configs.find((c) => c.path === selectedPath) || configs[0] || DEFAULT_SEO_PAGES[0];

  const updateActiveConfig = (updates: Partial<SeoPageConfig>) => {
    setConfigs((prev) =>
      prev.map((c) => (c.path === selectedPath ? { ...c, ...updates } : c))
    );
  };

  const handleSave = () => {
    saveSeoConfigs(configs);
    showToast("✅ SEO Configuration saved & activated live across all pages!");
  };

  const handleResetCurrent = () => {
    const defaultPage = DEFAULT_SEO_PAGES.find((p) => p.path === selectedPath);
    if (defaultPage) {
      updateActiveConfig(defaultPage);
      showToast(`Reset "${defaultPage.pageName}" to recommended SEO defaults.`);
    }
  };

  const handleResetAll = () => {
    if (confirm("Are you sure you want to reset ALL pages to factory SEO defaults?")) {
      setConfigs(DEFAULT_SEO_PAGES);
      saveSeoConfigs(DEFAULT_SEO_PAGES);
      showToast("Reset all pages to standard SEO defaults.");
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      updateActiveConfig({ ogImage: reader.result as string });
    };
    reader.readAsDataURL(file);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/v1/media/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json?.success && json?.data?.url) {
        updateActiveConfig({ ogImage: json.data.url });
        showToast("✅ Social preview image uploaded successfully!");
      }
    } catch (err) {
      console.warn("Image upload fallback:", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const { score, label, tips } = calculateSeoScore(activeConfig);

  const getScoreColor = (s: number) => {
    if (s >= 90) return "#00875a";
    if (s >= 75) return "#2563eb";
    if (s >= 50) return "#d97706";
    return "#dc2626";
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "main" | "subtab">("all");

  const filteredConfigs = configs.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || c.pageName.toLowerCase().includes(q) || c.path.toLowerCase().includes(q) || c.metaTitle.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (filterCategory === "main") return !c.isSubTab;
    if (filterCategory === "subtab") return c.isSubTab;
    return true;
  });

  return (
    <div style={{ paddingBottom: "60px" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#0f172a",
            color: "#ffffff",
            border: "2px solid #e50914",
            padding: "14px 22px",
            borderRadius: "12px",
            boxShadow: "0 12px 35px rgba(0,0,0,0.3)",
            zIndex: 99999,
            fontWeight: 700,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <CheckCircle size={20} style={{ color: "#00875a" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Senior Dev Header Suite Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "20px",
          padding: "28px 32px",
          color: "#ffffff",
          marginBottom: "28px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ background: "#e50914", color: "#ffffff", padding: "3px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              SENIOR DEV SUITE
            </span>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 900, margin: 0, color: "#ffffff" }}>
              Enterprise Page & Sub-Tab SEO Management
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#94a3b8", maxWidth: "650px", lineHeight: "1.5" }}>
            Customize Meta Titles, Descriptions, Open Graph Cards, Canonical URLs, and Schemas across every Main Page and <strong>Sub-Tab Navigation Item</strong> (e.g. Board Exams, Cricket, Stock Markets, AI).
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={handleResetCurrent}
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "#cbd5e1",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <RotateCcw size={16} /> Reset Current
          </button>
          <button
            onClick={handleSave}
            style={{
              background: "#e50914",
              color: "#ffffff",
              border: "none",
              padding: "10px 22px",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "0.88rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 16px rgba(229,9,20,0.4)"
            }}
          >
            <Save size={18} /> Save & Activate Live
          </button>
        </div>
      </div>

      {/* Main Grid: Left Sidebar Page Selector + Right Editor Suite */}
      <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: "24px" }}>
        {/* LEFT COLUMN: Page Selector Sidebar */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "18px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
            height: "fit-content"
          }}
        >
          <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={16} style={{ color: "#e50914" }} />
            <span>Select Page / Sub-Tab</span>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sub-tabs (e.g. Board Exams)..."
              style={{
                width: "100%",
                padding: "7px 10px 7px 30px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.78rem",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Filter Category Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px", marginBottom: "12px", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
            <button
              onClick={() => setFilterCategory("all")}
              style={{
                border: "none",
                borderRadius: "6px",
                padding: "5px 0",
                fontSize: "0.72rem",
                fontWeight: filterCategory === "all" ? 800 : 600,
                background: filterCategory === "all" ? "#ffffff" : "transparent",
                color: filterCategory === "all" ? "#0f172a" : "#64748b",
                boxShadow: filterCategory === "all" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer"
              }}
            >
              All ({configs.length})
            </button>
            <button
              onClick={() => setFilterCategory("main")}
              style={{
                border: "none",
                borderRadius: "6px",
                padding: "5px 0",
                fontSize: "0.72rem",
                fontWeight: filterCategory === "main" ? 800 : 600,
                background: filterCategory === "main" ? "#ffffff" : "transparent",
                color: filterCategory === "main" ? "#0f172a" : "#64748b",
                boxShadow: filterCategory === "main" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer"
              }}
            >
              Main ({configs.filter((c) => !c.isSubTab).length})
            </button>
            <button
              onClick={() => setFilterCategory("subtab")}
              style={{
                border: "none",
                borderRadius: "6px",
                padding: "5px 0",
                fontSize: "0.72rem",
                fontWeight: filterCategory === "subtab" ? 800 : 600,
                background: filterCategory === "subtab" ? "#e50914" : "transparent",
                color: filterCategory === "subtab" ? "#ffffff" : "#64748b",
                boxShadow: filterCategory === "subtab" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer"
              }}
            >
              ⚡ Sub-Tabs ({configs.filter((c) => c.isSubTab).length})
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "540px", overflowY: "auto", paddingRight: "2px" }}>
            {filteredConfigs.map((p) => {
              const isSelected = p.path === selectedPath;
              const pScoreObj = calculateSeoScore(p);

              return (
                <button
                  key={p.path}
                  onClick={() => setSelectedPath(p.path)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: isSelected ? "2px solid #e50914" : "1px solid transparent",
                    background: isSelected ? "#fef2f2" : p.isSubTab ? "#faf5ff" : "#f8fafc",
                    color: isSelected ? "#e50914" : p.isSubTab ? "#6b21a8" : "#334155",
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, display: "flex", alignItems: "center", gap: "4px" }}>
                    {p.isSubTab && <span style={{ fontSize: "0.65rem", background: "#8b5cf6", color: "#fff", padding: "1px 5px", borderRadius: "4px", fontWeight: 800 }}>SUB</span>}
                    <span>{p.pageName}</span>
                  </span>
                  <span
                    style={{
                      background: getScoreColor(pScoreObj.score),
                      color: "#ffffff",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: "12px",
                      flexShrink: 0,
                      marginLeft: "6px"
                    }}
                  >
                    {pScoreObj.score}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SEO Editor & Live SERP Simulators */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Top Card: Live Health Score & Preview Simulator Tabs */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {/* Score Circle */}
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: getScoreColor(score),
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    boxShadow: `0 4px 14px ${getScoreColor(score)}40`
                  }}
                >
                  {score}%
                </div>

                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                    SEO Health: <span style={{ color: getScoreColor(score) }}>{label}</span>
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    Page route: <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#e50914" }}>{activeConfig.path}</code>
                  </span>
                </div>
              </div>

              {/* Preview Mode Tab Switcher */}
              <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "10px", gap: "4px" }}>
                <button
                  onClick={() => setActiveTab("serp")}
                  style={{
                    border: "none",
                    background: activeTab === "serp" ? "#ffffff" : "transparent",
                    color: activeTab === "serp" ? "#0f172a" : "#64748b",
                    fontWeight: activeTab === "serp" ? 800 : 600,
                    fontSize: "0.8rem",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: activeTab === "serp" ? "0 2px 8px rgba(0,0,0,0.06)" : "none"
                  }}
                >
                  <Search size={14} /> Google SERP
                </button>
                <button
                  onClick={() => setActiveTab("social")}
                  style={{
                    border: "none",
                    background: activeTab === "social" ? "#ffffff" : "transparent",
                    color: activeTab === "social" ? "#0f172a" : "#64748b",
                    fontWeight: activeTab === "social" ? 800 : 600,
                    fontSize: "0.8rem",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: activeTab === "social" ? "0 2px 8px rgba(0,0,0,0.06)" : "none"
                  }}
                >
                  <Share2 size={14} /> Social Share Card
                </button>
                <button
                  onClick={() => setActiveTab("schema")}
                  style={{
                    border: "none",
                    background: activeTab === "schema" ? "#ffffff" : "transparent",
                    color: activeTab === "schema" ? "#0f172a" : "#64748b",
                    fontWeight: activeTab === "schema" ? 800 : 600,
                    fontSize: "0.8rem",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: activeTab === "schema" ? "0 2px 8px rgba(0,0,0,0.06)" : "none"
                  }}
                >
                  <Code size={14} /> JSON-LD Schema
                </button>
              </div>
            </div>

            {/* PREVIEW SIMULATOR BOX */}
            {activeTab === "serp" && (
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 22px", fontFamily: "sans-serif" }}>
                <div style={{ fontSize: "0.72rem", color: "#4d5156", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <img src="https://www.google.com/favicon.ico" alt="" style={{ width: "16px", height: "16px" }} />
                  <span>globalawaaz.com {activeConfig.path}</span>
                </div>
                <h4 style={{ fontSize: "1.18rem", color: "#1a0dab", fontWeight: 400, margin: "0 0 4px 0", cursor: "pointer", lineHeight: "1.3" }}>
                  {activeConfig.metaTitle || "Page Title Sample"}
                </h4>
                <p style={{ fontSize: "0.85rem", color: "#4d5156", margin: 0, lineHeight: "1.4" }}>
                  {activeConfig.metaDescription || "Page meta description will appear here when indexed by Google search engines."}
                </p>
              </div>
            )}

            {activeTab === "social" && (
              <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "14px", overflow: "hidden", maxWidth: "520px" }}>
                {activeConfig.ogImage ? (
                  <img src={activeConfig.ogImage} alt="OG Preview" style={{ width: "100%", height: "220px", objectFit: "cover" }} />
                ) : (
                  <div style={{ height: "180px", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                    No Open Graph Cover Image Uploaded
                  </div>
                )}
                <div style={{ padding: "14px 18px", background: "#ffffff" }}>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", fontWeight: 700 }}>GLOBALAWAAZ.COM</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>{activeConfig.ogTitle || activeConfig.metaTitle}</div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>{activeConfig.ogDescription || activeConfig.metaDescription}</div>
                </div>
              </div>
            )}

            {activeTab === "schema" && (
              <pre style={{ background: "#0f172a", color: "#38bdf8", padding: "16px", borderRadius: "10px", fontSize: "0.8rem", overflowX: "auto", margin: 0 }}>
                {JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": activeConfig.jsonLdType,
                  "name": activeConfig.metaTitle,
                  "description": activeConfig.metaDescription,
                  "url": activeConfig.canonicalUrl
                }, null, 2)}
              </pre>
            )}

            {/* Audit Recommendation Tips */}
            {tips.length > 0 && (
              <div style={{ marginTop: "18px", background: "#fffbeb", border: "1px solid #fef3c7", padding: "12px 16px", borderRadius: "10px" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#b45309", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertTriangle size={15} /> Actionable SEO Recommendations:
                </div>
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.8rem", color: "#92400e" }}>
                  {tips.map((tip, idx) => (
                    <li key={idx} style={{ marginBottom: "2px" }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Form Fields: Meta Data Settings */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
          >
            <h4 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={18} style={{ color: "#e50914" }} />
              1. General Search Engine Metadata ({activeConfig.pageName})
            </h4>

            {/* Meta Title */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 800, color: "#334155" }}>Meta Title Tag *</label>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: activeConfig.metaTitle.length >= 45 && activeConfig.metaTitle.length <= 65 ? "#00875a" : "#d97706" }}>
                  {activeConfig.metaTitle.length} / 65 chars (Optimal 45–65)
                </span>
              </div>
              <input
                type="text"
                value={activeConfig.metaTitle}
                onChange={(e) => updateActiveConfig({ metaTitle: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.92rem", fontWeight: 600 }}
              />
            </div>

            {/* Meta Description */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 800, color: "#334155" }}>Meta Description Tag *</label>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: activeConfig.metaDescription.length >= 120 && activeConfig.metaDescription.length <= 165 ? "#00875a" : "#d97706" }}>
                  {activeConfig.metaDescription.length} / 165 chars (Optimal 120–165)
                </span>
              </div>
              <textarea
                rows={3}
                value={activeConfig.metaDescription}
                onChange={(e) => updateActiveConfig({ metaDescription: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 500 }}
              />
            </div>

            {/* Keywords & Canonical Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Target Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={activeConfig.keywords}
                  onChange={(e) => updateActiveConfig({ keywords: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Canonical URL</label>
                <input
                  type="text"
                  value={activeConfig.canonicalUrl}
                  onChange={(e) => updateActiveConfig({ canonicalUrl: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                />
              </div>
            </div>

            {/* Robots & Schema Type Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Robots Indexing Directive</label>
                <select
                  value={activeConfig.robots}
                  onChange={(e) => updateActiveConfig({ robots: e.target.value as any })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", background: "#ffffff" }}
                >
                  <option value="index, follow">index, follow (Recommended for public pages)</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow (Hidden from search engines)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>JSON-LD Schema Type</label>
                <select
                  value={activeConfig.jsonLdType}
                  onChange={(e) => updateActiveConfig({ jsonLdType: e.target.value as any })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", background: "#ffffff" }}
                >
                  <option value="NewsMediaOrganization">NewsMediaOrganization (Publisher Schema)</option>
                  <option value="CollectionPage">CollectionPage (News Category Schema)</option>
                  <option value="WebPage">WebPage (General Page Schema)</option>
                  <option value="NewsArticle">NewsArticle (Article Detail Schema)</option>
                </select>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px solid #e2e8f0", margin: "10px 0" }} />

            <h4 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <Share2 size={18} style={{ color: "#2563eb" }} />
              2. Open Graph (OG) & Social Sharing Card Customization
            </h4>

            {/* OG Title & OG Description */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Social Share Title (og:title)</label>
                <input
                  type="text"
                  value={activeConfig.ogTitle}
                  onChange={(e) => updateActiveConfig({ ogTitle: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Social Share Description (og:description)</label>
                <input
                  type="text"
                  value={activeConfig.ogDescription}
                  onChange={(e) => updateActiveConfig({ ogDescription: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                />
              </div>
            </div>

            {/* OG Cover Image Upload */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                Social Share Image (og:image)
              </label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="text"
                  value={activeConfig.ogImage}
                  onChange={(e) => updateActiveConfig({ ogImage: e.target.value })}
                  placeholder="https://..."
                  style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                />
                <label
                  style={{
                    background: "#0f172a",
                    color: "#ffffff",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Upload size={14} /> Upload Image
                  <input type="file" accept="image/*" onChange={handleImageFileUpload} style={{ display: "none" }} />
                </label>
              </div>
            </div>

            {/* Bottom Save Action Footer */}
            <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSave}
                style={{
                  background: "#e50914",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 28px",
                  borderRadius: "10px",
                  fontWeight: 900,
                  fontSize: "0.92rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 16px rgba(229,9,20,0.3)"
                }}
              >
                <Save size={18} /> Save & Activate Live
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
