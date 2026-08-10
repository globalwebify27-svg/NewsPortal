"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Upload,
  Image as ImageIcon2,
  RotateCcw,
  Sliders,
  MoveHorizontal,
  Link2,
  Eye,
  Check,
  Globe,
  Share2,
  Sparkles,
  Search,
  Plus,
  Trash2,
  FileText,
  Loader2
} from "lucide-react";

import { getStoredAboutData, saveAboutData, AboutPageData, defaultAboutData } from "@/lib/aboutData";

export default function AdminSettingsPage() {
  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // About Page Editable State
  const [aboutData, setAboutData] = useState<AboutPageData>(defaultAboutData);

  useEffect(() => {
    async function loadAbout() {
      const res = await getStoredAboutData();
      setAboutData(res);
    }
    loadAbout();
  }, []);

  const handleSaveAboutData = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveAboutData(aboutData);
      showToast("About Us page content saved to database!");
    } catch (err) {
      showToast("Failed to save About Us content", "error");
    }
  };

  // Site Logo Settings State — DB-backed
  const [siteLogoUrl, setSiteLogoUrl] = useState("");
  const [logoInputUrl, setLogoInputUrl] = useState("");
  const [logoSize, setLogoSize] = useState<number>(64);
  const [logoMarginLeft, setLogoMarginLeft] = useState<number>(75);
  const [logoLoading, setLogoLoading] = useState(false); // upload / save in progress
  const [logoInitLoaded, setLogoInitLoaded] = useState(false);

  // Social Media Links State
  const [socialFb, setSocialFb] = useState("https://facebook.com");
  const [socialTwitter, setSocialTwitter] = useState("https://twitter.com");
  const [socialYt, setSocialYt] = useState("https://youtube.com");
  const [socialInsta, setSocialInsta] = useState("https://instagram.com");
  const [socialLinkedin, setSocialLinkedin] = useState("https://linkedin.com");

  // Company Footer Links State
  const [companyLinks, setCompanyLinks] = useState<Array<{ id: string; nameHi: string; nameEn: string; href: string }>>([
    { id: "1", nameHi: "हमारे बारे में", nameEn: "About Us", href: "/about" },
    { id: "2", nameHi: "करियर", nameEn: "Careers", href: "/#careers" },
    { id: "3", nameHi: "गोपनीयता नीति", nameEn: "Privacy Policy", href: "/#privacy" },
    { id: "4", nameHi: "सेवा की शर्तें", nameEn: "Terms of Service", href: "/#terms" },
    { id: "5", nameHi: "संपर्क करें", nameEn: "Contact Us", href: "/#contact" },
    { id: "6", nameHi: "विज्ञापन दें", nameEn: "Advertise", href: "/#advertise" }
  ]);

  const [newLinkHi, setNewLinkHi] = useState("");
  const [newLinkEn, setNewLinkEn] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // ─── Load logo settings from DB on mount ───────────────────────────────────
  const loadLogoSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/logo-settings");
      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data as Record<string, string>;
        if (data.site_logo_url) {
          setSiteLogoUrl(data.site_logo_url);
          if (!data.site_logo_url.startsWith("data:image")) {
            setLogoInputUrl(data.site_logo_url);
          }
        }
        if (data.site_logo_size) {
          setLogoSize(parseInt(data.site_logo_size, 10) || 64);
        }
        if (data.site_logo_margin) {
          setLogoMarginLeft(parseInt(data.site_logo_margin, 10) || 75);
        }
      }
    } catch (e) {
      // silently fail on initial load
    } finally {
      setLogoInitLoaded(true);
    }
  }, []);

  // Sticky Advertisement Bar State
  const [stickyAdEnabled, setStickyAdEnabled] = useState(true);
  const [stickyAdBadge, setStickyAdBadge] = useState("SPONSORED");
  const [stickyAdText, setStickyAdText] = useState("📢 SPECIAL ANNOUNCEMENT: Reach Millions of Readers with Global Awaaz Digital Sponsorships!");
  const [stickyAdLink, setStickyAdLink] = useState("/advertise");
  const [stickyAdImage, setStickyAdImage] = useState("");
  const [stickyAdBg, setStickyAdBg] = useState("linear-gradient(90deg, #1e293b 0%, #0f172a 100%)");
  const [stickyAdSaving, setStickyAdSaving] = useState(false);

  // Leaderboard Advertisement Banner State
  const [leaderboardAdEnabled, setLeaderboardAdEnabled] = useState(true);
  const [leaderboardAdImage, setLeaderboardAdImage] = useState("");
  const [leaderboardAdTitle, setLeaderboardAdTitle] = useState("GLOBAL AWAAZ DIGITAL MEDIA COVERAGE");
  const [leaderboardAdSubtitle, setLeaderboardAdSubtitle] = useState("Get real-time news updates across Bihar, Jharkhand & National headlines 24/7");
  const [leaderboardAdLink, setLeaderboardAdLink] = useState("/advertise");
  const [leaderboardAdBtnText, setLeaderboardAdBtnText] = useState("Advertise With Us");
  const [leaderboardAdBadge, setLeaderboardAdBadge] = useState("ADVERTISEMENT");
  const [leaderboardImageUploading, setLeaderboardImageUploading] = useState(false);

  const loadStickyAdSettings = useCallback(async () => {
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
      }
    } catch (e) {}
  }, []);

  const handleSaveStickyAd = async () => {
    setStickyAdSaving(true);
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
      ];
      await fetch("/api/v1/ad-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      window.dispatchEvent(new Event("ga_sticky_ad_updated"));
      showToast("✓ All Advertisement settings saved & live globally!");
    } catch (err: any) {
      showToast("❌ Failed to save ad settings: " + (err?.message || ""), "error");
    } finally {
      setStickyAdSaving(false);
    }
  };

  const [adImageUploading, setAdImageUploading] = useState(false);

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
      showToast("✓ Banner image uploaded successfully! (JPG/PNG/WEBP)");
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

  useEffect(() => {
    loadLogoSettings();
    loadStickyAdSettings();
  }, [loadLogoSettings, loadStickyAdSettings]);

  const handleAddCompanyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkHi.trim() || !newLinkEn.trim()) {
      showToast("Both Hindi and English link names are required!");
      return;
    }

    const newLink = {
      id: `link_${Date.now()}`,
      nameHi: newLinkHi.trim(),
      nameEn: newLinkEn.trim(),
      href: newLinkUrl.trim() || "/#custom"
    };

    const updated = [...companyLinks, newLink];
    setCompanyLinks(updated);
    showToast(`✓ Footer link "${newLinkHi}" added successfully!`);

    setNewLinkHi("");
    setNewLinkEn("");
    setNewLinkUrl("");
  };

  const handleDeleteCompanyLink = (id: string, nameHi: string) => {
    const updated = companyLinks.filter(l => l.id !== id);
    setCompanyLinks(updated);
    showToast(`Footer link "${nameHi}" deleted.`);
  };


  // ─── Save a logo setting to DB ─────────────────────────────────────────────
  const saveLogoSetting = async (key: string, value: string) => {
    await fetch("/api/v1/logo-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    // Broadcast update so the Header refreshes
    window.dispatchEvent(new Event("ga_logo_updated"));
  };

  const handleUpdateLogoSize = async (newSize: number) => {
    setLogoSize(newSize);
    await saveLogoSetting("site_logo_size", newSize.toString());
  };

  const handleUpdateLogoMargin = async (newMargin: number) => {
    setLogoMarginLeft(newMargin);
    await saveLogoSetting("site_logo_margin", newMargin.toString());
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoLoading(true);
    try {
      // 1. Upload to Cloudinary via existing media upload endpoint
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/v1/media/upload", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();

      if (!uploadJson.success || !uploadJson.data?.url) {
        showToast("❌ Upload failed: " + (uploadJson.message || "Unknown error"), "error");
        return;
      }

      const cloudinaryUrl = uploadJson.data.url as string;

      // 2. Save the Cloudinary URL to DB
      await saveLogoSetting("site_logo_url", cloudinaryUrl);
      setSiteLogoUrl(cloudinaryUrl);
      setLogoInputUrl(cloudinaryUrl);
      showToast("✓ Logo uploaded to Hostinger Storage & saved globally!");
    } catch (err: any) {
      showToast("❌ Upload error: " + (err?.message || "Unknown error"), "error");
    } finally {
      setLogoLoading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleSaveLogoUrl = async () => {
    if (!logoInputUrl.trim()) {
      await handleResetLogo();
      return;
    }
    setLogoLoading(true);
    try {
      await saveLogoSetting("site_logo_url", logoInputUrl.trim());
      setSiteLogoUrl(logoInputUrl.trim());
      showToast("✓ Logo URL saved to database & applied globally!");
    } catch (err: any) {
      showToast("❌ Save failed: " + (err?.message || ""), "error");
    } finally {
      setLogoLoading(false);
    }
  };

  const handleResetLogo = async () => {
    setLogoLoading(true);
    try {
      await fetch("/api/v1/logo-settings?key=site_logo_url", { method: "DELETE" });
      setSiteLogoUrl("");
      setLogoInputUrl("");
      window.dispatchEvent(new Event("ga_logo_updated"));
      showToast("Logo reset to default emblem.");
    } catch (err: any) {
      showToast("❌ Reset failed: " + (err?.message || ""), "error");
    } finally {
      setLogoLoading(false);
    }
  };

  const handleSaveSocialLinks = async () => {
    const payload = {
      facebook: socialFb.trim(),
      twitter: socialTwitter.trim(),
      youtube: socialYt.trim(),
      instagram: socialInsta.trim(),
      linkedin: socialLinkedin.trim()
    };
    await saveLogoSetting("social_links", JSON.stringify(payload));
    showToast("✓ Social media links updated centrally in database!");
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "#0a0a0a", color: "#ffffff", border: `2px solid ${toastType === "error" ? "#ef4444" : "#e50914"}`, padding: "14px 20px", borderRadius: "10px", boxShadow: `0 10px 30px ${toastType === "error" ? "rgba(239,68,68,0.2)" : "rgba(229,9,20,0.2)"}`, zIndex: 9999, fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px", maxWidth: "360px", animation: "slideIn 0.2s ease" }}>
          <Check style={{ color: toastType === "error" ? "#f87171" : "#22c55e", flexShrink: 0 }} size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2FA Two-Factor Security Settings Section */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "32px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(15,23,42,0.2)" }}>
              <RotateCcw size={22} style={{ transform: "rotate(45deg)" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>
                Two-Factor Authentication (2FA TOTP Security)
              </h2>
              <p style={{ margin: "3px 0 0 0", fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>
                Protect all administrative logins with 256-bit TOTP authenticator apps (Google Authenticator / Authy / 1Password).
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "8px 16px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Check size={15} /> 2FA Ready (TOTP Protocol)
            </span>
          </div>
        </div>
      </div>

      {/* Site Logo & Branding Settings Section */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "32px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: "32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(220,38,38,0.12)" }}>
              <Settings size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>
                Header Site Logo & Branding Settings
              </h2>
              <p style={{ margin: "3px 0 0 0", fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>
                Customize, upload, and fine-tune your portal logo position and sizing in real-time across all devices.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            {!logoInitLoaded ? (
              <span style={{ background: "#f8fafc", color: "#94a3b8", border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading logo...
              </span>
            ) : siteLogoUrl ? (
              <span style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "8px 16px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 6px rgba(16,185,129,0.08)" }}>
                <Check size={15} strokeWidth={2.5} /> Custom Logo Active (DB)
              </span>
            ) : (
              <span style={{ background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={15} style={{ color: "#e50914" }} strokeWidth={2.5} /> Default Vector Emblem Active
              </span>
            )}
          </div>
        </div>

        {/* LIVE HEADER INTERACTIVE PREVIEW BANNER */}
        <div style={{ background: "#0f172a", borderRadius: "16px", padding: "20px", marginBottom: "32px", boxShadow: "0 8px 24px rgba(15,23,42,0.15)", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "6px" }}>
                <Eye size={14} /> Live Interactive Header Banner Simulation
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ background: "rgba(255,255,255,0.1)", color: "#e2e8f0", padding: "4px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700 }}>
                Size: <strong style={{ color: "#f87171" }}>{logoSize}px</strong>
              </span>
              <span style={{ background: "rgba(255,255,255,0.1)", color: "#e2e8f0", padding: "4px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700 }}>
                Position: <strong style={{ color: "#f87171" }}>{logoMarginLeft}px</strong>
              </span>
            </div>
          </div>

          {/* Header Canvas Container */}
          <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
            {/* Header Top Accent Bar */}
            <div style={{ height: "4px", background: "linear-gradient(90deg, #e50914 0%, #16a34a 50%, #e50914 100%)" }} />

            {/* Simulated Header Main Content */}
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap", overflowX: "auto" }}>
              {/* Dynamic Logo & Title Group */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: `${Math.min(logoMarginLeft, 220)}px`, transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                {siteLogoUrl && (
                  <div style={{ width: `${logoSize}px`, height: `${logoSize}px`, flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                    <img src={siteLogoUrl} alt="Live Logo Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                )}
                <div style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "1.35rem", fontWeight: 900, color: "#000000", display: "block", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                    GLOBAL AWAAZ
                  </span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#e50914", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginTop: "2px" }}>
                    — LOCAL से GLOBAL तक —
                  </span>
                </div>
              </div>

              {/* Simulated Navigation items */}
              <div style={{ display: "flex", alignItems: "center", gap: "18px", opacity: 0.5, pointerEvents: "none", fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                <span>HOME</span>
                <span>INDIA</span>
                <span>WORLD</span>
                <span>VIDEOS</span>
                <Search size={16} />
              </div>
            </div>
          </div>

          {/* Reset Control Bar */}
          <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 500 }}>
              💡 Changes made below update the live portal instantly.
            </span>
            {siteLogoUrl && (
              <button
                onClick={handleResetLogo}
                disabled={logoLoading}
                style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "6px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "0.78rem", cursor: logoLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s ease" }}
              >
                {logoLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <RotateCcw size={13} />} Reset to Default Vector Emblem
              </button>
            )}
          </div>
        </div>

        {/* CONTROLS SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", alignItems: "stretch", marginBottom: "32px" }}>
          {/* Card 1: Logo File & CDN URL */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h4 style={{ margin: "0 0 16px 0", fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "8px" }}>
                <Upload size={16} style={{ color: "#e50914" }} /> 1. Upload or CDN URL
              </h4>

              {/* File Upload Area */}
              <div style={{ border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "18px 14px", textAlign: "center", background: "#ffffff", marginBottom: "16px", transition: "all 0.2s ease" }}>
                <ImageIcon2 size={32} style={{ color: "#94a3b8", marginBottom: "6px" }} />
                <p style={{ margin: "0 0 10px 0", fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                  Supports PNG, SVG, JPG, WebP — uploads to Hostinger Storage
                </p>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: logoLoading ? "#64748b" : "#e50914", color: "#ffffff", padding: "9px 18px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", cursor: logoLoading ? "not-allowed" : "pointer", boxShadow: logoLoading ? "none" : "0 4px 12px rgba(229,9,20,0.25)", transition: "all 0.2s ease" }}>
                  {logoLoading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={15} />}
                  {logoLoading ? "Uploading..." : "Choose Logo Image"}
                  <input type="file" accept="image/*" onChange={handleLogoFileUpload} disabled={logoLoading} style={{ display: "none" }} />
                </label>
              </div>

              {/* CDN URL Section */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Or Paste Image CDN / Hostinger Storage URL
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Link2 size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      placeholder="https://yellowgreen-rook-384455.hostingersite.com/public/uploads/logo.png"
                      value={logoInputUrl}
                      onChange={(e) => setLogoInputUrl(e.target.value)}
                      style={{ width: "100%", padding: "9px 10px 9px 32px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem", background: "#ffffff", color: "#0f172a" }}
                    />
                  </div>
                  <button
                    onClick={handleSaveLogoUrl}
                    disabled={logoLoading}
                    style={{ background: logoLoading ? "#64748b" : "#0f172a", color: "#ffffff", border: "none", padding: "9px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "0.82rem", cursor: logoLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "4px", flexShrink: 0, transition: "all 0.2s ease" }}
                  >
                    {logoLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />} Save
                  </button>
                </div>
              </div>

              {/* ── Delete Current Logo ─────────────────────────────── */}
              {siteLogoUrl && (
                <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px dashed #fca5a5" }}>
                  <p style={{ margin: "0 0 10px 0", fontSize: "0.78rem", color: "#ef4444", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Trash2 size={13} /> Current Logo Active — delete to restore default emblem
                  </p>
                  <button
                    id="delete-logo-btn"
                    onClick={handleResetLogo}
                    disabled={logoLoading}
                    style={{
                      width: "100%",
                      background: logoLoading ? "#f1f5f9" : "linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)",
                      color: logoLoading ? "#94a3b8" : "#dc2626",
                      border: "1.5px solid",
                      borderColor: logoLoading ? "#e2e8f0" : "#fca5a5",
                      padding: "10px 18px",
                      borderRadius: "10px",
                      fontWeight: 800,
                      fontSize: "0.86rem",
                      cursor: logoLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s ease",
                      boxShadow: logoLoading ? "none" : "0 2px 8px rgba(220,38,38,0.12)",
                      letterSpacing: "0.01em"
                    }}
                    onMouseEnter={e => {
                      if (!logoLoading) {
                        (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #fecaca 0%, #fee2e2 100%)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(220,38,38,0.22)";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!logoLoading) {
                        (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(220,38,38,0.12)";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {logoLoading
                      ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Deleting...</>
                      : <><Trash2 size={15} /> Delete Logo &amp; Restore Default</>
                    }
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Logo Size Control */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sliders size={16} style={{ color: "#e50914" }} /> 2. Display Size
                </h4>
                <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 10px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 800 }}>
                  {logoSize}px
                </span>
              </div>

              <p style={{ margin: "0 0 16px 0", fontSize: "0.8rem", color: "#64748b" }}>
                Drag slider or choose a preset to adjust header emblem height & width.
              </p>

              {/* Range Slider */}
              <div style={{ marginBottom: "20px" }}>
                <input
                  type="range"
                  min="30"
                  max="180"
                  step="2"
                  value={logoSize}
                  onChange={(e) => handleUpdateLogoSize(parseInt(e.target.value, 10))}
                  style={{ width: "100%", accentColor: "#e50914", cursor: "pointer", height: "6px" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, marginTop: "4px" }}>
                  <span>30px</span>
                  <span>105px</span>
                  <span>180px</span>
                </div>
              </div>

              {/* Preset Size Buttons */}
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Quick Size Presets:
              </label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[
                  { label: "Small (40px)", size: 40 },
                  { label: "Medium (56px)", size: 56 },
                  { label: "Large (80px)", size: 80 },
                  { label: "XL (110px)", size: 110 },
                  { label: "Giant (140px)", size: 140 }
                ].map((p) => (
                  <button
                    key={p.size}
                    onClick={() => handleUpdateLogoSize(p.size)}
                    style={{
                      background: logoSize === p.size ? "#e50914" : "#ffffff",
                      color: logoSize === p.size ? "#ffffff" : "#334155",
                      border: logoSize === p.size ? "1px solid #e50914" : "1px solid #cbd5e1",
                      padding: "5px 10px",
                      borderRadius: "7px",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: logoSize === p.size ? "0 2px 8px rgba(229,9,20,0.3)" : "none"
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Logo Horizontal Shift/Position */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "8px" }}>
                  <MoveHorizontal size={16} style={{ color: "#e50914" }} /> 3. Shift Position
                </h4>
                <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 10px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 800 }}>
                  {logoMarginLeft}px
                </span>
              </div>

              <p style={{ margin: "0 0 16px 0", fontSize: "0.8rem", color: "#64748b" }}>
                Adjust left margin alignment to position logo perfectly in your header.
              </p>

              {/* Position Range Slider */}
              <div style={{ marginBottom: "20px" }}>
                <input
                  type="range"
                  min="0"
                  max="250"
                  step="5"
                  value={logoMarginLeft}
                  onChange={(e) => handleUpdateLogoMargin(parseInt(e.target.value, 10))}
                  style={{ width: "100%", accentColor: "#e50914", cursor: "pointer", height: "6px" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, marginTop: "4px" }}>
                  <span>0px</span>
                  <span>125px</span>
                  <span>250px</span>
                </div>
              </div>

              {/* Position Preset Buttons */}
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Position Presets:
              </label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[
                  { label: "Left Edge (15px)", margin: 15 },
                  { label: "Default (45px)", margin: 45 },
                  { label: "Shift Right (75px)", margin: 75 },
                  { label: "Far Right (120px)", margin: 120 },
                  { label: "Max Right (180px)", margin: 180 }
                ].map((p) => (
                  <button
                    key={p.margin}
                    onClick={() => handleUpdateLogoMargin(p.margin)}
                    style={{
                      background: logoMarginLeft === p.margin ? "#e50914" : "#ffffff",
                      color: logoMarginLeft === p.margin ? "#ffffff" : "#334155",
                      border: logoMarginLeft === p.margin ? "1px solid #e50914" : "1px solid #cbd5e1",
                      padding: "5px 10px",
                      borderRadius: "7px",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: logoMarginLeft === p.margin ? "0 2px 8px rgba(229,9,20,0.3)" : "none"
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Header Advertisement Manager */}
        <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                📢 Sticky Advertisement Bar (स्टीकी विज्ञापन बैनर)
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                Add and manage a high-visibility sticky advertisement banner bar displayed at the top of the Home Page.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 800, color: stickyAdEnabled ? "#16a34a" : "#dc2626" }}>
                {stickyAdEnabled ? "ACTIVE (चालू)" : "DISABLED (बंद)"}
              </label>
              <button
                type="button"
                onClick={() => setStickyAdEnabled(!stickyAdEnabled)}
                style={{
                  background: stickyAdEnabled ? "#16a34a" : "#cbd5e1",
                  color: "#ffffff",
                  border: "none",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontWeight: 800,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {stickyAdEnabled ? "Toggle Off" : "Toggle On"}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🏷️ Badge Tag (e.g. SPONSORED / ADVERTISEMENT)</label>
              <input
                type="text"
                value={stickyAdBadge}
                onChange={(e) => setStickyAdBadge(e.target.value)}
                placeholder="SPONSORED"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>📢 Advertisement Headline Text</label>
              <input
                type="text"
                value={stickyAdText}
                onChange={(e) => setStickyAdText(e.target.value)}
                placeholder="Special Offer: Get 50% off Digital Advertising Packages..."
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🔗 Destination Target Click URL</label>
              <input
                type="text"
                value={stickyAdLink}
                onChange={(e) => setStickyAdLink(e.target.value)}
                placeholder="/advertise or https://example.com"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🎨 Background Color / Gradient</label>
              <input
                type="text"
                value={stickyAdBg}
                onChange={(e) => setStickyAdBg(e.target.value)}
                placeholder="linear-gradient(90deg, #1e293b 0%, #0f172a 100%)"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          {/* Banner Graphic / Image Upload Section */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
              🖼️ Ad Banner Image / Graphic (JPG, PNG, WEBP, GIF, SVG)
            </label>
            <p style={{ margin: "0 0 12px 0", fontSize: "0.78rem", color: "#64748b" }}>
              Upload a custom banner image or graphic to display inside the sticky advertisement bar. Supports all image formats.
            </p>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <label style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "8px 18px",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
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

              <div style={{ flex: 1, minWidth: "220px" }}>
                <input
                  type="text"
                  value={stickyAdImage}
                  onChange={(e) => setStickyAdImage(e.target.value)}
                  placeholder="Or enter image URL (https://... or /uploads/...)"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
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
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer"
                  }}
                >
                  Remove Image
                </button>
              )}
            </div>

            {stickyAdImage && (
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px", background: "#ffffff", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <img src={stickyAdImage} alt="Uploaded Banner" style={{ height: "40px", maxWidth: "180px", objectFit: "contain", borderRadius: "4px" }} />
                <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700 }}>✓ Active Banner Image Attached</span>
              </div>
            )}
          </div>

          {/* Ad Live Preview */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>
              Live Ad Bar Preview (लाइव पूर्वावलोकन):
            </label>
            <div style={{
              background: stickyAdBg || "linear-gradient(90deg, #1e293b 0%, #0f172a 100%)",
              borderRadius: "10px",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#ffffff"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                <span style={{ background: "#e50914", color: "#fff", fontSize: "0.68rem", fontWeight: 900, padding: "2px 8px", borderRadius: "4px" }}>
                  {stickyAdBadge || "SPONSORED"}
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {stickyAdText || "Your Ad Text Here"}
                </span>
              </div>
              <span style={{ background: "#ffffff", color: "#0f172a", fontSize: "0.75rem", fontWeight: 800, padding: "4px 12px", borderRadius: "6px" }}>
                Explore Now ▶
              </span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleSaveStickyAd}
              disabled={stickyAdSaving}
              style={{
                background: "#e50914",
                color: "#ffffff",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "0.86rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(229, 9, 20, 0.35)",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              {stickyAdSaving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={16} />}
              Save Sticky Ad Settings
            </button>
          </div>
        </div>

        {/* Leaderboard Banner Advertisement Manager */}
        <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                🖼️ Main Leaderboard Ad Banner (मुख्य लीडरबोर्ड विज्ञापन बैनर)
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                Upload custom banner images (JPG, PNG, WEBP) or edit headlines for the full-width advertisement banner placed on the Home Page.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 800, color: leaderboardAdEnabled ? "#16a34a" : "#dc2626" }}>
                {leaderboardAdEnabled ? "ACTIVE (चालू)" : "DISABLED (बंद)"}
              </label>
              <button
                type="button"
                onClick={() => setLeaderboardAdEnabled(!leaderboardAdEnabled)}
                style={{
                  background: leaderboardAdEnabled ? "#16a34a" : "#cbd5e1",
                  color: "#ffffff",
                  border: "none",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontWeight: 800,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {leaderboardAdEnabled ? "Toggle Off" : "Toggle On"}
              </button>
            </div>
          </div>

          {/* Banner Graphic / Image Upload Section */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
              🖼️ Upload Leaderboard Banner Graphic Image (JPG, PNG, WEBP, GIF, SVG)
            </label>
            <p style={{ margin: "0 0 12px 0", fontSize: "0.78rem", color: "#64748b" }}>
              Upload a high-resolution banner image (recommended 1200x200 or 728x90) to display as a full-width ad banner graphic.
            </p>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <label style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "8px 18px",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
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

              <div style={{ flex: 1, minWidth: "220px" }}>
                <input
                  type="text"
                  value={leaderboardAdImage}
                  onChange={(e) => setLeaderboardAdImage(e.target.value)}
                  placeholder="Or enter image URL (https://... or /uploads/...)"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
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
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer"
                  }}
                >
                  Remove Image
                </button>
              )}
            </div>

            {leaderboardAdImage && (
              <div style={{ marginTop: "12px", background: "#ffffff", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <img src={leaderboardAdImage} alt="Leaderboard Ad Preview" style={{ width: "100%", maxHeight: "120px", objectFit: "cover", borderRadius: "6px" }} />
                <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700, display: "block", marginTop: "4px" }}>
                  ✓ Leaderboard Graphic Attached (Will display as full banner graphic on Homepage)
                </span>
              </div>
            )}
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

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "18px" }}>
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
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🔘 Button Text</label>
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

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleSaveStickyAd}
              disabled={stickyAdSaving}
              style={{
                background: "#e50914",
                color: "#ffffff",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "0.86rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(229, 9, 20, 0.35)",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              {stickyAdSaving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={16} />}
              Save All Advertisement Settings
            </button>
          </div>
        </div>

        {/* Social Media Links Control Box */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px" }}>
          <h4 style={{ margin: "0 0 16px 0", fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "8px" }}>
            <Share2 size={16} style={{ color: "#e50914" }} /> Social Media Links (सोशल मीडिया लिंक प्रबंधित करें)
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>📘 Facebook URL</label>
              <input
                type="text"
                placeholder="https://facebook.com/yourpage"
                value={socialFb}
                onChange={(e) => setSocialFb(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", color: "#0a0a0a" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🐦 Twitter / X URL</label>
              <input
                type="text"
                placeholder="https://twitter.com/yourhandle"
                value={socialTwitter}
                onChange={(e) => setSocialTwitter(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", color: "#0a0a0a" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🔴 YouTube Channel URL</label>
              <input
                type="text"
                placeholder="https://youtube.com/@yourchannel"
                value={socialYt}
                onChange={(e) => setSocialYt(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", color: "#0a0a0a" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>📸 Instagram URL</label>
              <input
                type="text"
                placeholder="https://instagram.com/yourprofile"
                value={socialInsta}
                onChange={(e) => setSocialInsta(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", color: "#0a0a0a" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSaveSocialLinks}
              style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: 800, fontSize: "0.86rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(229,9,20,0.2)" }}
            >
              ✓ Save Social Links
            </button>
          </div>
        </div>

        {/* Company & Custom Pages Footer Links Manager */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={18} style={{ color: "#e50914" }} /> Company Footer Links & Custom Pages (कंपनी / 'हमारे बारे में' फुटर लिंक)
            </h4>
            <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700, background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px" }}>
              {companyLinks.length} Active Footer Pages
            </span>
          </div>

          {/* Add New Link Form */}
          <form onSubmit={handleAddCompanyLink} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "16px", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr auto", gap: "10px", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>Hindi Name (e.g. हमारे बारे में)</label>
              <input
                type="text"
                placeholder="हमारे बारे में"
                value={newLinkHi}
                onChange={(e) => setNewLinkHi(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>English Name (e.g. About Us)</label>
              <input
                type="text"
                placeholder="About Us"
                value={newLinkEn}
                onChange={(e) => setNewLinkEn(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>Target URL / Route</label>
              <input
                type="text"
                placeholder="/#about or /about"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
              />
            </div>
            <button
              type="submit"
              style={{ background: "#0f172a", color: "#ffffff", border: "none", padding: "9px 18px", borderRadius: "6px", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={15} /> Add Link
            </button>
          </form>

          {/* Current Active Links List */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {companyLinks.map((link) => (
              <div key={link.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
                    {link.nameHi} <span style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: 600 }}>({link.nameEn})</span>
                  </div>
                  <span style={{ fontSize: "0.74rem", color: "#94a3b8", fontWeight: 600 }}>
                    Target: {link.href}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCompanyLink(link.id, link.nameHi)}
                  style={{ background: "#fee2e2", color: "#dc2626", border: "none", width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Remove Footer Link"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── ABOUT US PAGE CONTENT EDITOR ────────────────────────────────────────── */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderTop: "4px solid #e50914", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginTop: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FileText size={22} style={{ color: "#e50914" }} />
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                  हमारे बारे में पेज प्रबंधक (About Us Page Content Manager)
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Edit all text, mission, vision, ethics, address, email & phone numbers for /about page
                </span>
              </div>
            </div>
            <button
              onClick={handleSaveAboutData}
              style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(229, 9, 20, 0.3)" }}
            >
              <Check size={16} /> Save About Page
            </button>
          </div>

          <form onSubmit={handleSaveAboutData} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* 1. Hero Section */}
            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "18px" }}>
              <h4 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>1. Hero Banner Content (हीरो शीर्षक एवं विवरण)</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Tagline (Hindi)</label>
                  <input
                    type="text"
                    value={aboutData.heroTagHi}
                    onChange={(e) => setAboutData({ ...aboutData, heroTagHi: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Tagline (English)</label>
                  <input
                    type="text"
                    value={aboutData.heroTagEn}
                    onChange={(e) => setAboutData({ ...aboutData, heroTagEn: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Sub-description (Hindi)</label>
                  <textarea
                    rows={2}
                    value={aboutData.heroSubHi}
                    onChange={(e) => setAboutData({ ...aboutData, heroSubHi: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Sub-description (English)</label>
                  <textarea
                    rows={2}
                    value={aboutData.heroSubEn}
                    onChange={(e) => setAboutData({ ...aboutData, heroSubEn: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Mission & Vision */}
            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "18px" }}>
              <h4 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>2. Mission & Vision (मिशन और विज़न)</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Mission Description (Hindi)</label>
                  <textarea
                    rows={3}
                    value={aboutData.missionDescHi}
                    onChange={(e) => setAboutData({ ...aboutData, missionDescHi: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Mission Description (English)</label>
                  <textarea
                    rows={3}
                    value={aboutData.missionDescEn}
                    onChange={(e) => setAboutData({ ...aboutData, missionDescEn: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Vision Description (Hindi)</label>
                  <textarea
                    rows={3}
                    value={aboutData.visionDescHi}
                    onChange={(e) => setAboutData({ ...aboutData, visionDescHi: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Vision Description (English)</label>
                  <textarea
                    rows={3}
                    value={aboutData.visionDescEn}
                    onChange={(e) => setAboutData({ ...aboutData, visionDescEn: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Editorial Ethics & Newsroom Email */}
            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "18px" }}>
              <h4 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>3. Editorial Ethics & Newsroom Box (संपादकीय प्रतिबद्धता)</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Ethics Section Title (Hindi)</label>
                  <input
                    type="text"
                    value={aboutData.ethicsTitleHi}
                    onChange={(e) => setAboutData({ ...aboutData, ethicsTitleHi: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Ethics Section Title (English)</label>
                  <input
                    type="text"
                    value={aboutData.ethicsTitleEn}
                    onChange={(e) => setAboutData({ ...aboutData, ethicsTitleEn: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Newsroom Email Address</label>
                <input
                  type="email"
                  value={aboutData.newsroomEmail}
                  onChange={(e) => setAboutData({ ...aboutData, newsroomEmail: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>
            </div>

            {/* 4. Headquarters Address & Contacts */}
            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "18px" }}>
              <h4 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>4. Headquarters & Contact Helpline (मुख्य कार्यालय व संपर्क)</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Address (Hindi)</label>
                  <input
                    type="text"
                    value={aboutData.addressHi}
                    onChange={(e) => setAboutData({ ...aboutData, addressHi: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Address (English)</label>
                  <input
                    type="text"
                    value={aboutData.addressEn}
                    onChange={(e) => setAboutData({ ...aboutData, addressEn: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.76rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Email 1</label>
                  <input
                    type="text"
                    value={aboutData.contactEmail1}
                    onChange={(e) => setAboutData({ ...aboutData, contactEmail1: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.76rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Email 2</label>
                  <input
                    type="text"
                    value={aboutData.contactEmail2}
                    onChange={(e) => setAboutData({ ...aboutData, contactEmail2: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.76rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Phone Hotline 1</label>
                  <input
                    type="text"
                    value={aboutData.phone1}
                    onChange={(e) => setAboutData({ ...aboutData, phone1: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.76rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Phone Hotline 2</label>
                  <input
                    type="text"
                    value={aboutData.phone2}
                    onChange={(e) => setAboutData({ ...aboutData, phone2: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="submit"
                style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "12px 28px", borderRadius: "8px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(229, 9, 20, 0.35)" }}
              >
                <Check size={18} /> Save All About Page Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
