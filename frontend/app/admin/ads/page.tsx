"use client";

// =============================================================================
// Admin Advertisements Manager Page — Next.js App Router
// Dedicated tab for Main Leaderboard Ad Banner & Sticky Advertisement Bar
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Megaphone,
  Upload,
  Check,
  Loader2,
  X,
  Eye,
  Trash2,
  Sparkles,
  Link2,
  Image as ImageIcon,
  Sliders,
  AlertCircle
} from "lucide-react";

export default function AdminAdsPage() {
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Sticky Advertisement Bar State
  const [stickyAdEnabled, setStickyAdEnabled] = useState(true);
  const [stickyAdBadge, setStickyAdBadge] = useState("SPONSORED");
  const [stickyAdText, setStickyAdText] = useState("📢 SPECIAL ANNOUNCEMENT: Reach Millions of Readers with Global Awaaz Digital Sponsorships!");
  const [stickyAdLink, setStickyAdLink] = useState("/advertise");
  const [stickyAdImage, setStickyAdImage] = useState("");
  const [stickyAdBg, setStickyAdBg] = useState("#000000");
  const [adImageUploading, setAdImageUploading] = useState(false);

  // Leaderboard Advertisement Banner State
  const [leaderboardAdEnabled, setLeaderboardAdEnabled] = useState(true);
  const [leaderboardAdImage, setLeaderboardAdImage] = useState("");
  const [leaderboardAdTitle, setLeaderboardAdTitle] = useState("GLOBAL AWAAZ DIGITAL MEDIA COVERAGE");
  const [leaderboardAdSubtitle, setLeaderboardAdSubtitle] = useState("Get real-time news updates across Bihar, Jharkhand & National headlines 24/7");
  const [leaderboardAdLink, setLeaderboardAdLink] = useState("/advertise");
  const [leaderboardAdBtnText, setLeaderboardAdBtnText] = useState("Advertise With Us");
  const [leaderboardAdBadge, setLeaderboardAdBadge] = useState("ADVERTISEMENT");
  const [leaderboardAdHeight, setLeaderboardAdHeight] = useState("110");
  const [leaderboardImageUploading, setLeaderboardImageUploading] = useState(false);

  // Left Sidebar / Top News Grid Advertisement Banner State
  const [leftGridAdEnabled, setLeftGridAdEnabled] = useState(true);
  const [leftGridAdImage, setLeftGridAdImage] = useState("");
  const [leftGridAdTitle, setLeftGridAdTitle] = useState("GLOBAL AWAAZ SPONSORSHIP");
  const [leftGridAdSubtitle, setLeftGridAdSubtitle] = useState("Promote your brand to millions of readers across Bihar, Jharkhand & India.");
  const [leftGridAdLink, setLeftGridAdLink] = useState("/advertise");
  const [leftGridAdBtnText, setLeftGridAdBtnText] = useState("Advertise With Us");
  const [leftGridAdBadge, setLeftGridAdBadge] = useState("SPONSORED");
  const [leftGridImageUploading, setLeftGridImageUploading] = useState(false);

  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const loadAdSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/ad-settings");
      const json = await res.json();
      if (json.success && json.data) {
        setStickyAdEnabled(json.data.ad_sticky_enabled !== "false");
        if (json.data.ad_sticky_badge) setStickyAdBadge(json.data.ad_sticky_badge);
        if (json.data.ad_sticky_text) setStickyAdText(json.data.ad_sticky_text);
        if (json.data.ad_sticky_link) setStickyAdLink(json.data.ad_sticky_link);
        if (json.data.ad_sticky_image) setStickyAdImage(json.data.ad_sticky_image);
        if (json.data.ad_sticky_bg) setStickyAdBg(json.data.ad_sticky_bg);

        setLeaderboardAdEnabled(json.data.ad_leaderboard_enabled !== "false");
        if (json.data.ad_leaderboard_image) setLeaderboardAdImage(json.data.ad_leaderboard_image);
        if (json.data.ad_leaderboard_title) setLeaderboardAdTitle(json.data.ad_leaderboard_title);
        if (json.data.ad_leaderboard_subtitle) setLeaderboardAdSubtitle(json.data.ad_leaderboard_subtitle);
        if (json.data.ad_leaderboard_link) setLeaderboardAdLink(json.data.ad_leaderboard_link);
        if (json.data.ad_leaderboard_btn_text) setLeaderboardAdBtnText(json.data.ad_leaderboard_btn_text);
        if (json.data.ad_leaderboard_badge) setLeaderboardAdBadge(json.data.ad_leaderboard_badge);
        if (json.data.ad_leaderboard_height) setLeaderboardAdHeight(json.data.ad_leaderboard_height);

        setLeftGridAdEnabled(json.data.ad_left_grid_enabled !== "false");
        if (json.data.ad_left_grid_image) setLeftGridAdImage(json.data.ad_left_grid_image);
        if (json.data.ad_left_grid_title) setLeftGridAdTitle(json.data.ad_left_grid_title);
        if (json.data.ad_left_grid_subtitle) setLeftGridAdSubtitle(json.data.ad_left_grid_subtitle);
        if (json.data.ad_left_grid_link) setLeftGridAdLink(json.data.ad_left_grid_link);
        if (json.data.ad_left_grid_btn_text) setLeftGridAdBtnText(json.data.ad_left_grid_btn_text);
        if (json.data.ad_left_grid_badge) setLeftGridAdBadge(json.data.ad_left_grid_badge);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadAdSettings();
  }, [loadAdSettings]);

  const handleSaveAllAds = async () => {
    setSaving(true);
    try {
      const settings = [
        { key: "ad_sticky_enabled", value: String(stickyAdEnabled) },
        { key: "ad_sticky_badge", value: stickyAdBadge },
        { key: "ad_sticky_text", value: stickyAdText },
        { key: "ad_sticky_link", value: stickyAdLink },
        { key: "ad_sticky_image", value: stickyAdImage },
        { key: "ad_sticky_bg", value: stickyAdBg },
        { key: "ad_leaderboard_enabled", value: String(leaderboardAdEnabled) },
        { key: "ad_leaderboard_image", value: leaderboardAdImage },
        { key: "ad_leaderboard_title", value: leaderboardAdTitle },
        { key: "ad_leaderboard_subtitle", value: leaderboardAdSubtitle },
        { key: "ad_leaderboard_link", value: leaderboardAdLink },
        { key: "ad_leaderboard_btn_text", value: leaderboardAdBtnText },
        { key: "ad_leaderboard_badge", value: leaderboardAdBadge },
        { key: "ad_leaderboard_height", value: leaderboardAdHeight },
        { key: "ad_left_grid_enabled", value: String(leftGridAdEnabled) },
        { key: "ad_left_grid_image", value: leftGridAdImage },
        { key: "ad_left_grid_title", value: leftGridAdTitle },
        { key: "ad_left_grid_subtitle", value: leftGridAdSubtitle },
        { key: "ad_left_grid_link", value: leftGridAdLink },
        { key: "ad_left_grid_btn_text", value: leftGridAdBtnText },
        { key: "ad_left_grid_badge", value: leftGridAdBadge },
      ];
      await fetch("/api/v1/ad-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      window.dispatchEvent(new Event("ga_sticky_ad_updated"));
      showToast("✓ All Advertisement banners saved & updated live globally!");
    } catch (err: any) {
      showToast("❌ Failed to save ad settings: " + (err?.message || ""), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStickyAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      showToast("❌ Invalid file type! Please select JPG, PNG, WEBP, GIF, or SVG banner image.", "error");
      return;
    }

    setAdImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/v1/media/upload", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();

      if (!uploadJson.success || !uploadJson.data?.url) {
        showToast("❌ Upload failed: " + (uploadJson.message || "Unknown error"), "error");
        return;
      }

      const uploadedUrl = uploadJson.data.url as string;
      setStickyAdImage(uploadedUrl);
      showToast("✓ Sticky Banner image uploaded! (JPG/PNG/WEBP)");
    } catch (err: any) {
      showToast("❌ Upload error: " + (err?.message || "Unknown error"), "error");
    } finally {
      setAdImageUploading(false);
      e.target.value = "";
    }
  };

  const handleLeaderboardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      showToast("❌ Invalid file type! Please select JPG, PNG, WEBP, GIF, or SVG image.", "error");
      return;
    }

    setLeaderboardImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/v1/media/upload", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();

      if (!uploadJson.success || !uploadJson.data?.url) {
        showToast("❌ Upload failed: " + (uploadJson.message || "Unknown error"), "error");
        return;
      }

      const uploadedUrl = uploadJson.data.url as string;
      setLeaderboardAdImage(uploadedUrl);
      showToast("✓ Leaderboard banner image uploaded! (JPG/PNG/WEBP)");
    } catch (err: any) {
      showToast("❌ Upload error: " + (err?.message || "Unknown error"), "error");
    } finally {
      setLeaderboardImageUploading(false);
      e.target.value = "";
    }
  };

  const handleLeftGridImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      showToast("❌ Invalid file type! Please select JPG, PNG, WEBP, GIF, or SVG image.", "error");
      return;
    }

    setLeftGridImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/v1/media/upload", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();

      if (!uploadJson.success || !uploadJson.data?.url) {
        showToast("❌ Upload failed: " + (uploadJson.message || "Unknown error"), "error");
        return;
      }

      const uploadedUrl = uploadJson.data.url as string;
      setLeftGridAdImage(uploadedUrl);
      showToast("✓ Left Grid Advertisement image uploaded! (JPG/PNG/WEBP)");
    } catch (err: any) {
      showToast("❌ Upload error: " + (err?.message || "Unknown error"), "error");
    } finally {
      setLeftGridImageUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          background: toastType === "error" ? "#ef4444" : "#10b981",
          color: "#ffffff",
          padding: "12px 22px",
          borderRadius: "10px",
          fontWeight: 800,
          fontSize: "0.9rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #e50914 0%, #b91c1c 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(229,9,20,0.3)" }}>
              <Megaphone size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 900, margin: 0, color: "#0f172a" }}>
                Advertisements Manager (विज्ञापन बैनर प्रबंधन)
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                Manage full-width Leaderboard ad banners and Sticky advertisement bars. Upload JPG, PNG, WEBP images.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveAllAds}
          disabled={saving}
          style={{
            background: "#e50914",
            color: "#ffffff",
            border: "none",
            padding: "12px 28px",
            borderRadius: "10px",
            fontWeight: 800,
            fontSize: "0.92rem",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(229, 9, 20, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          {saving ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={18} />}
          Save All Changes
        </button>
      </div>

      {/* Quick Navigation Alert Banner for Submitted Advertising Proposals */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        border: "1px solid rgba(229, 9, 20, 0.4)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(229, 9, 20, 0.2)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Megaphone size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>
              📥 Submitted Advertising Proposal Inquiries (प्राप्त विज्ञापन प्रस्ताव)
            </h4>
            <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#cbd5e1" }}>
              View and manage client brand proposal inquiries submitted directly from the public Advertise page.
            </p>
          </div>
        </div>

        <Link
          href="/admin/advertise"
          style={{
            background: "#e50914",
            color: "#ffffff",
            padding: "9px 20px",
            borderRadius: "8px",
            fontWeight: 800,
            fontSize: "0.82rem",
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(229,9,20,0.35)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          View All Proposal Inquiries ▶
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {/* ==================================================================== */}
        {/* CARD 1: STICKY HEADER ADVERTISEMENT BAR */}
        {/* ==================================================================== */}
        <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                📌 1. Sticky Header Advertisement Bar (स्टीकी विज्ञापन बैनर)
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                High-impact sticky banner displayed at the top of the home page below main site header.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 800, color: stickyAdEnabled ? "#16a34a" : "#dc2626" }}>
                {stickyAdEnabled ? "ACTIVE (चालू)" : "DISABLED (बंद)"}
              </label>
              <button
                type="button"
                onClick={() => setStickyAdEnabled(!stickyAdEnabled)}
                style={{
                  background: stickyAdEnabled ? "#16a34a" : "#cbd5e1",
                  color: "#ffffff",
                  border: "none",
                  padding: "6px 18px",
                  borderRadius: "20px",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {stickyAdEnabled ? "Toggle Off" : "Toggle On"}
              </button>
            </div>
          </div>

          {/* Graphic Image Upload Section */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px", marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
              🖼️ Upload Sticky Banner Graphic Image (JPG, PNG, WEBP, GIF, SVG)
            </label>
            <p style={{ margin: "0 0 14px 0", fontSize: "0.78rem", color: "#64748b" }}>
              Upload a graphic image file or banner logo to display inside the sticky advertisement container.
            </p>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <label style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "9px 20px",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "0.84rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}>
                {adImageUploading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={16} />}
                {adImageUploading ? "Uploading Image..." : "Upload Banner File (JPG/PNG/WEBP)"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handleStickyAdImageUpload}
                  disabled={adImageUploading}
                  style={{ display: "none" }}
                />
              </label>

              <div style={{ flex: 1, minWidth: "240px" }}>
                <input
                  type="text"
                  value={stickyAdImage}
                  onChange={(e) => setStickyAdImage(e.target.value)}
                  placeholder="Or enter image URL (https://... or /uploads/...)"
                  style={{ width: "100%", padding: "9px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>

              {stickyAdImage && (
                <button
                  type="button"
                  onClick={() => setStickyAdImage("")}
                  style={{
                    background: "#fee2e2",
                    color: "#991b1b",
                    border: "1px solid #fca5a5",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer"
                  }}
                >
                  Remove Image
                </button>
              )}
            </div>

            {stickyAdImage && (
              <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "12px", background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                <img src={stickyAdImage} alt="Sticky Banner" style={{ height: "42px", maxWidth: "200px", objectFit: "contain", borderRadius: "6px" }} />
                <span style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 800 }}>✓ Sticky Banner Image Active</span>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🏷️ Badge Tag (e.g. SPONSORED)</label>
              <input
                type="text"
                value={stickyAdBadge}
                onChange={(e) => setStickyAdBadge(e.target.value)}
                placeholder="SPONSORED"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>📢 Headline Announcement Message</label>
              <input
                type="text"
                value={stickyAdText}
                onChange={(e) => setStickyAdText(e.target.value)}
                placeholder="Special Offer: Subscribe or Advertise on Global Awaaz..."
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🔗 Target Click URL</label>
              <input
                type="text"
                value={stickyAdLink}
                onChange={(e) => setStickyAdLink(e.target.value)}
                placeholder="/advertise or https://..."
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🎨 Background Style / Color Gradient</label>
              <input
                type="text"
                value={stickyAdBg}
                onChange={(e) => setStickyAdBg(e.target.value)}
                placeholder="linear-gradient(90deg, #1e293b 0%, #0f172a 100%)"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>
              Live Sticky Banner Preview:
            </label>
            <div style={{
              background: stickyAdBg || "linear-gradient(90deg, #1e293b 0%, #0f172a 100%)",
              borderRadius: "12px",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#ffffff"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                {stickyAdBadge && (
                  <span style={{ background: "#e50914", color: "#fff", fontSize: "0.68rem", fontWeight: 900, padding: "3px 8px", borderRadius: "4px" }}>
                    {stickyAdBadge}
                  </span>
                )}
                {stickyAdImage && (
                  <img src={stickyAdImage} alt="Ad Banner" style={{ height: "34px", maxWidth: "160px", objectFit: "contain", borderRadius: "4px" }} />
                )}
                {stickyAdText && (
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {stickyAdText}
                  </span>
                )}
              </div>
              <span style={{ background: "#ffffff", color: "#0f172a", fontSize: "0.78rem", fontWeight: 800, padding: "5px 14px", borderRadius: "6px" }}>
                Explore Now ▶
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* CARD 2: MAIN LEADERBOARD AD BANNER */}
        {/* ==================================================================== */}
        <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                🖼️ 2. Main Leaderboard Ad Banner (मुख्य लीडरबोर्ड विज्ञापन बैनर)
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                Full-width leaderboard advertisement banner positioned prominently above news spotlights on the home page.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 800, color: leaderboardAdEnabled ? "#16a34a" : "#dc2626" }}>
                {leaderboardAdEnabled ? "ACTIVE (चालू)" : "DISABLED (बंद)"}
              </label>
              <button
                type="button"
                onClick={() => setLeaderboardAdEnabled(!leaderboardAdEnabled)}
                style={{
                  background: leaderboardAdEnabled ? "#16a34a" : "#cbd5e1",
                  color: "#ffffff",
                  border: "none",
                  padding: "6px 18px",
                  borderRadius: "20px",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {leaderboardAdEnabled ? "Toggle Off" : "Toggle On"}
              </button>
            </div>
          </div>

          {/* Leaderboard Image Upload Box */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px", marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
              🖼️ Upload Leaderboard Banner Graphic Image (JPG, PNG, WEBP, GIF, SVG)
            </label>
            <p style={{ margin: "0 0 14px 0", fontSize: "0.78rem", color: "#64748b" }}>
              Upload a high-resolution banner image (recommended 1200x200 or 728x90) to display as a full-width ad banner graphic.
            </p>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <label style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "9px 20px",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "0.84rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}>
                {leaderboardImageUploading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={16} />}
                {leaderboardImageUploading ? "Uploading Image..." : "Upload Banner Image File (JPG/PNG/WEBP)"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handleLeaderboardImageUpload}
                  disabled={leaderboardImageUploading}
                  style={{ display: "none" }}
                />
              </label>

              <div style={{ flex: 1, minWidth: "240px" }}>
                <input
                  type="text"
                  value={leaderboardAdImage}
                  onChange={(e) => setLeaderboardAdImage(e.target.value)}
                  placeholder="Or enter image URL (https://... or /uploads/...)"
                  style={{ width: "100%", padding: "9px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>

              {leaderboardAdImage && (
                <button
                  type="button"
                  onClick={() => setLeaderboardAdImage("")}
                  style={{
                    background: "#fee2e2",
                    color: "#991b1b",
                    border: "1px solid #fca5a5",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer"
                  }}
                >
                  Remove Image
                </button>
              )}
            </div>

            {leaderboardAdImage && (
              <div style={{ marginTop: "14px", background: "#ffffff", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                <img src={leaderboardAdImage} alt="Leaderboard Banner Preview" style={{ width: "100%", maxHeight: `${leaderboardAdHeight || "110"}px`, objectFit: "cover", borderRadius: "8px" }} />
                <span style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 800, display: "block", marginTop: "6px" }}>
                  ✓ Leaderboard Banner Graphic Active ({leaderboardAdHeight || 110}px height display on homepage)
                </span>
              </div>
            )}
          </div>

          {/* Banner Display Height Adjustment Slider & Presets */}
          <div style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>
                📐 Leaderboard Banner Height (बैनर की ऊंचाई): <span style={{ color: "#e50914" }}>{leaderboardAdHeight}px</span>
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { label: "Slim (80px)", val: "80" },
                  { label: "Compact (110px)", val: "110" },
                  { label: "Standard (140px)", val: "140" },
                  { label: "Tall (180px)", val: "180" }
                ].map(preset => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setLeaderboardAdHeight(preset.val)}
                    style={{
                      background: leaderboardAdHeight === preset.val ? "#0f172a" : "#ffffff",
                      color: leaderboardAdHeight === preset.val ? "#ffffff" : "#475569",
                      border: "1px solid #cbd5e1",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="range"
              min="70"
              max="220"
              step="5"
              value={leaderboardAdHeight}
              onChange={(e) => setLeaderboardAdHeight(e.target.value)}
              style={{ width: "100%", accentColor: "#e50914", cursor: "pointer" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🏷️ Badge Tag (e.g. ADVERTISEMENT)</label>
              <input
                type="text"
                value={leaderboardAdBadge}
                onChange={(e) => setLeaderboardAdBadge(e.target.value)}
                placeholder="ADVERTISEMENT"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>📢 Headline Title</label>
              <input
                type="text"
                value={leaderboardAdTitle}
                onChange={(e) => setLeaderboardAdTitle(e.target.value)}
                placeholder="GLOBAL AWAAZ DIGITAL MEDIA COVERAGE"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>📝 Subtitle Description</label>
              <input
                type="text"
                value={leaderboardAdSubtitle}
                onChange={(e) => setLeaderboardAdSubtitle(e.target.value)}
                placeholder="Get real-time news updates across Bihar, Jharkhand & National headlines..."
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🔘 Button Label</label>
              <input
                type="text"
                value={leaderboardAdBtnText}
                onChange={(e) => setLeaderboardAdBtnText(e.target.value)}
                placeholder="Advertise With Us"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🔗 Target Click URL</label>
              <input
                type="text"
                value={leaderboardAdLink}
                onChange={(e) => setLeaderboardAdLink(e.target.value)}
                placeholder="/advertise"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>
              Live Leaderboard Banner Preview:
            </label>
            <div style={{
              background: "linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#ffffff"
            }}>
              <div>
                <span style={{ background: "#e50914", color: "#fff", fontSize: "0.65rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 800 }}>
                  {leaderboardAdBadge || "ADVERTISEMENT"}
                </span>
                <h4 style={{ margin: "4px 0 2px", fontSize: "1.05rem", fontWeight: 800 }}>
                  {leaderboardAdTitle}
                </h4>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                  {leaderboardAdSubtitle}
                </p>
              </div>
              <span style={{ background: "#ffffff", color: "#0f172a", fontSize: "0.8rem", fontWeight: 800, padding: "7px 16px", borderRadius: "8px" }}>
                {leaderboardAdBtnText}
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* CARD 3: Left Column / Top News Grid Advertisement (मुख्य समाचार ग्रिड विज्ञापन) */}
        {/* ==================================================================== */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Sparkles size={20} style={{ color: "#e50914" }} />
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                  Article Left Column — Top News Grid Advertisement (मुख्य समाचार ग्रिड विज्ञापन)
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                  Displays an advertisement banner at the bottom of the left column news grid on article pages.
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: leftGridAdEnabled ? "#16a34a" : "#64748b" }}>
                {leftGridAdEnabled ? "ACTIVE" : "DISABLED"}
              </span>
              <input
                type="checkbox"
                checked={leftGridAdEnabled}
                onChange={(e) => setLeftGridAdEnabled(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#e50914", cursor: "pointer" }}
              />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🏷️ Ad Tag Badge</label>
              <input
                type="text"
                value={leftGridAdBadge}
                onChange={(e) => setLeftGridAdBadge(e.target.value)}
                placeholder="SPONSORED"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🔘 Button CTA Text</label>
              <input
                type="text"
                value={leftGridAdBtnText}
                onChange={(e) => setLeftGridAdBtnText(e.target.value)}
                placeholder="Advertise With Us"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>📝 Ad Headline Title</label>
            <input
              type="text"
              value={leftGridAdTitle}
              onChange={(e) => setLeftGridAdTitle(e.target.value)}
              placeholder="GLOBAL AWAAZ SPONSORSHIP"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>📄 Subtitle / Description</label>
            <textarea
              rows={2}
              value={leftGridAdSubtitle}
              onChange={(e) => setLeftGridAdSubtitle(e.target.value)}
              placeholder="Promote your brand to millions of readers across Bihar, Jharkhand & India."
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", resize: "none" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🖼️ Banner Image URL or Upload</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={leftGridAdImage}
                  onChange={(e) => setLeftGridAdImage(e.target.value)}
                  placeholder="https://... or upload image"
                  style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
                <label style={{
                  background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "8px 12px", borderRadius: "8px",
                  fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap"
                }}>
                  {leftGridImageUploading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />}
                  Upload
                  <input type="file" accept="image/*" onChange={handleLeftGridImageUpload} style={{ display: "none" }} />
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🔗 Target Click URL</label>
              <input
                type="text"
                value={leftGridAdLink}
                onChange={(e) => setLeftGridAdLink(e.target.value)}
                placeholder="/advertise"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>
              Live Left Grid Ad Preview:
            </label>
            <div style={{
              maxWidth: "320px",
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: "12px",
              padding: "14px",
              color: "#ffffff"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ background: "#e50914", color: "#fff", fontSize: "0.62rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 800 }}>
                  {leftGridAdBadge || "SPONSORED"}
                </span>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>
                  ADVERTISEMENT
                </span>
              </div>
              {leftGridAdImage ? (
                <img src={leftGridAdImage} alt="Preview" style={{ width: "100%", height: "auto", borderRadius: "8px", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <h5 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "#ffffff" }}>
                    {leftGridAdTitle || "GLOBAL AWAAZ SPONSORSHIP"}
                  </h5>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#cbd5e1" }}>
                    {leftGridAdSubtitle}
                  </p>
                  <span style={{ background: "#e50914", color: "#ffffff", padding: "5px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, width: "fit-content", marginTop: "4px" }}>
                    {leftGridAdBtnText}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Footer Action Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleSaveAllAds}
            disabled={saving}
            style={{
              background: "#e50914",
              color: "#ffffff",
              border: "none",
              padding: "14px 36px",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "0.98rem",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(229, 9, 20, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {saving ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={20} />}
            Save All Advertisement Settings
          </button>
        </div>
      </div>
    </div>
  );
}
